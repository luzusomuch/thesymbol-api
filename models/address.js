var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    first_name: {
        type: String,
        default: null
    },
    last_name: {
        type: String,
        default: null
    },
    name: {
        type: String,
        default: null
    },
    pincode: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    locality: {
        type: String,
        default: null
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Address", tableSchema);
