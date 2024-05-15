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
            data.expairTime = Date.now() + 600000 ;
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

const checkAdminUser= (req,res,next)=>{
    let data = req.session.key;
    if(data.userType!='admin'){
        res.status('400').send('You are not authorize to access the service.');
    }else{
        next();
    }
}
const checkLandlordUser= (req,res,next)=>{
    let data = req.session.key;
    if(data.userType!='landlord' && data.userType!='admin'){
        res.status('400').send('You are not authorize to access the service.');
    }else{
        next();
    }
}
// const checkRentHolderUser= (req,res,next)=>{
//     let data = req.session.key;
//     if(data.userType!='rentholder' && data.userType!='landlord' && data.userType!='admin'){
//         res.status('400').send('You are not authorize to access the service.');
//     }else{
//         next();
//     }
// }

module.exports = {
                checkSession,
                checkAdminUser,
                checkLandlordUser,
                // checkRentHolderUser
                        };