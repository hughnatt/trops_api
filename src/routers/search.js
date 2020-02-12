const express = require('express')
const Advert = require('../models/Advert')

const router = express.Router()


router.get("/search", async(req,res) => {
    try {
        var titleRegex;
        var priceMin;
        var priceMax;
        var category;

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

        if(req.body.category!=null){
            category = new RegExp(req.body.category);
        } else {
            category = new RegExp(".*");
        }



        Advert.find({ title: titleRegex, price: {$gte: priceMin, $lte: priceMax}, category: category} ,function (err, docs) {
            res.send(docs);
        })
        
    }
    catch (error) {
        res.status(500).send({ error : error.message })
    }
})

module.exports = router