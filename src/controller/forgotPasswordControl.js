const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const mailer=require('./mailSender');

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
                content:`<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; text-align: center;">Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password for your account with <strong>RentⓝMeter.Receipt</strong>. Please use the following OTP (One-Time Password) to proceed with the password reset process:</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #4CAF50;">OTP: ${otpVal}</p>
        <p>This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.</p>
        <p style="text-align: center; margin-top: 40px;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
    </div>
</div>`
            }
            mailer.sendMail(otpMail,(resp)=>{
                if(resp.status==='success'){
                    let initialFour = user.email.split('@');
                    let emailSample = initialFour[0].slice(initialFour[0].length-4).concat(`@${initialFour[1]}`);
                    res.send({status:'success',message:'otp sent',id:user.id,email:emailSample,usertype:user.userType});
                }else{
                    res.send({status:'failure',message:'error while sending otp.'});
                    return
                }
            });
            
            

        }else{
            res.send({status:'failure',message:'error while creating otp.'});
        }
        
        }else{
            res.send({status:'failure',message:'No user found.'});
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
                content:`<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; text-align: center;">Resend OTP Request</h2>
        <p>Dear ${user.name},</p>
        <p>As per your request, we have resent the OTP (One-Time Password) to reset your password for your <strong>RentⓝMeter.Receipt</strong> account. Please use the following OTP to proceed with the password reset process:</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #4CAF50;">OTP: ${otpVal}</p>
        <p>This OTP is valid for 10 minutes. If you did not initiate this request, please disregard this email.</p>
        <p style="text-align: center; margin-top: 40px;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
    </div>
</div>`
            }
            mailer.sendMail(otpMail,(resp)=>{
                if(resp.status==='success'){
                    res.send({status:'success',message:'Resend OTP Successfully.'});
                }else{
                    res.send({status:'failure',message:'error while sending otp.'});
                }
            });
        
        }else{
            res.send({status:'failure',message:'error while creating otp.'})
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
                res.send({status:"expired",message:"OTP expired"})
            }
        }else{
            res.send({status:'failure',message:'error while fetching the user data'});
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
           const dataRef = doc(db, userType,userId);
           setDoc(dataRef, userData);
           }
        } 
    } catch (error) {
        console.log(error);
    }

}

module.exports={forgotPasswordRequest,forgotPasswordVerify,resendOtp};