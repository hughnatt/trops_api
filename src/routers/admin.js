const express = require('express')
const Admin = require('../models/Admin')
const adminAuth = require('../middleware/admin-auth')

const router = express.Router()

/**
 * Login an admin
 */
router.post('/admin/login', async(req,res) => {
    try {
        const { login, password } = req.body
        const admin = await Admin.findByCredentials(login,password)
        if (!admin) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await admin.generateAuthToken()
        res.send({admin, token})
    } catch(error){
        res.status(400).send({error : error.message})
    }
})


/**
 * Create new admin
 */
router.post('/admin', adminAuth, async (req, res) => {
    try {
        req.body.createdBy = req.admin._id
        const admin = new Admin(req.body)
        await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).send({admin, token})
    }
    catch (error) {
        res.status(400).send({ error : error.message })
    }
})

/**
 * Get all admins
 */
router.get('/admin', adminAuth, async(req,res) => {
    try {
        
        const totalCount = await Admin.estimatedDocumentCount()
        res.set('X-Total-Count',totalCount)

        if (!req.query.page){
            req.query.page = 0
        }
        if (!req.query.size || req.query.size <= 0){
            req.query.page = 0
            req.query.size = 10
        }
        const skip = req.query.page * req.query.size
        const limit = parseInt(req.query.size,10)
        var sortField = '_id';
        var sortOrder = 1;
        if (req.query.sort){
            let sortSplit = req.query.sort.split(',')
            sortField = sortSplit[0]
            sortOrder = parseInt(sortSplit[1],10)
        }
        let query = {}
        query[sortField] = sortOrder

        Admin.find()
             .skip(skip)
             .limit(limit)
             .sort(query)
             .exec(function(err,admins) {
                if (err) {
                    res.status(400).send(err)
                }
                res.json(admins).send
            })
    } catch (error){
        res.status(400).send({error : error.message})
    }
})

router.post('/admin/logout', adminAuth, async (req, res) => {
    // Log user out of the application
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.admin.save()
        res.send()
    } catch (error) {
        res.status(500).send({error: error.message})
    }
})

router.post('/admin/logoutall', adminAuth, async(req, res) => {
    // Log user out of all devices
    try {
        req.admin.tokens.splice(0, req.admin.tokens.length)
        await req.admin.save()
        res.send()
    } catch (error) {
        res.status(500).send({error : error.message})
    }
})

module.exports = router
