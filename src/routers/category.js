const express = require('express')
const Category = require('../models/Category')

const router = express.Router()

router.get('/category',async (req,res) => {
    try{
        Category.find(function(err, category){
            if (err){
                res.status(400).send(err); 
            }
            res.json(category);   
        });            
    }
    catch(error){
        res.status(400).send({error : error.message})
    }
})

router.post('/category', async (req, res) => { //TODO : handle admin token
    try {
        const category = new Category(req.body)
        await category.save()
        res.status(201).send()
    }
    catch (error) {
        res.status(400).send({ error : error.message })
    }
})

router.delete('/category',async (req,res) => { //TODO : Handle the admin's token !!
    try{
        Category.findOneAndRemove({_id: req.body._id},function(err,data)
        {
            if(err){
                res.status(400).send(err); 
            }
        });
        res.status(202).send({message : "Category deleted with success"}); 
    }
    catch{
        res.status(400).send({error : error.message})
    }
})

module.exports = router