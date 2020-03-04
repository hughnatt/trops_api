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
        const totalCount = await Advert.estimatedDocumentCount()
        res.set('X-Total-Count',totalCount)

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

        Advert.find()
              .skip(skip)
              .limit(limit)
              .sort(sort)
              .exec(function(err, adverts){
                if (err){
                    res.status(400).send(err); 
                }
                res.json(adverts);   
        })
    } catch(error){
        res.status(500).send({error : error.message})
    }
})

router.delete('/advert/:id', auth, async (req,res) => {
    try{
        var query = Advert.find({}); // querry to get the advert where his id equal the one in body
        query.where('_id', req.params.id);
        query.exec(function (err, results) {
            try {
                if (err){
                    res.status(400).send(err); 
                }
                else if(req.user.email == results[0].owner){ //once the good advert get, deletion only if current user mail == owner mail to prevent abusive deletion
                    Advert.deleteOne({ '_id': req.params.id}, function (err) {
                        if(err){
                            res.status(400).send(err); 
                        }
                        res.status(202).send({message : "Advert deleted with success"});
                    })
                }
                else{
                    res.status(401).send(err); 
                } 
            }
            catch(err){
                res.status(500).send(err);
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

router.put('/advert/:id',auth,async(req,res) => { //TODO : Improve the way to handle user TOKEN
    try{

        var query = Advert.find({}); // querry to get the advert where his id equal the one in params
        query.where('_id', req.params.id);
        query.exec(function (err, results) {
            try {
                if (err || results.length == 0){ //if any error or no results
                    res.status(400).send(err); 
                }
                else if(req.user.email == results[0].owner){ //once the good advert get, deletion only if current user mail == owner mail to prevent abusive deletion
                    
                    const filter = { _id: req.params.id };
                    Advert.updateOne(filter,req.body,{new : true}, function(err, result) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.status(200).send({message : "Advert update with success"});
                        }
                    });
                }
                else{
                    res.status(401).send(err); 
                } 
            }
            catch(err){
                res.status(500).send(err);
            }
        })        
    }
    catch{
        res.status(400).send({error : error.message})
    }
})

module.exports = router
