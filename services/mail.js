var _h_common = require(ROOT_FOLDER + "/helpers/common");
var _h_product = require(ROOT_FOLDER + "/helpers/product");
var EmailTemplate = require(ROOT_FOLDER + "/models/email_template");
var MobileTemplate = require(ROOT_FOLDER + "/models/mobile_template");
var Settings = require(ROOT_FOLDER + "/models/site_configuration");
var globals = require(ROOT_FOLDER + "/config/globals");
var sms_gateway = require(ROOT_FOLDER + "/config/sms_gateway");
var twilio = require('twilio');
var async = require("async");
var fs = require("fs");
var mandrill = require('node-mandrill')(globals.mail.mandrill);
var _self = exports;

//config/globals.js configuration
var user_url = globals.url.user,
    seller_url = globals.url.seller,
    admin_url = globals.url.admin,
    site_title = globals.site_title,
    admin_email = globals.admin_email;

//config/sms_gateway.js configuration
var twillio_credentials = sms_gateway[globals.environment]["twillio"];
var client = new twilio.RestClient(twillio_credentials.accountSid, twillio_credentials.authToken);

var hbs = require("express-hbs");
hbs.registerHelper('getShippingTotal', function(orders) {
    var shippingTotal = 0;
    for (var order in orders) {
        for (var product in orders[order].products) {
            shippingTotal += parseInt(orders[order].products[product].ship_amount);
        }
    }
    return new hbs.SafeString(shippingTotal);
});
hbs.registerHelper('getSubTotal', function(orders) {
    var subTotal = 0;
    for (var order in orders) {
        for (var product in orders[order].products) {
            subTotal += parseInt(orders[order].products[product].amount);
        }
    }
    return new hbs.SafeString(subTotal);
});
hbs.registerHelper('orderTotal', function(orders) {
    var total = 0;
    for (var order in orders) {
        total += parseInt(orders[order].total_price);
    }
    return new hbs.SafeString(total);
});
hbs.registerHelper('multiply', function(qty, price) {
    return new hbs.SafeString(qty * price);
});
exports.parseTemplate = function(template, data) {
    var compiledData = hbs.compile(template);
    return compiledData(data);
}
exports.sendMessage = function(number, msg, cb) {
    client.messages.create({
        body: msg,
        to: '+918098182885', // Text this number
        from: twillio_credentials.from // From a valid Twilio number
    }, cb);
};
exports.sendMail = function(from, to, sub, html, text, name, cb) {
    mandrill('/messages/send', {
        message: {
            to: [{
                email: to,
                name: name
            }, {
                email: "vivek@provenlogic.net",
                name: "vivek"
            }],
            from_email: admin_email,
            subject: sub,
            html: html
        }
    }, cb);
};
exports.findEmailTemplate = function(id, cb) {
    return function(cb) {
        EmailTemplate.findOne({
            _id: id
        }, cb);
    }
};
exports.sendNotificationToSocialUser = function(user, cb) {
    EmailTemplate.findOne({
        _id: '57f360f904967b0038e1606f'
    }, function(err, result) {
        if (err) return cb(err);
        if (result) {
            var template = _self.parseTemplate(result.content, {
                name: user.name,
                site_title: site_title,
                password: user.password
            });
            _self.sendMail(admin_email,
                user.email,
                result.subject,
                template,
                "text");
        }
    });
};
exports.sendStatusUpdateMail = function(user, status, cb) {
    async.waterfall([
        function(pcb) {
            EmailTemplate.findOne({
                _id: "57cea2fbb77b1fb3387e5a99"
            }, pcb);
        },
        function(eTemplate, pcb) {
            MobileTemplate.findOne({
                _id: "57cea2fbb77b1fb3387e5a99"
            }, function(err, mTemplate) {
                pcb(null, eTemplate, mTemplate);
            });
        },
        function(eTemplate, mTemplate, pcb) {
            _h_common.getUserById(user, function(err, user) {
                pcb(err, eTemplate, mTemplate, user)
            });
        },
        function(eTemplate, mTemplate, user, cb) {
            if (eTemplate && mTemplate) {
                var Objects = {};
                var statusD = status == true ? "activated" : "deactivated";
                Objects['eTemplate'] = _self.parseTemplate(eTemplate.content, {
                    name: user.name,
                    status: statusD
                });
                Objects['subject'] = eTemplate.subject;
                Objects['mTemplate'] = _self.parseTemplate(mTemplate.content, {
                    name: user.name,
                    status: statusD
                });
                Objects['user'] = user;
                cb(null, Objects);
            } else {
                cb({message: 'Template not found', errorCode: 404});
            }
        }
    ], function(err, Objects) {
        user = Objects["user"];
        _self.sendMail(admin_email,
            user.email,
            Objects['subject'],
            Objects['eTemplate'],
            "text"
        );
        if (!user.mobile_verified) {
            _self.sendMessage(
                user.phone,
                Objects['mTemplate'],
                function(err, result) {
                    console.log(err)
                    console.log(result)
                }
            );
        }
    });
};
exports.sendPayNotification = function(pay, cb) {
    async.waterfall([
        function(pcb) {
            EmailTemplate.findOne({
                _id: "57cea43eb77b1fb3387e5a9a"
            }, pcb);
        },
        function(eTemplate, pcb) {
            MobileTemplate.findOne({
                _id: "57cea43eb77b1fb3387e5a9a"
            }, function(err, mTemplate) {
                pcb(null, eTemplate, mTemplate);
            });
        },
        function(eTemplate, mTemplate, pcb) {
            _h_common.getUserById(pay.user, function(err, user) {
                pcb(err, eTemplate, mTemplate, user)
            });
        },
        function(eTemplate, mTemplate, user, cb) {
            var Objects = {};
            var statusD = status == true ? "activated" : "deactivated";
            Objects['eTemplate'] = _self.parseTemplate(eTemplate.content, {
                name: user.name,
                email: user.email,
                type: pay.transaction_type,
                amount: pay.transferred_amount
            });
            Objects['subject'] = eTemplate.subject;
            Objects['mTemplate'] = _self.parseTemplate(mTemplate.content, {
                name: user.name,
                email: user.email,
                type: pay.transaction_type,
                amount: pay.transferred_amount
            });
            Objects['user'] = user;
            cb(null, Objects);
        }
    ], function(err, Objects) {
        user = Objects["user"];
        _self.sendMail(admin_email,
            user.email,
            pay.transaction_type + " Notification",
            Objects['eTemplate'],
            "text"
        );
        if (!user.mobile_verified) {
            _self.sendMessage(
                user.phone,
                Objects['mTemplate'],
                function(err, result) {
                    console.log(err)
                    console.log(result)
                }
            );
        }
    });
};
exports.sendForgotPasswordLink = function(user, cb) {
    EmailTemplate.findOne({
        _id: '57ce915a66ff4e8668d4d863'
    }, function(err, result) {
        if (err) return cb(err);
        user.link = user_url + "/#/newpassword/" + user._id;
        var template = _self.parseTemplate(result.content, user);
        _self.sendMail(admin_email,
            user.email,
            result.subject,
            template,
            "text", cb
        )
    })
};
exports.sendRegistrationNotification = function(body, cb) {
    EmailTemplate.findOne({
        _id: '57ce739f57cebf341e41ce70'
    }, function(err, result) {
        if (err) return cb(err);
        var link = user_url + "/#!/confirmation/" + body._id;
        var template = _self.parseTemplate(result.content, {
            name: body.name,
            email: body.email,
            link: link,
            site_title: site_title
        });
        _self.sendMail(admin_email,
            body.email,
            result.subject,
            template,
            "text", cb
        )
    })
}
exports.sendRegistrationNotificationToSeller = function(body, cb) {
    EmailTemplate.findOne({
        _id: '57ce739f57cebf341e41ce70'
    }, function(err, result) {
        if (err) return cb(err);
        var link = seller_url + "/#!/confirmation/" + body._id;
        var template = _self.parseTemplate(result.content, {
            name: body.name,
            email: body.email,
            link: link,
            site_title: site_title
        });
        _self.sendMail(admin_email,
            body.email,
            result.subject,
            template,
            "text", cb
        )
    })
}
exports.sendProductStatusNotification = function(user, product, status, cb) {
    var productData = {};
    var userData = {};
    async.waterfall([
        function(s_call) {
            _h_common.getUserById(user, function(err, user) {
                userData = user;
                s_call(null, null);
            });
        },
        function(data, s_call) {
            _h_common.getProductData(product, function(err, product) {
                productData = product;
                s_call(null, null);
            });
        },
        function(data, s_call) {
            EmailTemplate.findOne({
                _id: "57d930853a2ebc4d38c09551"
            }, s_call);
        },
        function(eSTemplate, s_call) {
            MobileTemplate.findOne({
                _id: "57d930853a2ebc4d38c09551"
            }, function(err, mSTemplate) {
                s_call(null, eSTemplate, mSTemplate);
            });
        },
        function(eSTemplate, mSTemplate, s_call) {
            var eTemplate = _self.parseTemplate(eSTemplate.content, {
                name: productData.created_by.name,
                email: productData.created_by.email,
                product_name: productData.name,
                user_name: userData.name,
                status: status
            });
            var mTemplate = _self.parseTemplate(mSTemplate.content, {
                name: productData.created_by.name,
                email: productData.created_by.email,
                product_name: productData.name,
                user_name: userData.name,
                status: status
            });
            _self.sendMail(admin_email,
                productData.created_by.email,
                eSTemplate["subject"],
                eTemplate,
                "text",
                function() {}
            );
            if (!user.mobile_verified) {
                _self.sendMessage(
                    productData.created_by.phone,
                    mTemplate,
                    function(err, result) {
                        console.log(err)
                        console.log(result)
                    }
                );
            }
            s_call(null, null);
        },
        function(s_call) {
            EmailTemplate.findOne({
                _id: "57d92ff93a2ebc4d38c09550"
            }, s_call);
        },
        function(eUTemplate, s_call) {
            MobileTemplate.findOne({
                _id: "57d930853a2ebc4d38c09551"
            }, function(err, mSTemplate) {
                s_call(null, eUTemplate, mUTemplate);
            });
        },
        function(eUTemplate, mUTemplate, s_call) {
            var eTemplate = _self.parseTemplate(eUTemplate.content, {
                name: productData.created_by.name,
                email: productData.created_by.email,
                product_name: productData.name,
                user_name: userData.name,
                status: status
            });
            var mTemplate = _self.parseTemplate(mUTemplate.content, {
                name: productData.created_by.name,
                email: productData.created_by.email,
                product_name: productData.name,
                user_name: userData.name,
                status: status
            });
            _self.sendMail(admin_email,
                userData.email,
                eUTemplate.subject,
                eTemplate,
                "text",
                function() {}
            );
            if (!user.mobile_verified) {
                _self.sendMessage(
                    userData.phone,
                    mTemplate,
                    function(err, result) {
                        console.log(err)
                        console.log(result)
                    }
                );
            }
            s_call(null, null);
        }
    ], cb);
}
exports.sendProductStatusMail = function(id, status, cb) {
    async.waterfall([
        function(pcb) {
            EmailTemplate.findOne({
                _id: "57cea705365771df4c4041f8"
            }, pcb);
        },
        function(eTemplate, pcb) {
            MobileTemplate.findOne({
                _id: "57cea705365771df4c4041f8"
            }, function(err, mTemplate) {
                pcb(null, eTemplate, mTemplate);
            });
        },
        function(eTemplate, mTemplate, pcb) {
            _h_common.getProductData(id, function(err, product) {
                pcb(err, eTemplate, mTemplate, product)
            });
        },
        function(eTemplate, mTemplate, product, cb) {
            var Objects = {};
            var statusD = status == true ? "activated" : "deactivated";
            if (eTemplate) {
                Objects['eTemplate'] = _self.parseTemplate(eTemplate.content, {
                    name: product.created_by.name,
                    email: product.created_by.email,
                    product_name: product.name,
                    status: statusD
                });
                Objects['subject'] = eTemplate.subject;
            }
            if (mTemplate) {
                Objects['mTemplate'] = _self.parseTemplate(mTemplate.content, {
                    name: product.created_by.name,
                    email: product.created_by.email,
                    product_name: product.name,
                    status: statusD
                });
            }
            Objects['product'] = product;
            cb(null, Objects);
        }
    ], function(err, Objects) {
        if (err) {
            return cb();
        }
        console.log('start sending email');
        product = Objects['product'];
        _self.sendMail(admin_email,
            product.created_by.email,
            Objects['subject'],
            Objects['eTemplate'],
            "text"
        );
        if (!product.created_by.mobile_verified && Objects['mTemplate']) {
            _self.sendMessage(
                product.created_by.phone,
                Objects['mTemplate'],
                function(err, result) {
                    console.log(err)
                    console.log(result);
                    return cb();
                }
            );
        } else {
            return cb();
        }
    });
}
exports.sendOrderPlacedNotification1 = function(order_id, cb) {
    var settings = {};
    _h_product.getOrder(order_id)(function(err, orders) {
        async.series([
            function(parCal) {
                Settings.findOne({}, function(err, result) {
                    settings = result;
                    parCal();
                })
            },
            function(parCal) {
                async.each(orders, function(item, callback) {
                    var template = _self.parseTemplate(sellerOrderTemplate(), item);
                    _self.sendMail(admin_email,
                        item.seller.email,
                        "User has purchased your product",
                        template,
                        "text"
                    );
                    callback();
                }, parCal);
            },
            function(parCal) {
                var template = adminOrderTemplate(orders);
                _self.sendMail(admin_email,
                    settings.contact.email,
                    "User made a order",
                    template,
                    "text"
                );
                parCal();
            },
            function(parCal) {
                var template = adminOrderTemplate(orders);
                _self.sendMail(admin_email,
                    orders[0].user.email,
                    "You have made a order",
                    template,
                    "text"
                );
                parCal();
            }
        ], cb);
    });
}
exports.forgotPasswordMail = function(id, password, cb) {
    EmailTemplate.findOne({
        _id: '57d016ad883f2a701aa8817d'
    }, function(err, result) {
        if (err) return cb(err);
        _h_common.getUserById(id, function(err, user) {
            var template = _self.parseTemplate(result.content, {
                name: user.name,
                password: password
            });
            _self.sendMail(admin_email,
                user.email,
                result.subject,
                template,
                "text", cb
            );
        });
    });
}
exports.sendResetPasswordMail = function(id, cb) {
    EmailTemplate.findOne({
        _id: '57d01836883f2a701aa88180'
    }, function(err, result) {
        if (err) return cb(err);
        _h_common.getUserById(id, function(err, user) {
            var template = _self.parseTemplate(result.content, {
                name: user.name
            });
            _self.sendMail(admin_email,
                user.email,
                result.subject,
                template,
                "text", cb
            );
        });
    });
}
exports.sendVerificationSuccessMail = function(id, cb) {
    EmailTemplate.findOne({
        _id: '57d01286f495aa700e22714e'
    }, function(err, result) {
        if (err) return cb(err);
        _h_common.getUserById(id, function(err, user) {
            var template = _self.parseTemplate(result.content, {
                name: user.name
            });
            _self.sendMail(admin_email,
                user.email,
                result.subject,
                template,
                "text", cb
            );
        });
    });
}

