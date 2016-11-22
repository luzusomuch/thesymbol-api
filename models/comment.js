var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
	ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  objectId: Schema.Types.ObjectId,
  type: String, // Maybe Product, Shop or even if its a Comment
  text: {type: String, required: true},
  deleted: {type: Boolean, default: false},
  deletedByUserId: {type: Schema.Types.ObjectId, ref: 'User'},
  created_at: Date,
  updated_at: Date
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});
module.exports = DB_CONNECTION.model("Comment", tableSchema);
