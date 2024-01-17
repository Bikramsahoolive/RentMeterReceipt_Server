const morgan = require('morgan');

function requestLog(){
    return (morgan('dev'));
}

const checkLandlordCreateData = (req,res,next) =>{
    const {name, phone, email, upi, password} = req.body;
    
    const phoneRegex = /^[06789]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const upiRegex = /^[^\s@]+@[^\s@]+$/;


    if(!name || !phone || !email || !upi || !password){
        return res.status(400).send("Invalid input.");
    }
    else if(name.length>25){
        return res.status(400).send("Invalid name.");
    }
    else if(phone.length>11 || phone.length<10 || !phoneRegex.test(phone[0]) ){
        return res.status(400).send("Invalid Phone.");
    }
    else if(email.length>35 || !emailRegex.test(email)){
        return res.status(400).send("Invalid email.");
    }
    else if(upi.length>25 || !upiRegex.test(upi)){
        return res.status(400).send("Invalid upi.");
    }
    else if (password.length >20){
        return res.status(400).send("Invalid password.");
    }
    next();
}

module.exports={
    requestLog,
    checkLandlordCreateData
}


