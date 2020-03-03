const express = require('express')

const router = express.Router()
const {exec} = require('child_process')


router.get('/stats',function(req,res){
    console.log("PROUT");
    exec('ls', (err,stdout,sterr)=> {
        if(err){
            console.error(err);
        }
        else{
            console.log(stdout);
        }
    });
})



module.exports = router