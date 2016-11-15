var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    url: String,
    status: 1,
    created_at: Date,
    updated_at: Date,
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Video", tableSchema);
