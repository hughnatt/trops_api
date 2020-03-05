const mongoose = require('mongoose')

const advertSchema = mongoose.Schema({

    title : {
        type: String,
        required: true,
        trim: true
    },
    description : {
        type: String,
        trim: true
    },
    price : {
        type: Number,
        required: true,
        validate: value => {
            if(value < 0){
                throw new Error('Invalid price value')
            }
        }
    },
    category : {
        type: String,
        required : true,
    },
    creationDate : {
        type: Date
    },
    photos : {
        type: Array
    },
    owner : {
        type: String,
        required: true
    },
    availability : {
        type: [{start: Date, end: Date}]
    },
    reserved: {
        type: [Date]
    },
    location: {
        required: true,
        type: [{
            label: String,
            city: String,
            postcode: String,
            coordinates: Array
        }]
    }
})

advertSchema.pre('save', function (next) {
    const advert = this
    advert.creationDate = Date.now()
    next()
})

const Advert = mongoose.model('Advert', advertSchema)

module.exports = Advert