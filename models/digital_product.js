var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var Schema = mongoose.Schema;
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
        type: String,
    }],
    product_videos: [{
        type: String,
    }],
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
    variants: [{
        name: String,
        quantity: String
    }],
    pricing: {
        original: Number,
        after_discount: Number,
        savings: Number,
        commission: Number,
        service_tax: Number,
    },
    licenses: [{
        id: Schema.Types.ObjectId,
        original: Number,
        after_discount: Number,
        savings: Number,
        commission: Number,
        service_tax: Number,
    }],
    status: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ["normal", "prime", "digital"],
        default: "digital"
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
    paid_by_buyer: {
        type: Boolean,
        default: false
    },
    ratings: [{
        type: Schema.Types.ObjectId,
        ref: 'Rating',
        index: true
    }],
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
    product.title = body.title || body.name;
    product.name = body.name;
    product.description = body.description;
    product.sku = body.sku || randomChar.create(32);
    product.images = body.images;
    product.variants = body.variants;
    product.pricing = {};
    product.shipping_details = {};
    product.long_description = body.long_description;

    product.quantity = body.quantity;
    product.pricing.original = 0;
    product.pricing.after_discount = 0;
    product.pricing.service_tax = 0;
    product.pricing.commission = 0;
    product.categories = [];
    if (body.subcategory)
        product.categories.push(body.subcategory);
    product.licenses = body.licenses ? body.licenses : [];
    product.categories.push(body.category);
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
    this.update(where, product, cb);
}
tableSchema.statics.addProduct = function(user_id, body, cb) {
    var product = {};
    product.created_by = user_id;
    product.title = body.name;
    product.name = body.name;
    product.description = body.description;
    product.sku = body.sku || randomChar.create(32);
    product.images = body.images;
    product.variants = body.variants;
    product.pricing = {};
    product.shipping_details = {};
    product.quantity = body.quantity;
    product.pricing.original = body.price;
    product.long_description = body.long_description;
    var selling_price_flag = (body.selling_price && body.selling_price != "");
    var service_tax_flag = (body.service_tax && body.service_tax != "");
    product.pricing.after_discount = selling_price_flag ? body.selling_price : body.price;
    product.pricing.service_tax = service_tax_flag ? body.service_tax : 0;
    product.pricing.commission = body.commission ? body.commission : 0;
    product.categories = [];
    if (body.subcategory)
        product.categories.push(body.subcategory);
    product.categories.push(body.category);
    product.licenses = body.licenses ? body.licenses : [];
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
    var Product_catelog = this.model("Product_catelog");
    new Product_catelog(product).save(cb);
}
module.exports = DB_CONNECTION.model("Product_catelog", tableSchema);
