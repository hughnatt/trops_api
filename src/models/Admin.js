const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminSchema = mongoose.Schema({
    login: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    createdBy: {
        type: String,
        require: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

adminSchema.pre('save', async function (next) {
    // Hash the password before saving the admin model
    const admin = this
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }
    next()
})

adminSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const admin = this
    const token = jwt.sign({_id: admin._id}, process.env.JWT_ADMIN_KEY)
    admin.tokens = admin.tokens.concat({token})
    await admin.save()
    return token
}

adminSchema.statics.findByCredentials = async (login, password) => {
    // Search for a user by email and password.
    const admin = await Admin.findOne({login} )
    if (!admin) {
        throw new Error('Invalid login credentials' )
    }
    const isPasswordMatch = await bcrypt.compare(password, admin.password)
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials')
    }

    return admin
}

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin