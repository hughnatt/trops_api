const express = require('express')
const Category = require('../models/Category')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/category', async (req,res) => {
    try{
        categories = await Category.find({parent : {$exists: false}});
        var response = [];
        
        for (const cat of categories){
            const pCat = await processCategory(cat);
            response.push(pCat);
        };

        res.status(200).send(response);
    }
    catch(error){
        res.status(400).send({error : error.message})
    }
})

async function processCategory(category) {
    var processedCategory = {};
    processedCategory._id = category._id;
    processedCategory.name = category.name;
    processedCategory.description = category.description;
    processedCategory.thumbnail = category.thumbnail;
    
    const subcategories = await category.getChildren();

    if (subcategories.length !== 0){
        processedCategory.children = [];
        for (const subcat of subcategories){
            processedCategory.children.push(await processCategory(subcat));
        }
    }
    return processedCategory;
}

router.get('/category/list', async(req,res) => {
    try {
        const totalCount = await Category.estimatedDocumentCount()
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
        var sortField = '_id'
        var sortOrder = -1
        if (req.query.sort){
            let sortSplit = req.query.sort.split(',')
            sortField = sortSplit[0]
            sortOrder = parseInt(sortSplit[1],10)
        }
        let sort = {}
        sort[sortField] = sortOrder

        Category.find()
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .exec(function(error, categories){
                if (error){
                    res.status(400).send(error)
                } else {
                    res.status(200).send(categories)
                }
            })
    } catch (error){
        res.status(500).send({error : error.message})
    }
})

router.get('/category/list/:id', async(req,res) => {
    try {
        Category.findById(req.params.id, function(error, category) {
            if (error){
                res.status(400).send({error : error.message});
            } else {
                if (!category){
                    res.status(404).send({error : "ID doesn't match any category"})
                } else {
                    res.status(200).send(category)
                }
            }
        })
    } catch (error){
        res.status(500).send();
    }
})

router.post('/category', auth, async (req, res) => {
    try {
        if (!req.isAdmin){
            res.status(401).send()
        } else {
            //Remove empty parent field
            if (req.body.parent != null && req.body.parent === ""){
                delete req.body.parent;
            }
            const category = new Category(req.body)
            await category.save()
            res.status(201).send()
        }
    }
    catch (error) {
        res.status(500).send({ error : error.message })
    }
})

router.get('/category/:id', async (req,res) => {
    try {
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

router.put('/category/:id', auth, async(req,res) => {
    try {
        if (!req.isAdmin){
            res.status(401).send();
        } else {
            //Remove empty parent field
            if (req.body.parent != null && req.body.parent === ""){
                delete req.body.parent;
            }
            Category.findByIdAndUpdate(
                req.params.id, 
                req.body, 
                {new: true}, 
                (error, category) => {
                    if (error) {
                        return res.status(400).send({error : error.message});
                    } else {
                        return res.status(200).send(category);
                    }
                })
        }
    } catch(error){
        res.status(500).send({error : error.message})
    }
})

router.delete('/category/:id', auth, async (req,res) => {
    try{
        if (!req.isAdmin){
            res.status(401).send()
        } else {
            Category.findById(req.params.id,function(error,category){
                if(error) {
                    res.status(400).send({error : error.message});
                } else {
                    if (!category){
                        res.status(404).send()
                    } else {
                        try {
                            deleteCategory(category)
                            res.status(204).send(); 
                        } catch (error){
                            res.status(500).send({error : error.message})
                        }
                    }
                }
            });
        }
    }
    catch{
        res.status(500).send({error : error.message})
    }
})


async function deleteCategory(category){
    categories = category.getChildren();
    if (categories.length > 0){
        for (cat in categories){
            await deleteChildren(cat)
        }
    }
    await category.deleteOne()
}

module.exports = router