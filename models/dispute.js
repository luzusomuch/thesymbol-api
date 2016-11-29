var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
	ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	productId: {type: Schema.Types.ObjectId, ref: 'Product_catelog', required: true},
	shopId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	orderId: {type: Schema.Types.ObjectId, ref: 'Order', required: true},
	messages: [{
		createdAt: Date,
		text: String,
		deleted: {type: Boolean, default: false},
		ownerId: {type: Schema.Types.ObjectId, ref: 'User'}
	}],
	// status separate to 2 case
	// buyer: close and raiseClaim
	// seller: refund and raiseClaim
	status: {type: String, enum: ['close', 'refund', 'raiseClaim', 'open'], default: 'open'},
	created_at: Date,
  updated_at: Date
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});
module.exports = DB_CONNECTION.model("Dispute", tableSchema);
