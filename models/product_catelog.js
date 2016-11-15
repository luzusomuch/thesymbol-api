var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
var variantSchema = new Schema({
    name: String,
    quantity: Number,
    original: Number,
    after_discount: Number,
    savings: Number,
    commission: Number,
    service_tax: Number,
});
var licenseSchema = new Schema({
    license: {
        type: Schema.Types.ObjectId,
        ref: "License"
    },
    original: Number,
    after_discount: Number,
    savings: Number,
    commission: Number,
    service_tax: Number
});
var tableSchema = new Schema({
    sku: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    long_description: String,
    banner_image: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    terms_and_conditions: {
        type: String,
        default: null
    },
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }],
    product_audios: [{
        type: String
    }],
    product_videos: [{
        url: String,
    }],
    source: {
        type: Schema.Types.ObjectId,
        ref: 'Source'
    },
    manufacture_details: {
        model_number: String,
        release_date: Date
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
    meta: {
        title: String,
        description: String,
        keyword: String
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    }],
    quantity: Number,
    variants: [variantSchema],
    pricing: {
        original: Number,
        after_discount: Number,
        savings: Number,
        commission: Number,
        service_tax: Number,
    },
    licenses: [licenseSchema],
    type: {
        type: String,
        enum: ["normal", "prime", "digital"],
        default: "normal"
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    status: {
        type: Boolean,
        default: false
    },
    paid_by_buyer: {
        type: Boolean,
        default: false
    },
    ratings: [{
        type: Schema.Types.ObjectId,
        ref: 'Rating',
        index: true
    }],
    streetNumber: String,
    streetName: String,
    city: String,
    state: String,
    country: String,
    zipcode: String,
    coordinates: [Number],
    // location type
    type: {type: String, default: 'Point'},
    created_at: Date,
    updated_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
tableSchema.statics.updateProduct = function(user_id, id, body, cb) {
    var product = {};
    var where = {};
    where._id = id;
    product = body;
    product.title = body.title || body.name;
    product.name = body.name;
    product.description = body.description;
    product.sku = body.sku || randomChar.create(32);
    product.images = body.images;
    product.shipping_details = {};
    product.long_description = body.long_description;
    product.quantity = body.quantity;
    product.categories = [];
    if (body.subcategory)
        product.categories.push(body.subcategory);
    product.pricing = body.pricing ? body.pricing : {
        original: 0,
        after_discount: 0,
        savings: 0,
        commission: 0,
        service_tax: 0,
    };
    product.licenses = body.licenses ? body.licenses : [];
    product.variants = body.variants ? body.variants : [];
    product.categories.push(body.category);
    product.shipping_details.weight = body.weight ? body.weight : 0;
    product.shipping_details.fee = body.shipping_fee ? body.shipping_fee : 0;
    product.shipping_details.duration = body.ship_duration ? body.ship_duration : 0;
    product.shipping_details.unit = body.unit ? body.unit : "g";
    product.paid_by_buyer = body.paid_by ? body.paid_by : false;
    product.type = body.type ? body.type : "normal";
    product.source = body.source ? body.source : null;
    product.product_videos = body.product_videos ? body.product_videos : [];
    product.terms_and_conditions = body.terms_and_conditions ? body.terms_and_conditions : null;
    product.meta = body.meta ? body.meta : {
        title: null,
        description: null,
        keyword: null
    };
    product.streetNumber = body.streetNumber ? body.streetNumber : null;
    product.streetName = body.streetName ? body.streetName : null;
    product.city = body.city ? body.city : null;
    product.state = body.state ? body.state : null;
    product.country = body.country ? body.country : null;
    product.zipcode = body.zipcode ? body.zipcode : null;
    product.coordinates = (body.lng && body.lat) ? [body.lng, body.lat] : [];
    this.update(where, product, {upsert: true}, cb);
}
tableSchema.statics.addProduct = function(user_id, body, cb) {
    var product = {};
    product.created_by = user_id;
    product.title = body.name;
    product.name = body.name;
    product.description = body.description;
    product.sku = body.sku || randomChar.create(32);
    product.images = body.images;
    product.pricing = {};
    product.shipping_details = {};
    product.quantity = body.quantity;
    product.long_description = body.long_description;
    product.categories = [];
    if (body.subcategory)
        product.categories.push(body.subcategory);
    product.categories.push(body.category);
    product.pricing = body.pricing ? body.pricing : {
        original: 0,
        after_discount: 0,
        savings: 0,
        commission: 0,
        service_tax: 0,
    };
    product.licenses = body.licenses ? body.licenses : [];
    product.variants = body.variants ? body.variants : [];
    product.product_videos = body.product_videos ? body.product_videos : [];
    product.source = body.source ? body.source : null;
    product.type = body.type ? body.type : "normal";
    product.shipping_details.weight = body.weight ? body.weight : 0;
    product.shipping_details.fee = body.shipping_fee ? body.shipping_fee : 0;
    product.shipping_details.duration = body.ship_duration ? body.ship_duration : 0;
    product.shipping_details.unit = body.unit ? body.unit : "g";
    product.paid_by_buyer = body.paid_by ? body.paid_by : false;
    product.terms_and_conditions = body.terms_and_conditions ? body.terms_and_conditions : null;
    product.meta = body.meta ? body.meta : {
        title: null,
        description: null,
        keyword: null
    };
    product.streetNumber = body.streetNumber ? body.streetNumber : null;
    product.streetName = body.streetName ? body.streetName : null;
    product.city = body.city ? body.city : null;
    product.state = body.state ? body.state : null;
    product.country = body.country ? body.country : null;
    product.zipcode = body.zipcode ? body.zipcode : null;
    product.coordinates = (body.lng && body.lat) ? [body.lng, body.lat] : [];
    var Product_catelog = this.model("Product_catelog");
    new Product_catelog(product).save(cb);
}
module.exports = DB_CONNECTION.model("Product_catelog", tableSchema);
