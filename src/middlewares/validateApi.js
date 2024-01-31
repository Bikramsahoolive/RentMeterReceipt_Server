function apiKeyValidation(req,res,next){
    if(req.headers.api_key === process.env.api_key){
        next()
    }else{
        res.send("You Are Not authorize to use this API.");
    }
}

module.exports = apiKeyValidation;