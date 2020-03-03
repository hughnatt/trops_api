const express = require('express')
const Category = require('../models/Category')

const router = express.Router()

router.get('/category', async (req,res) => {
    try{
        categories = await Category.find({parent : {$exists: false}});
        var response = [];
        
        for (const cat of categories){
            const pCat = await processCategory(cat);
            response.push(pCat);
        };

        res.json(response);
    }
    catch(error){
        res.status(400).send({error : error.message})
    }
})

async function processCategory(category) {
    var processedCategory = {};
    processedCategory.name = category.name;
    processedCategory._id = category._id;
    
    const subcategories = await category.getChildren();

    if (subcategories.length !== 0){
        processedCategory.children = [];
        for (const subcat of subcategories){
            processedCategory.children.push(await processCategory(subcat));
        }
    }
    return processedCategory;
}

router.get('/category/:id', async (req,res) => {
    try {
        console.log(req.params.id);
        Category.findById(req.params.id, async function (error,category) {
            if (error) {
                throw res.status(500).json({error : error.message});
            } else {
                if (category != null){
                    const processedCategory = await processCategory(category)
                    res.status(200).json(processedCategory);
                } else {
                    res.status(404).json({error :"No category for this id"});
                }
            }
        });
    } catch(error) {
        res.status(500).send({error : error.message})
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