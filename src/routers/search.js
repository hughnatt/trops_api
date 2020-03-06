const express = require('express')
const Advert = require('../models/Advert')

const router = express.Router()


router.post("/search", async(req,res) => {
    try {
        var titleRegex;
        var priceMin;
        var priceMax;
        var category;
        var location;
        var distance;

        if (req.body.text != null){
            titleRegex = new RegExp(req.body.text,"i");
        } else {
            titleRegex = new RegExp("","i");
        }

        if(req.body.priceMin!=null && req.body.priceMax!=null){
            priceMin = req.body.priceMin;
            priceMax = req.body.priceMax;
        } else {
            priceMin = 0;
            priceMax = 2000;
        }

        if(req.body.location != null && req.body.distance != null){
            location = req.body.location;
            distance = req.body.distance;
        }
        else{
            location = [0.0, 0.0];
            distance = Number.MAX_SAFE_INTEGER;
        }
        
        console.log(req.body.categories);
        console.log("loc: " + location);

        if (req.body.categories == null || !(req.body.categories instanceof Array) || req.body.categories.length ==0 ){
            Advert.find(
                { 
                    title: titleRegex, 
                    price: {$gte: priceMin, $lte: priceMax},
                    location: {
                        $near: {
                            $geometry: {
                                type:"Point",
                                coordinates: location
                            },
                            $maxDistance: distance
                        }
                    }
                }
                ,function (err, docs) {
                    res.send(docs);
                })
        } else {
            Advert.find(
                { 
                    title: titleRegex, 
                    price: {$gte: priceMin, $lte: priceMax}, 
                    category: { $in: req.body.categories },
                    // location: {
                    //     $near: {
                    //         $geometry: {
                    //             type:"Point",
                    //             coordinates: location
                    //         },
                    //         $maxDistance: distance
                    //     }
                    // }
                } 
                ,function (err, docs) {
                res.send(docs);
            })
        }
    }
    catch (error) {
        res.status(500).send({ error : error.message })
    }
})

module.exports = router