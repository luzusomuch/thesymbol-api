module.exports = {
    facebookAuth: {
        clientID: '1019102448207768',
        clientSecret: 'aa8a75739646946aa6654dd593b5bb31',
        scope: 'email, public_profile',
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
    },
    twitterAuth: {
        consumerKey: 'YOUR-TWITTER-CONSUMER-KEY',
        consumerSecret: 'YOUR-TWITTER-CONSUMER-SECRET',
        callbackURL: 'http://localhost:3000/auth/twitter/callback',
    },
    googleAuth: {
        clientID: 'YOUR-GOOGLE-CLIENT-ID',
        clientSecret: 'YOUR-GOOGLE-CLIENT-SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback',
    },
};
