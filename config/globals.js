module.exports = {
  environment : "sandbox",
  currency : "usd",
  bcrypt: {
    salt_round: 10,
    salt: "secret"
  },
  url: {
    // for the symbol server
    // user: "http://bluemix-user-v1.au-syd.mybluemix.net",
    // seller: "http://e-commerce-seller.mybluemix.net",
    // admin: "http://e-commerce-admin.mybluemix.net"

    // for ecommercemarketplace server
    user: "http://ecommercemarketplace.org",
    seller: "http://seller.ecommercemarketplace.org",
    admin: "http://admin.ecommercemarketplace.org"
  },
  site_title: "the-symbol",
  mail: {
    mandrill: '4fwc6sNgVF8aX8JbIN_Kfg'
  },
  admin_email: "no-reply@the-symbol.net"
}
