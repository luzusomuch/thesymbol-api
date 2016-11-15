var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    countryCode: {
        type: String
    },
    countryName: {
        type: String
    },
    currencyCode: {
        type: String
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
module.exports = DB_CONNECTION.model("Country", tableSchema);
