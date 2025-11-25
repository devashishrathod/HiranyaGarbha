const mongoose = require('mongoose')

const SubscriptionHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    }
}, { timestamps: true })
const SubscriptionHistory = mongoose.model('SubscriptionHistory', SubscriptionHistorySchema)
module.exports = SubscriptionHistory