var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    guest_token: {
        type: String
    },
    status: {
        type: Number,
        default: 1
    },
    total_price: {
        type: Number
    },
    total_shipping: {
        type: Number
    },
    total_tax: {
        type: Number
    },
    coupon: {
      _id: {
          type: Schema.Types.ObjectId,
          ref: 'Coupon'
      },
      code: String,
      discount: Number
    },
    products: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Product_catelog'
        },
        shop_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        variant: {
            type: String,
            default: null
        },
        license: {
            type: Schema.Types.ObjectId,
            ref: "License",
            default: null
        },
        download_token: {
          type: String,
          default: null
        },
        quantity: Number,
        price: Number,
        pricing: {
            original: Number,
            after_discount: Number,
            savings: Number,
            commission: Number,
            service_tax: Number
        },
        shipping_details: {
            weight: {
                type: Number,
                default: 0
            },
            unit: String,
            width: {
                type: Number,
                default: 0
            },
            height: {
                type: Number,
                default: 0
            },
            depth: {
                type: Number,
                default: 0
            },
            fee: {
                type: Number,
                default: 0
            },
            duration: {
                type: String,
                default: 0
            }
        },
        status: {
            type: String,
            default: "Not Approved"
        },
        tracking: {
            company: {
                type: String,
                default: null
            },
            tracking_number: {
                type: String,
                default: null
            },
            status: {
                type: String,
                default: "Approved"
            },
            estimated_delivery: {
                type: Date,
                default: null
            }
        }
    }],
    payment: {
        method: {
            type: String,
            default: "paypal"
        },
        status: String,
        transaction_id: String
    },
    shipping: {
        name: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
        phone: String
    },
    billing: {
        name: String,
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        phone: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'orders'
});
module.exports = DB_CONNECTION.model("Order", tableSchema);
