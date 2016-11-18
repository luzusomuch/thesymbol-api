'use strict';

var ROOT_FOLDER = __dirname;
var mongoose = require("mongoose");
var solr = require('solr-client');
var async = require('async');
var _ = require('lodash');
require("./config/db");

mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

var Product = require(ROOT_FOLDER + "/models/product_catelog");
var client = solr.createClient({
	core: 'the_symbol_solr'
});

var randomString = (len, charSet) => {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
};

Product.find({}, (err, products) => {
	if (err) {
		console.log('error when loading all products: '+ err);
		process.exit(-1);
	}

	// optimize Solr index
	client.optimize({
		
	}, (err, resp) => {
		if (err) {
			console.log('error when optimize: '+ err);
			process.exit(-1);		
		} else {
			console.log('optimize success');
			
			// remove old product
			let query = client.createQuery()
			.q({'*': '*'})
		 	.start(0)
		 	.rows(1000);

			client.search(query, (err, data) => {
				if (err) {
					console.log('error when get old products :' + err);
					process.exit(-1);
				} else {
					async.each(data.response.docs, (doc, callback) => {
						client.deleteByID(doc.id, callback);
					}, () => {
						client.softCommit(() => {
							// sync new product to Solr
							async.each(products, (product, callback) => {
								let item = {
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

									// manufacture_details: 'parentDocument',
									// _childDocuments_:[{
									// 	id: randomString(10),
									// 	model_number: product.manufacture_details.model_number,
									// 	release_date: product.manufacture_details.release_date,
									// }], 

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
									}, {
										id: product._id+'_pricing_'+randomString(10),
										original: product.pricing.original,
										after_discount: product.pricing.after_discount,
										savings: product.pricing.savings,
										commission: product.pricing.commission,
										service_tax: product.pricing.service_tax,
									}], 
									categories: product.categories,
									quantity: product.quantity,

									variants: 'parentDocument',
									// licenses: 'parentDocument',
									// _childDocuments_: product.licenses,
									type: product.type,
									// created_by: product.created_by,
									is_deleted: product.is_deleted,
									is_active: product.is_active,
									status: product.status,
									paid_by_buyer: product.paid_by_buyer,
									// // ratings: product.ratings,
									streetNumber: product.streetNumber,
									streetName: product.streetName,
									city: product.city,
									state: product.state,
									country: product.country,
									// zipcode: (product.zipcode) ? product.zipcode : null,
									coordinates: product.coordinates,
									primesubscription: product.primesubscription,
									created_at: product.created_at,
									updated_at: product.updated_at
								};
								// add variants to _childDocuments_
								if (product.variants) {
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
										});
									});
								}
								client.add(item, callback);
							}, (err) => {
								if (err) {
									console.log('Error when sync data');
									console.log(err);
									process.exit(-1);
								} else {
									client.softCommit(() => {
										console.log('sync data completed');
										process.exit(-1);
									});
								}
							});
						});

						
					});
				}
			});
		}
	});
});

