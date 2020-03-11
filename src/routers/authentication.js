const express = require('express')
const jwt = require('jsonwebtoken')
const AuthMethod = require('../models/AuthMethod')
const User = require('../models/User')


const router = express.Router()


router.get('/auth/google/:token', async (req,res) => {
    try {
        var decoded = jwt.decode(req.params.token)
        console.log(decoded)
    
        var user = await User.findOne({email : decoded.email, authMethod : "GOOGLE"})
        console.log(user);

        if (!user){
            userBuilder = {}
            userBuilder.name = decoded.name
            userBuilder.email = decoded.email
            userBuilder.authMethod = "GOOGLE"
            user = new User(userBuilder)
            console.log(user.authMethod)
            await user.save()
        }
       
        const token = await user.generateAuthToken()
        res.status(200).send({user,token});

    } catch(error) {
        res.status(500).send({error : error.message})
    }
})

module.exports = router