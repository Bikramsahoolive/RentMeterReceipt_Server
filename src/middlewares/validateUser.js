require('dotenv').config(); 

const checkLandlordCreateData = (req,res,next) =>{
    let data = req.body;
    const {name, phone, email, upi, password} = data;
    
    const phoneRegex = /^[06789]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const upiRegex = /^[^\s@]+@[^\s@]+$/;

    let dataval = [name, phone, email, upi, password];
    const isAvail =dataval.some(val=>val==="");

    if(!('name' in data &&'phone' in data &&'email' in data &&'upi' in data &&'password' in data)){
         res.send({message:"Invalid fields. [name, phone, email,upi,password] Fields should be available"});

    }
    else if(isAvail){
        res.status(400).send({message:"field/fields should not be empty"});
    }
    else if(name.length>25){
        return res.status(400).send({message:"Invalid name"});
    }
    else if(phone.length>11 || phone.length<10 || !phoneRegex.test(phone[0]) ){
        return res.status(400).send({message:"Invalid Phone"});
    }
    else if(email.length>35 || !emailRegex.test(email)){
        return res.status(400).send({message:"Invalid email"});
    }
    else if(upi.length>25 || !upiRegex.test(upi)){
        return res.status(400).send({message:"Invalid upi"});
    }
    // else if (password.length >20){
    //     return res.status(400).send({message:"Invalid password"});
    // }
    else{
        next();
    }
    
}

function checkLandlordUpdateData (req,res,next){

    let data = req.body;
    const {name, phone, email, upi, password} = data;
    
    const phoneRegex = /^[06789]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const upiRegex = /^[^\s@]+@[^\s@]+$/;


    if(name){
        if(!name.length>25){
            next();
        }
        return res.status(400).send({message:"Invalid name"});
    }
    else if(phone){
        if(phone.length>11 || phone.length<10 || !phoneRegex.test(phone[0])){
            return res.status(400).send({message:"Invalid Phone"});
        }else{
            next();
        }
        
    }
    else if(email){
        if(email.length>35 || !emailRegex.test(email)){
            return res.status(400).send({message:"Invalid email"});
        }else{
            next();
        }
        
    }
    else if(upi){
        if(upi.length>25 || !upiRegex.test(upi)){
            return res.status(400).send({message:"Invalid upi"});
        }else{
            next();
        }
        
    }
    else if (password){
        if(password.length >20){
            return res.status(400).send({message:"Invalid password"});
        }else{
            next();
        }
        
    }else{

        next();
    }

}


const checkRentHolderCreateData = (req,res,next) =>{
    let data =req.body;
    const {name, phone, email, rent, password} = data;
    
    const phoneRegex = /^[06789]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    let dataval = [name, phone, email, rent, password];
    const isAvail =dataval.some(val=>val==="");
    
    if(!('name' in data &&'phone' in data &&'email' in data &&'rent' in data &&'password' in data)){
        res.send({message:"Invalid fields. [name, phone, email,rent,password] Fields should be available"});

   }
   else if(isAvail){
       res.send({message:"field/fields should not be empty"});
   }
    else if(name.length>25){
        return res.status(400).send({message});
    }
    else if(phone.length>11 || phone.length<10 || !phoneRegex.test(phone[0]) ){
        return res.status(400).send({message:"Invalid Phone"});
    }
    else if(email.length>35 || !emailRegex.test(email)){
        return res.status(400).send({message:"Invalid email"});
    }
    else if(rent.length>5){
        return res.status(400).send({message:"Invalid rent input"});
    }
    else if (password.length >20){
        return res.status(400).send({message:"Invalid password"});
    }else{
        next();
    }

}

function checkRentHolderUpdateData (req,res,next){
    let data =req.body;
    const {name, phone, email, rent, password} = data;

    const phoneRegex = /^[06789]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(name.length>25){
        return res.status(400).send({message:"Invalid name"});
    }
    else if(phone.length>11 || phone.length<10 || !phoneRegex.test(phone[0]) ){
        return res.status(400).send({message:"Invalid Phone"});
    }
    else if(email.length>35 || !emailRegex.test(email)){
        return res.status(400).send({message:"Invalid email"});
    }
    else if(rent.length>5){
        return res.status(400).send({message:"Invalid rent input"});
    }
    else if (password.length >20){
        return res.status(400).send({message:"Invalid password"});
    }else{
        next();
    }

}

function validateAdminReset(req,res,next){
    let resetKey = req.body.reset_key;
    
    if(resetKey == process.env.admin_reset_key){
        next();
    }else {
        res.status(400).send({message:'Invalid Reset Key'});
    }
 }

 function validateLogin(req,res,next){
    let data =req.body;
    const {phone, password} = data;

    const phoneRegex = /^[06789]/;

    let dataval = [ phone, password];
    const isAvail =dataval.some(val=>val==="");
    
    if(!('phone' in data &&'password' in data)){
        res.status(400).send({message:"Invalid fields. [name, phone, email,rent,password] Fields should be available."});

   }
   else if(isAvail){
       res.status(400).send({message:"field/fields should not be empty."});
   }
   else if(phone.length>11 || phone.length<10 || !phoneRegex.test(phone[0]) ){
    return res.status(400).send({message:"Invalid Phone."});
}
else{
    next();
}

 }


module.exports={
    checkLandlordCreateData,
    checkLandlordUpdateData,
    checkRentHolderCreateData,
    checkRentHolderUpdateData,
    validateAdminReset,
    validateLogin
}


