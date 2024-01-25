
const checkRentHolderCreateData = (req,res,next) =>{
    const {name, phone, email, rent, password} = req.body;
    
    const phoneRegex = /^[06789]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    
    if(!name || !phone || !email || !rent || !password ){
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
    else if(rent.length<5){
        return res.status(400).send("Invalid rent input");
    }
    else if (password.length >20){
        return res.status(400).send("Invalid password.");
    }

    next();
}


module.exports={
    checkRentHolderCreateData
}


