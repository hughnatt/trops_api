const mongoose = require('mongoose')
const tree = require('../lib/tree')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parent: {
        type:String,
        required: false,
    },
    thumbnail: {
        type:String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    }
});
categorySchema.plugin(tree);


const Category = mongoose.model('Category', categorySchema);

module.exports = Category