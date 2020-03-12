const express = require('express')
const Advert = require('../models/Advert')

const router = express.Router()


router.post("/search", async(req,res) => {
    try {
        if (!req.query.page){
            req.query.page = 0
        }
        if (!req.query.size || req.query.size <= 0){
            req.query.page = 0
            req.query.size = 20
        }
        const skip = req.query.page * req.query.size
        const limit = parseInt(req.query.size,10)
        var sortField = 'creationDate'
        var sortOrder = -1
        if (req.query.sort){
            let sortSplit = req.query.sort.split(',')
            sortField = sortSplit[0]
            sortOrder = parseInt(sortSplit[1],10)
        }
        let sort = {}
        sort[sortField] = sortOrder



        var titleRegex;
        if (req.body.text != null){
            titleRegex = new RegExp(req.body.text,"i");
        } else {
            titleRegex = new RegExp("","i");
        }

        var priceMin;
        if(req.body.priceMin!=null){
            priceMin = req.body.priceMin
        } else {
            priceMin = 0
        }

        var priceMax;
        if (req.body.priceMax!=null){
            priceMax = req.body.priceMax
        } else {
            priceMax = 2000
        }

        var location, distance;
        if (req.body.location != null && req.body.distance != null) {
            location = req.body.location;
            distance = req.body.distance;
        } else {
            location = [0.0, 0.0];
            distance = Number.MAX_SAFE_INTEGER;
        }
        
        var categories;
        if (req.body.categories == null || !(req.body.categories instanceof Array) || req.body.categories.length ==0 ){
            categories = [/.*/]
        } else {
            categories = req.body.categories
        }

        const countQuery = Advert.find({ 
            title: titleRegex, 
            price: {$gte: priceMin, $lte: priceMax},
            category: {$in: categories},
            location: {
                $geoWithin: { $center: [ [ location[0], location[1] ], distance ]}
            }
        })

        const totalCount = await Advert.countDocuments(countQuery)
        res.set('X-Total-Count',totalCount)


        const searchQuery = Advert.find({ 
            title: titleRegex, 
            price: {$gte: priceMin, $lte: priceMax},
            category: {$in: categories},
            location: {$near: {
                    $geometry: {
                        type:"Point",
                        coordinates: location
                    },
                    $maxDistance: distance
                }
            }}
        )

        searchQuery.skip(skip)
            .limit(limit)
            .sort(sort)
            .exec(function (error, docs) {
                if(error){
                    res.status(500).send({error : error.message});
                } else {
                    res.status(200).send(docs);
                }
            }
        )
    }
    catch (error) {
        res.status(500).send({ error : error.message })
    }
})

module.exports = router