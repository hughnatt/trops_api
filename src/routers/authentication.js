const express = require('express')
const jwt = require('jsonwebtoken')
const AuthMethod = require('../models/AuthMethod')
const User = require('../models/User')


const router = express.Router()


router.get('/auth/google/:token', async (req,res) => {
    try {
        const decoded = jwt.decode(req.params.token)
        var user = await User.findOne({email : decoded.email, authMethod : "GOOGLE"})

        if (!user){
            userBuilder = {}
            userBuilder.name = decoded.name
            userBuilder.email = decoded.email
            userBuilder.authMethod = "GOOGLE"
            user = new User(userBuilder)
            await user.save()
        }
       
        const token = await user.generateAuthToken()
        res.status(200).send({user,token});
    } catch(error) {
        res.status(500).send({error : error.message})
    }
})

module.exports = router