const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs');

const router = express.Router()

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



router.post('/image',function(req,res){ //function to upload an image to the server
    var upload = multer({storage : storage}).single('image'); //upload file passed to the key 'image' to server
    upload(req,res,function(err) {
        console.log(req.file.filename);
        if(err) { //if the upload is a failure
            return res.status(500).send("Error uploading file.");
        }
        res.status(200).send("File is uploaded"); //the upload is a success
    });
});


router.get('/image/:filename', function(req,res){ //function to get a given image from the server
    try {
        console.log(req.params.filename);
        if(req.params.filename){ //if the filename param is not null
            res.status(200).sendFile(path.join(__dirname,'../../images/',req.params.filename)) //we send the file located into the folder "image" of the server to the client
        }
    } catch(error) {
        res.status(500).send({error : error.message})
    }
})

router.delete('/image/:filename', function(req,res){//function to delete a given image from the server
    try {
        console.log(req.params.filename);
        if(req.params.filename){ //if the filename param is not null
            fs.unlink(path.join(__dirname,'../../images/',req.params.filename),error =>{ //we try to delete the image at the image folder of the server
                if(error){
                    res.status(500).send({error : error.message}) //if the deletion is a failure
                }
                else{
                    res.status(200).send("Picture deleted with success") //the deletion is a success
                }
            })
        }
    } catch(error) {
        res.status(404).send({error : error.message}) //the file named filename doesn't exist
    }
})


module.exports = router