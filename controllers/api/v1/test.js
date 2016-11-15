var pricing = {};
db.product_catelogs.find({
    variants: {
        $ne: []
    }
}).forEach(function(item) {
    var temp_variant = [];
    var a = {};
    a = item.pricing;
    item.variants.forEach(function(variant) {
        variant["original"] = a.original;
        variant["after_discount"] = a.after_discount;
        variant["commission"] = a.commission;
        temp_variant.push(variant);
    });
    print(JSON.stringify(temp_variant));
})
