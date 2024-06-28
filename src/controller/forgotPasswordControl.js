const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const sendMail=require('./mailSender');

async function forgotPasswordRequest(req,res){

        let data = req.body;

        try {
            const q = query(collection(db, data.userType), where("phone", "==",(data.phone)));
        const querySnapshot = await getDocs(q);
        let user ;
        querySnapshot.forEach((doc) => {
            user = doc.data();
        });
    
        if(user){
        let otpVal = await createOtp(user.userType,user.id,false);

        if(otpVal !==null){

            let otpMail = {
                email:user.email,
                subject:"Password Reset OTP RentⓝMeter.Receipt",
                content:`Dear ${user.name},

You have requested to reset your password for your account with RentⓝMeter.Receipt, Please use the following OTP (One Time Password) to proceed with the password reset process:

OTP: ${otpVal}

This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.

Thank you,
Team
RentⓝMeter.Receipt`
            }
            sendMail(null,otpMail);
            
            
let initialFour = user.email.split('@');
let emailSample = initialFour[0].slice(initialFour[0].length-4).concat(`@${initialFour[1]}`);


        res.send({status:'success',message:'otp sent',id:user.id,email:emailSample,usertype:user.userType});
        }else{
            res.status(400).send({status:'failure',message:'error while creating otp.'});
        }
        
        }else{
            res.status(400).send({status:'failure',message:'No user found.'});
        }
        } catch (error) {
            console.log(error);
            res.status(400).send({status:'falure',error:error});
        }
    
}

async function resendOtp(req,res){
    let data = req.body;
        let otpVal = await createOtp(data.usertype,data.id,true);
        if(otpVal!==null){
            const docSnap = await getDoc(doc(db, data.usertype,data.id));
           let user =  docSnap.data();

            let otpMail = {
                email:user.email,
                subject:"Password Reset OTP RentⓝMeter.Receipt",
                content:`Dear ${user.name},

You have requested to reset your password for your account with RentⓝMeter.Receipt, Please use the following OTP (One Time Password) to proceed with the password reset process:

OTP: ${otpVal}

This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.

Thank you,
Team
RentⓝMeter.Receipt`
            }
            sendMail(null,otpMail);
            res.send({status:'success',message:'Resend OTP Successfully.'});
        
        }else{
            res.status(400).send({status:'failure',message:'error while creating otp.'})
        }

}

async function forgotPasswordVerify(req,res){

    let data =req.body;

    const docSnap = await getDoc(doc(db, data.usertype,data.id));
        if (docSnap.exists()) {
           let userData=  docSnap.data();
            if (userData.otp && userData.otpExp && Date.now() < userData.otpExp){
                const match = data.otp === userData.otp;
                if(match){
                    let newPassword = bcrypt.hashSync(data.newPassword,10);
                    userData.password = newPassword;
                    delete userData.otp;
                    delete userData.otpExp;
                    const dataRef = doc(db,data.usertype,data.id);
                    setDoc(dataRef,userData);
                    res.send({status:'success',message:'Password Updated Successfully!'});
                }else{
                    res.send({status:'failure',message:'Invalid OTP.'});
                }
            }else{
                res.status(200).send({status:"expired",message:"OTP expired"})
            }
        }else{
            res.status(200).send({status:'failure',message:'error while fetching the user data'});
        }
}


async function createOtp( usertype,userid,isResend){
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    let otpData;

    if(!isResend){
        otpExpireTime = Date.now() + 600000;
        otpData={
            otp:otp,
            otpExp:otpExpireTime
        }
        setTimeout(()=>{
            clearOtp(usertype,userid);
        },600000);
    }else{
        otpData={
            otp:otp
        }
    }

    if (otp.length===6){
        const dataRef = await doc(db, usertype,userid);
        try {
            updateDoc(dataRef,otpData);

            return otp;
        } catch (error) {
            console.log(error);
            
        }
    }else{
        return null;
    }
    
}

async function clearOtp(userType,userId){
    try {

        const docSnap = await getDoc(doc(db, userType,userId));
        if (docSnap.exists()) {
           let userData=  docSnap.data()
           if(userData.otp && userData.otpExp){
            delete userData.otp;
           delete userData.otpExp;
           const dataRef = doc(db, userType,JSON.stringify (userId));
           setDoc(dataRef, userData);
           }
        } 
    } catch (error) {
        console.log(error);
    }

}

module.exports={forgotPasswordRequest,forgotPasswordVerify,resendOtp};