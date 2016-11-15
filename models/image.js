var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    url: String,
    c_url: String,
    path: String,
    c_path: String,
    c_name: String,
    cdn: {
        public_id: {
            type: String,
            default: null
        },
        version: {
            type: String,
            default: null
        },
        signature: {
            type: String,
            default: null
        },
        width: {
            type: String,
            default: null
        },
        height: {
            type: String,
            default: null
        },
        format: {
            type: String,
            default: null
        },
        resource_type: {
            type: String,
            default: null
        },
        created_at: Date,
        tags: [],
        bytes: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: null
        },
        etag: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
        secure_url: {
            type: String,
            default: null
        },
        original_filename: {
            type: String,
            default: null
        }
    },
    status: {
        type: Boolean,
        default: true
    },
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
module.exports = DB_CONNECTION.model("Image", tableSchema);
