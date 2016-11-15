var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
		type: Schema.Types.ObjectId,
		ref: 'Product_catelog'
	},
    order: {
		type: Schema.Types.ObjectId,
		ref: 'Order'
	},
    quantity: {
		type: String
	},
    price: {
		type: Number
	},
    reason: {	
		type: String
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
    collection: 'return_products'
});
module.exports = DB_CONNECTION.model("Return_Products", tableSchema);
