var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    name: String,
    description: String,
    code: {
      type: String,
      unique: true
    },
    uses: Number,
    used: {
      type: Number,
      default: 0
    },
    amount: Number,
    type: {
      type: Number,
      default: 0,
      enum: [0/* exact amount */, 1 /* percent */]
    },
    start: Date,
    expiry: Date,
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
module.exports = DB_CONNECTION.model("Coupon", tableSchema);
