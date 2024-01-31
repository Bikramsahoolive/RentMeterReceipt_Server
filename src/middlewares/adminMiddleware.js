require('dotenv').config();  
 function adminReset(req,res,next){
    let resetKey = req.body.reset_key;
    
    if(resetKey == process.env.admin_reset_key){
        next();
    }else {
        res.send('Invalid Reset Key.');
    }
 }

 module.exports = {adminReset};