var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product_catelog'
    },
    status: {
        type: Number,
        default: 1
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'wishlist'
});
module.exports = DB_CONNECTION.model("Wishlist", tableSchema);