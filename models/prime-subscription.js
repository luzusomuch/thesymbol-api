var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
		radius: Number,
		hours: Number,
		extra_pay: Number,
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Prime_subscription", tableSchema);
