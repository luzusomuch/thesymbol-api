var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    name: {
        type: String
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    icon: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    description: {
        type: String
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    children: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    is_deleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Category", tableSchema);
