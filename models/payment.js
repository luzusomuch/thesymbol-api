var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    transferred_amount: Number,
    transaction_type: {
      type: String,
      enum: ["refund", "payout"]
    },
    reason: String,
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = mongoose.model("Payment", tableSchema);
