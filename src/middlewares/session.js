const checkSession = (req,res,next)=>{
    let data = req.session.key;
    if (data!== undefined){
        if(Date.now() > data.expairTime){
            req.session.destroy(err => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({
                        isActive: false,
                        message: "session expired."
                    });
                }
            });
        }else{
            data.expairTime = Date.now() + 120000 ;
            req.session.key = data;
            next();
        }
    }else{
      res.send({
        isActive:false,
        message:"Login required."
      });
    }
}

module.exports = {checkSession};