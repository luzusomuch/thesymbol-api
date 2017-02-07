var solr = require('solr-client');
var client = solr.createClient({
	core: 'the_symbol_solr'
});
var _ = require('lodash');

var randomString = (len, charSet) => {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
};

exports.deleteSolrDocument = (product, callback) => {
	client.deleteByID(product._id, (err, resp) => {
		console.log(err);
		console.log(resp);
		client.softCommit(callback);
	});
};

exports.createOrUpdateSolrDocument = (product, callback) => {
	var coordinates = (product.coordinates[0] && product.coordinates[1]) ? [product.coordinates[1], product.coordinates[0]].toString() : [0, 0].toString();

	var item = {
		id: product._id,
		_id: product._id,
		name: product.name,
		title: product.title,
		sku: product.sku,
		description: product.description,
		long_description: product.long_description,
		banner_image: product.banner_image,
		terms_and_conditions: product.terms_and_conditions,
		images: product.images,
		product_audios: product.product_audios,
		source: product.source,

		shipping_details: 'parentDocumentShipping',
		pricing: 'parentDocumentPricing',
		meta: 'parentDocument',
		_childDocuments_:[{
			id: product._id+'_shipping_'+randomString(10),
			weight: product.shipping_details.weight,
			unit: product.shipping_details.unit,
			width: product.shipping_details.width,
			height: product.shipping_details.height,
			depth: product.shipping_details.depth,
			fee: product.shipping_details.fee,
			duration: product.shipping_details.duration,
			type: 'shipping'
		}, {
			id: product._id+'_pricing_'+randomString(10),
			original: product.pricing.original,
			after_discount: product.pricing.after_discount,
			savings: product.pricing.savings,
			commission: product.pricing.commission,
			service_tax: product.pricing.service_tax,
			type: 'pricing'
		}], 
		categories: product.categories,
		quantity: product.quantity,

		variants: 'parentDocument',
		type: product.type,
		is_deleted: product.is_deleted,
		is_active: product.is_active,
		status: product.status,
		paid_by_buyer: product.paid_by_buyer,
		streetNumber: product.streetNumber,
		streetName: product.streetName,
		city: product.city,
		state: product.state,
		country: product.country,
		primesubscription: product.primesubscription,
		created_at: product.created_at,
		updated_at: product.updated_at,
		created_by: product.created_by,
		coordinates: coordinates,
	};
	// add variants to _childDocuments_
	if (product.variants) {
		if (!item._childDocuments_) {
			item._childDocuments_ = [];
		}
		_.each(product.variants, (variant) => {
			item._childDocuments_.push({
				id: product._id+'_varian_'+randomString(10),
				_id: variant._id,
				name: variant.name,
				quantity: variant.quantity,
				original: variant.original,
				after_discount: variant.after_discount,
				savings: variant.savings,
				commission: variant.commission,
				service_tax: variant.service_tax,
				type: 'variant'
			});
		});
	}
	client.add(item, (err, success) => {
		console.log(err);
		console.log('mapping product success');
		console.log(success);
		client.softCommit(callback);
	});
};