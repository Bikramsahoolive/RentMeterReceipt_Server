const jwt = require('jsonwebtoken');
const secretKey = process.env.sess_secret;
const checkSession = (req, res, next) => {
    // let data = req.session.key;
    try {
        if(req.headers['authorization']){
            let data = jwt.verify(req.headers['authorization'], secretKey);

        if (Date.now() > data.expairTime) {
            // res.cookie('sid',"",{expires: new Date(0)});
            res.status(400).send({
                isActive: false,
                message: "session expired.",
                authToken:''
            });


        } else {
            
            // data.expairTime = Date.now() + 1200000;
            // req.session.key = data;
            // let token = jwt.sign(data, secretKey);
            // res.cookie('sid', token);
            next();
        }
        }else{
            
            res.status(400).send({
                isActive: false,
                message: "Login required."
            });
        }
        
    } catch (error) {
        console.log(error);
        res.send({
            isActive: false,
            message:'internal server error'
        });

    }


    // if (data!== undefined){
    //     if(Date.now() > data.expairTime){
    //         req.session.destroy(err => {
    //             if (err) {
    //                 res.send(err);
    //             } else {
    //                 res.send({
    //                     isActive: false,
    //                     message: "session expired."
    //                 });
    //             }
    //         });
    //     }else{
    //         // data.expairTime = Date.now() + 600000 ;
    //         // req.session.key = data;
    //         // next();
    //     }
    // }else{
    //   res.send({
    //     isActive:false,
    //     message:"Login required."
    //   });
    // }
}

const checkAdminUser = (req, res, next) => {
    // let data = req.session.key;
    let data = jwt.verify(req.headers['authorization'], secretKey);
    if (data.userType != 'Admin') {
        res.status(400).send('You are not authorize to access the service.');
    } else {
        next();
    }
}
const checkLandlordUser = (req, res, next) => {
    // let data = req.session.key;
    let data = jwt.verify(req.headers['authorization'], secretKey);
    if (data.userType != 'Landlord' && data.userType != 'Admin') {
        console.log('not authorize');
        
        res.status(400).send('You are not authorize to access the service.');
    } else {
        next();
    }
}
const checkRentHolderUser= (req,res,next)=>{
    // let data = req.session.key;3
    let data = jwt.verify(req.headers['authorization'], secretKey);
    if(data.userType!='Rentholder' && data.userType!='Landlord' && data.userType!='Admin'){
        res.status(400).send('You are not authorize to access the service.');
    }else{
        next();
    }
}

module.exports = {
    checkSession,
    checkAdminUser,
    checkLandlordUser,
    checkRentHolderUser
};