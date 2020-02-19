const express = require('express')
const multer = require('multer')
const User = require('../models/User')
const Advert = require('../models/Advert')
const auth = require('../middleware/auth')
const path = require('path')
const fs = require('fs');

const storage =  multer.diskStorage({
    destination: function (req, file, callback) {
      fs.mkdir('./images', function(err) {
          if(err.code != 'EEXIST') {
              console.log(err.stack)

          } else {
              callback(null, './images');
          }
      })
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    }
  });

const router = express.Router()

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

router.post('/image',function(req,res){
    var upload = multer({storage : storage}).single('image');
    upload(req,res,function(err) {
        console.log(req.file.filename);
        if(err) {
            return res.status(500).send("Error uploading file.");
        }
        res.status(200).send("File is uploaded");
    });
});


router.get('/image/:filename', function(req,res){
    try {
        console.log(req.params.filename);
        if(req.params.filename){
            res.status(200).sendFile(path.join(__dirname,'../../images/',req.params.filename))
        }
    } catch(error) {
        res.status(500).send({error : error.message})
    }
})

router.delete('/image/:filename', function(req,res){
    try {
        console.log(req.params.filename);
        if(req.params.filename){
            fs.unlink(path.join(__dirname,'../../images/',req.params.filename),error =>{
                if(error){
                    res.status(500).send({error : error.message})
                }
                else{
                    res.status(200).send("Picture deleted with success")
                }
            })
        }
    } catch(error) {
        res.status(404).send({error : error.message})
    }
})


module.exports = router