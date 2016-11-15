var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    content: {
        type: String
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = mongoose.model("Page", tableSchema);