exports.sendDisputeEmail = function(body, callback) {
    fs.readFile(ROOT_FOLDER + "/views/email_templates/dispute_email.html", 'utf8', function(err, result) {
        if (err) {
            console.log('Error when send dispute email');
            return callback();
        }
        var template = _self.parseTemplate(result, {
            user: body.user,
            product: body.product,
            orderId: body.orderId,
        });
        _self.sendMail(admin_email,
            body.user.email,
            "User has create new dispute",
            template,
            "text"
        );
        callback();
    });
}

exports.sendDisputeEmailToAdmin = function(body, callback) {
    fs.readFile(ROOT_FOLDER + "/views/email_templates/dispute_email_to_admin.html", 'utf8', function(err, result) {
        if (err) {
            console.log('Error when send dispute email');
            return callback();
        }
        var template = _self.parseTemplate(result, {
            user: body.user,
            product: body.product,
            orderId: body.orderId,
        });
        _self.sendMail(admin_email,
            body.user.email,
            "Raised claim dispute with order id " + body.orderId,
            template,
            "text"
        );
        callback();
    });
}

var adminOrderTemplate = function(orders) {
    var html = "";
    var grand_total = 0;
    html += '<p>Hi Admin,</p>';
    html += '<p>' + orders[0].user.name + '  has purchased following items.</p>';
    html += '<p>&nbsp;</p>';
    html += '<table border="1" cellpadding="1" cellspacing="1" style="width:500px">';
    html += '<tbody>';
    html += '<tr>';
    html += '<td>Product Name</td>';
    html += '<td>Price</td>';
    html += '<td>Shipping Amount</td>';
    html += '<td>Quantity</td>';
    html += '<td>Total</td>';
    html += '</tr>';
    orders.forEach(function(item) {
        html += '<tr>';
        html += '<td colspan="3"><b>Seller Name</b></td>';
        html += '<td colspan="2">' + item.seller.name + '</td>';
        html += '</tr>';
        item.products.forEach(function(product) {
            html += '<tr>';
            html += '<td>' + product.name + '</td>';
            html += '<td>' + product.amount + '</td>';
            html += '<td>' + product.ship_amount + '</td>';
            html += '<td>' + product.qty + '</td>';
            html += '<td>' + product.total_amount + '</td>';
            html += '</tr>';
            grand_total += product.total_amount;
        })
    })
    html += '</tbody>';
    html += '</table>';
    html += '<p>&nbsp;</p>';
    html += '<p>Grand Total ' + grand_total + '</p>';
    return html;
}
var userOrderTemplate = function(orders) {
    var html = "";
    var grand_total = 0;
    html += '<p>Hi ' + orders[0].user.name + ',</p>';
    html += '<p>You have purchased following items.</p>';
    html += '<p>&nbsp;</p>';
    html += '<table border="1" cellpadding="1" cellspacing="1" style="width:500px">';
    html += '<tbody>';
    html += '<tr>';
    html += '<td>Product Name</td>';
    html += '<td>Price</td>';
    html += '<td>Shipping Amount</td>';
    html += '<td>Quantity</td>';
    html += '<td>Total</td>';
    html += '</tr>';
    orders.forEach(function(item) {
        html += '<tr>';
        html += '<td colspan="3"><b>Seller Name</b></td>';
        html += '<td colspan="2">' + item.seller.name + '</td>';
        html += '</tr>';
        item.products.forEach(function(product) {
            html += '<tr>';
            html += '<td>' + product.name + '</td>';
            html += '<td>' + product.amount + '</td>';
            html += '<td>' + product.ship_amount + '</td>';
            html += '<td>' + product.qty + '</td>';
            html += '<td>' + product.total_amount + '</td>';
            html += '</tr>';
            grand_total += product.total_amount;
        })
    })
    html += '</tbody>';
    html += '</table>';
    html += '<p>&nbsp;</p>';
    html += '<p>Grand Total ' + grand_total + '</p>';
    return html;
}
var sellerOrderTemplate = function() {
    var html = "";
    html += '<p>Hi {{seller.name}},</p>';
    html += '<p>User <strong>{{user.name}}</strong> has purchased following products</p>';
    html += '<table border="1" cellpadding="1" cellspacing="1" style="width:500px">';
    html += '<tbody>';
    html += '<tr>';
    html += '<td>Product Name</td>';
    html += '<td>Price</td>';
    html += '<td>Shipping Amount</td>';
    html += '<td>Quantity</td>';
    html += '<td>Total</td>';
    html += '</tr>';
    html += '{{#each products}}';
    html += '<tr>';
    html += '<td>{{name}}</td>';
    html += '<td>{{amount}}</td>';
    html += '<td>{{ship_amount}}</td>';
    html += '<td>{{qty}}</td>';
    html += '<td>{{total_amount}}</td>';
    html += '</tr>';
    html += '{{/each}}';
    html += '</tbody>';
    html += '</table>';
    html += '<p>&nbsp;</p>';
    html += '<p>Grand Total {{total_price}}</p>';
    return html;
}
exports.sendOrderPlacedNotification = function(order_id, cb) {
    cb = cb ? cb : function() {};
    fs = require('fs');
    var settings = {};
    _h_product.getOrder(order_id)(function(err, orders) {
        async.series([
            function(p_cal) {
                Settings.findOne({}, function(err, result) {
                    settings = result;
                    p_cal();
                })
            },
            function(p_cal) {
                async.each(orders, function(item, callback) {
                    fs.readFile(ROOT_FOLDER + "/views/email_templates/seller_invoice.html", 'utf8', function(err, result) {
                        var template = _self.parseTemplate(result, {
                            orders: [item],
                            base_url: user_url
                        });
                        _self.sendMail(admin_email,
                            item.seller.email,
                            "User has purchased your product",
                            template,
                            "text"
                        );
                        callback();
                    })
                }, function() {});
                p_cal(null, {});
            },
            function(p_cal) {
                fs.readFile(ROOT_FOLDER + "/views/email_templates/admin_invoice.html", 'utf8', function(err, result) {
                    var template = _self.parseTemplate(result, {
                        orders: orders,
                        base_url: user_url
                    });
                    _self.sendMail(admin_email,
                        settings.contact.email,
                        "User made a order",
                        template,
                        "text"
                    );
                    p_cal(null, {});
                })
            },
            function(p_cal) {
                fs.readFile(ROOT_FOLDER + "/views/email_templates/invoice.html", 'utf8', function(err, result) {
                    var template = _self.parseTemplate(result, {
                        orders: orders,
                        base_url: user_url
                    });
                    _self.sendMail(admin_email,
                        orders[0].user.email,
                        "You have made a order",
                        template,
                        "text"
                    );
                    p_cal(null, {});
                })
            },
            function(p_cal) {
                var products = [];
                var sendMobileMessage = false;
                orders.forEach(function(order, index) {
                    order.products.forEach(function(product, index) {
                        products.push(product.name);
                    });
                });

                if (orders[0].user && orders[0].user.phone) {
                    _self.sendMessage(
                        orders[0].user.phone,
                        "You have bought " + products.join(", "),
                        function(err, result) {
                            console.log(err)
                            console.log(result)
                        }
                    );
                }
            }
        ], cb)
    })
}
