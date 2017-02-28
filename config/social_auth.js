module.exports = {
    // the symbol auth
    // facebookAuth: {
    //     clientID: '1019102448207768',
    //     clientSecret: 'aa8a75739646946aa6654dd593b5bb31',
    //     scope: 'email, public_profile',
    //     callbackURL: 'http://localhost:3000/auth/facebook/callback',
    // },
    // romaios auth
    facebookAuth: {
        clientID: '733572623474050',
        clientSecret: '9d1c3d492e398b027f3742a002e2bba5',
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
