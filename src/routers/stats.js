const express = require('express')
const partition = process.env.ANALYSED_PARTITION
const router = express.Router()
const execSync = require('child_process').execSync

router.get('/stats/storage',function(req,res){

    try{

        var imagesCount = Number(execSync("find ./images -type f | wc -l").toString());
        var usedSpace = Number(execSync("du -c ./images | tail -1 | awk '{print $1;}'").toString());
        var availableSpace = Number(execSync(`df | grep -w ${partition} | tail -1 | awk '{print $4;}'`).toString());

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(
            {
                "images_count" : imagesCount,
                "used_space" : usedSpace,
                "available_space" : availableSpace
            }
        ))
    }

    catch(err){
        console.error(err);
        return res.status(500).send("Error getting stats.");
    }
})

module.exports = router