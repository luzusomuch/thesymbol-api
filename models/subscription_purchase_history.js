var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    bought_amount: Number,
    payment_id: String,
    payment_gateway: String,
    expiry: Date,
    status: {
      type: Boolean,
      default: true
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Subscription_purchase_history", tableSchema);
