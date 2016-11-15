var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    product : {
        type: Schema.Types.ObjectId,
        ref: 'Product_catelog',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stars: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: null
    },
    comment: {
      type: String,
      default: null
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    is_deleted: {
      type: Number,
      default: 0
    },
    status: {
      type: Number,
      default: 1
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Rating", tableSchema);
