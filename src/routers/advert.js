const express = require('express')
const Advert = require('../models/Advert')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/advert', async (req, res) => {
    try {
        const advert = new Advert(req.body)
        await advert.save()
        res.status(201).send()
    }
    catch (error) {
        res.status(400).send({ error : error.message })
    }
})

router.get('/advert',async (req,res) => {
    try{
        Advert.find().sort({'creationDate' : -1}).exec(function(err, advert){
            if (err){
                res.status(400).send(err); 
            }
            res.json(advert);   
        })
    }
    catch(error){
        res.status(400).send({error : error.message})
    }
})

router.delete('/advert', auth, async (req,res) => {
    try{
        var query = Advert.find({}); // querry to get the advert where his id equal the one in body
        query.where('_id', req.body._id);
        query.exec(function (err, results) {
            if (err){
                res.status(400).send(err); 
            }
            else if(req.user.email == results[0].owner){ //once the good advert get, deletion only if current user mail == owner mail to prevent abusive deletion
                Advert.deleteOne({ '_id': req.body._id}, function (err) {
                    if(err){
                        res.status(400).send(err); 
                    }
                    res.status(202).send({message : "Advert deleted with success"});
                })
            }
            else{
                res.status(401).send(err); 
            } 
        });
    }
    catch{
        res.status(400).send({error : error.message})
    }
})


router.post('/advert/owner', auth, async (req,res) => { 
    try{
        if(req.user.email == req.body.owner){ //prevent anyone to get the advert of a given user
            var query = Advert.find({});
            query.where('owner', req.body.owner);
            query.exec(function (err, results) {
                if (err){
                    res.status(400).send(err); 
                }
                res.json(results); 
            });
        }
    }
    catch{
        res.status(400).send({error : error.message})
    }
})

module.exports = router
