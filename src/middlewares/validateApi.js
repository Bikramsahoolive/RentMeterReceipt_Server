require('dotenv').config();
function apiKeyValidation(req,res,next){
    if(req.headers.api_key === process.env.api_key){
        next()
    }else{
        res.send({status:false,message:"invalid API key"});
    }
}

module.exports = apiKeyValidation;