const express = require('express')
const Advert = require('../models/Advert')
const auth = require('../middleware/auth')

const router = express.Router()

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

router.post('/advert', auth, async (req, res) => {
    try {
        const advert = new Advert(req.body)
        await advert.save()
        res.status(201).send()
    }
    catch (error) {
        res.status(400).send({ error : error.message })
    }
})

router.get('/advert/:id', async (req, res) => {
    try {
        Advert.findById(req.params.id, async function(error,advert){
            if (error){
                res.status(400).send({error : error.message})
            } else {
                if (!advert){
                    res.status(404).send({error : "ID doesn't match any advert"})
                } else {
                    res.status(200).send(advert)
                }
            }
        })
    } catch (error) {
        res.status(500).send({error : error.message})
    }
});

router.delete('/advert/:id', auth, async (req,res) => {
    try{
        Advert.findById(req.params.id, function(error,advert){
            if (error){
                res.status(400).send({error : error.message})
            } else {
                if (!advert){
                    res.status(404).send({error : "ID doesn't match any advert"})
                } else {
                    if (req.isAdmin || (req.user.email === advert.owner)){
                        Advert.deleteOne({ '_id': req.params.id}, function (err) {
                            if(err){
                                res.status(400).send(err); 
                            }
                            res.status(202).send();
                        })
                    } else {
                        res.status(401).send({error : "Only advert owner can delete it"})
                    }
                }
            }
        })
    } catch (error){
        res.status(500).send({error : error.message})
    }
})


router.put('/advert/:id',auth,async(req,res) => { 
    try{
        Advert.findById(req.params.id, function(error,advert){
            if (error){
                res.status(400).send({error : error.message})
            } else {
                if (!advert){
                    res.status(404).send({error : "ID doesn't match any advert"})
                } else {
                    if (req.isAdmin || (req.user.email === advert.owner)){
                        Advert.updateOne({_id : req.params.id}, req.body, {new : true}, function(error, updatedAdvert) {
                            if (error) {
                                res.status(400).send({error : error.message});
                            } else {
                                res.status(200).send(updatedAdvert);
                            }
                        })
                    } else {
                        res.status(401).send()
                    }
                }
            }
        })
    } catch(error) {
        res.status(500).send({error : error.message})
    }
})

router.post('/advert/owner/:id', auth, async (req,res) => { 
    try{
        if (req.isAdmin || req.user.email === req.params.id) {
            Advert.find({owner : req.params.id}).exec(function (error, adverts) {
                if (error){
                    res.status(400).send(error); 
                } else {
                    res.status(200).send(adverts); 
                }
            });
        } else {
            res.status(401).send()
        }
    } catch(error) {
        res.status(500).send({error : error.message})
    }
})

// Deprecated, do not use
router.post('/advert/owner', auth, async (req,res) => { 
    try{
        if (req.isAdmin || req.user.email == req.body.owner) {
            Advert.find({owner : req.body.owner}).exec(function (error, adverts) {
                if (error){
                    res.status(400).send(error); 
                } else {
                    res.status(200).send(adverts); 
                }
            });
        } else {
            res.status(401).send()
        }
    } catch(error) {
        res.status(500).send({error : error.message})
    }
})


module.exports = router
