var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product_catelog',
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    stars: {
      type: Number,
      default: 0
    },
    comment: {
      type: String,
      default: null
    },
    status: {
      type: Number,
      default: 1
    },
    is_deleted: {
      type: Number,
      default: 0
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'ratings'
});
module.exports = DB_CONNECTION.model("Rating", tableSchema);
