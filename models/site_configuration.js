var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    title: String,
    units: [{
        type: String
    }],
    ships_in: [{
        type: String
    }],
    payment_gateway: [
      {
        email: String,
        name: String,
        mode: {
          type: String,
          default: "sandbox"
        }
      }
    ],
    social_links: [{
      name: String,
      url: String
    }],
    service_tax: Number,
    commission: Number,
    status: {
        type: Boolean,
        default: true
    },
    site_logo: {
        Ref: "Image",
        type: Schema.Types.ObjectId
    },
    fav_icon: {
        Ref: "Image",
        type: Schema.Types.ObjectId
    },
    overall_banner: {
        Ref: "Image",
        type: Schema.Types.ObjectId
    },
    contact: {
        email: String,
        phone: String,
        address: String
    },
    pricing_unit: String,
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_at: Date,
    updated_at: Date,
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
module.exports = DB_CONNECTION.model("Site_configuration", tableSchema);
