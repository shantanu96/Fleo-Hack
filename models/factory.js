import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const factorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    isCompany: {
        type: Boolean,
        default: false
    },
    children: {
        type: [{ type: Schema.Types.ObjectId, ref: 'factory' }],
    },
    totalSales: {
        type: Number,
    },
    targetSales: {
        type: Number,
    },
}, { timestamps: true })

const Factory = new mongoose.model('factory', factorySchema);

export default Factory;