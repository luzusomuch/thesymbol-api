var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
	countryName: {
		type: String,
		required: true
	},
	countryCode: {
		type: String,
		required: true
	},
	rate: Number,
	icon: String,
  created_at: Date,
  updated_at: Date
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});
module.exports = DB_CONNECTION.model("currency", tableSchema);
