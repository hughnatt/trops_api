const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/admin-auth.js')

const router = express.Router()


router.get('/users', adminAuth, async (req,res) => {
    try {
        const totalCount = await User.estimatedDocumentCount()
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
        var sortOrder = 1
        if (req.query.sort){
            let sortSplit = req.query.sort.split(',')
            sortField = sortSplit[0]
            sortOrder = parseInt(sortSplit[1],10)
        }
        let sort = {}
        sort[sortField] = sortOrder

        User.find()
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .exec(function(err,users){
                if (err) {
                    res.status(400).send(err);
                }
                res.status(200).send(users);
            })
    } catch (error) {
        res.status(500).send({error : error.message})
    }
})

router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send({error : error.message})
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send({error : error.message})
    }
})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send({error: error.message})
    }
})

router.post('/users/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send({error : error.message})
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        const email = req.user.email
        const user = await User.findOneAndDelete({ email })
        if (!user) {
            throw new Error("User deletion failed");
        }
        res.status(204).send()
    } catch (error){
        res.status(500).send({error : error.message})
    }
});

router.put('/users/me', auth, (req, res) => {
    try {
        if (req.body.password != null){
            return res.status(400).send({error : "Password update rejected"})
        }
        User.findByIdAndUpdate(
            req.user._id, 
            req.body, 
            {new: true}, 
            (error, user) => {
                // Handle any possible database errors
                if (error) {
                    return res.status(500).send(error);
                }
                return res.send(user);
            })
    } catch (error){
        res.status(500).send({error : error.message})
    }
});

router.put('/users/me/password',auth, async (req, res) => {
    try {
        req.user.password = req.body.password
        await req.user.save()
        res.send()
    } catch (error){
        res.status(500).send({error : error.message})
    }
})





module.exports = router