var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    guest_token: {
        type: String
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product_catelog'
    },
    product_variant: {
        type: Schema.Types.ObjectId,
        default: null
    },
    product_license: {
        type: Schema.Types.ObjectId,
        default: null
    },
    product_quantity: Number,
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Cart", tableSchema);
