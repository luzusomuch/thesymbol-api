var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    title: {
      type: String,
      unique: true
    },
    description: String,
    features: [String],
    type: {
        type: String,
        enum: ["days", "weeks", "months", "years"],
        default: "months"
    },
    numbers: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        default: 0
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
module.exports = DB_CONNECTION.model("Subscription", tableSchema);
