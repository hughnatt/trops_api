const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')

const adminAuth = async(req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_ADMIN_KEY)
        const admin = await Admin.findOne({ _id: data._id, 'tokens.token': token })
        if (!admin) {
            throw new Error()
        }
        req.admin = admin
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'You need admin authorization to access this ressource' })
    }
}

module.exports = adminAuth
