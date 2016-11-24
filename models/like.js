var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
	ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  objectId: {type: Schema.Types.ObjectId, required: true},
  type: {type:String, required: true}, // Maybe Product, Shop or even if its a Comment
  created_at: Date,
  updated_at: Date
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});
module.exports = DB_CONNECTION.model("Like", tableSchema);
