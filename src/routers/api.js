const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')


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

<<<<<<< HEAD

router.post('/advert', async (req, res) => {
    try {
        const advert = new Advert(req.body)
        await advert.save()
        res.status(201).send()
    }
    catch (error) {
        res.status(400).send({ error : error.message })
    }
})

router.get('/advert',async (req,res) => {
    try{
        Advert.find().sort({'creationDate' : -1}).exec(function(err, advert){
            if (err){
                res.status(400).send(err); 
            }
            res.json(advert);   
        })
    }
    catch(error){
        res.status(400).send({error : error.message})
    }
})

router.post('/advert/owner', auth, async (req,res) => { 
    try{
        if(req.user.email == req.body.owner){ //prevent anyone to get the advert of a given user
            var query = Advert.find({});
            query.where('owner', req.body.owner);
            query.exec(function (err, results) {
                if (err){
                    res.status(400).send(err); 
                }
                res.json(results); 
            });
        }
    }
    catch{
        res.status(400).send({error : error.message})
    }
})

router.post('/advert/category',async (req,res) => {
    try{
        var query = Advert.find({});
        query.where('category', req.body.category);
        query.exec(function (err, results) {
            if (err){
                res.status(400).send(err); 
            }
            res.json(results); 
        });
    }
    catch{
        res.status(400).send({error : error.message})
=======
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
>>>>>>> 560e75698bc04c02ff361cab0846eb9fbc4b2149
    }
})


<<<<<<< HEAD
router.delete('/advert', auth, async (req,res) => {
    try{
        var query = Advert.find({}); // querry to get the advert where his id equal the one in body
        query.where('_id', req.body._id);
        query.exec(function (err, results) {
            if (err){
                res.status(400).send(err); 
            }
            else if(req.user.email == results[0].owner){ //once the good advert get, deletion only if current user mail == owner mail to prevent abusive deletion
                Advert.deleteOne({ '_id': req.body._id}, function (err) {
                    if(err){
                        res.status(400).send(err); 
                    }
                    res.status(202).send({message : "Advert deleted with success"});
                })
            }
            else{
                res.status(401).send(err); 
            } 
        });
    }
    catch{
        res.status(400).send({error : error.message})
    }
})

=======
>>>>>>> 560e75698bc04c02ff361cab0846eb9fbc4b2149
module.exports = router