const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Admin = require('../models/Admin')

const auth = async(req, res, next) => {
    try {

        const token = req.header('Authorization').replace('Bearer ', '')
        req.token = token

        let data;
        try {
            data = jwt.verify(token, process.env.JWT_KEY)
            const user = await User.findOne({ _id: data._id, 'tokens.token': token })
    
            if (user) {
                req.user = user       
                req.isAdmin = false     
            } else {

            }
        } catch (error){
            data = jwt.verify(token, process.env.JWT_ADMIN_KEY)
            const admin = await Admin.findOne({_id : data._id, 'tokens.token': token})
            if (admin){
                req.admin = admin
                req.isAdmin = true
            } else {
                throw new Error()
            }
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}

module.exports = auth