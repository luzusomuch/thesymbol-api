var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    main_banner: [{
        image: {
          type: Schema.Types.ObjectId,
          ref: 'Image'
        },
        title: String,
        text: String,
        url: String
    }],
    sub_banner: [{
        image: {
          type: Schema.Types.ObjectId,
          ref: 'Image'
        },
        title: String,
        text: String,
        url: String
    }],
    overall_banner: {
      type: Schema.Types.ObjectId,
      ref: 'Image'
    },
    images: [{
        image: {
          type: Schema.Types.ObjectId,
          ref: 'Image'
        },
        title: String,
        text: String,
        url: String
    }],
    created_at: Date,
    updated_at: Date,
});
module.exports = DB_CONNECTION.model("Home_page_configuration", tableSchema);
