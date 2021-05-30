import express from 'express';
import Factory from '../models/factory';

const router = express.Router();

router.post('/create', async (req, res) => {
    const fields = {};
    fields.name = req.body.name;
    fields.isCompany = req.body.isCompany;
    fields.totalSales = 0;
    fields.targetSales = 0;
    if (req.body.parent != '')
        fields.parent = req.body.parent;
    else
        fields.parent = null;
    const factory = await new Factory(fields).save();

    // add children in parent
    if (req.body.parent != null && req.body.parent != '') {
        const result = await Factory.findByIdAndUpdate(req.body.parent, {
            $push: {
                children: factory._id,
            }
        });
        console.log(result);
    }
    res.status(200).json(factory);
});

router.get('/:factoryId', async (req, res) => {
    const id = req.params.factoryId;
    const factory = await Factory.findById(id);

    res.status(200).json(factory);
});

router.get('/all/:factoryId', async (req, res) => {
    const root = req.params.factoryId;
    const factories = await populateChildren(Factory, root);

    res.status(200).json(factories);
});

router.post('/update/target-sale/:factoryId', async (req, res) => {
    const id = req.params.factoryId;
    const targetSales = req.body.targetSales;
    const factories = await updateSalesRecord(Factory, id, targetSales);
    res.status(200).json(factories);
});

const populateChildren = (coll, _id) => // takes a collection and a document id and returns this document fully nested with its children
    coll.findOne({ _id })
        .then(function (o) {
            if (!o.children) return o;
            return Promise.all(o.children.map(i => populateChildren(coll, i)))
                .then(children => Object.assign(o, { children }))
        });

const updateSalesRecord = async (coll, _id, incrementValue) => {
    const fact = await coll.findOne({ _id });
    if (fact) {
        await fact.updateOne({ $inc: { targetSales: incrementValue } });
        return updateSalesRecord(coll, fact.parent, incrementValue);
    } else {
        return fact;
    }
}

export default router;