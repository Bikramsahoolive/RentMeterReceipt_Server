const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();
const mailer = require('./mailSender');


async function signupVerify(req,res){
    let data = req.body;
    // GET ALL IDs
    const querySnapshot = await getDocs(collection(db, "landlord"));

    const emails = [];
    const phones = [];

    querySnapshot.forEach((doc) => {
        emails.push(doc.data().email);
        phones.push(doc.data().phone);
    });

    let regId = `REG${Date.now()}`;

    // FINAL SUBMITION DATA
    
   async function finalSubmit(rid) {

            const q = query(collection(db, "request_landlord"), where("email", "==",data.email));
            const querySnapshot2 = await getDocs(q);
            let user=[];
                querySnapshot2.forEach((doc) => {
                    let d = doc.data();
                    user.push(d.id);
                });
            if(user){
                user.forEach((id)=>{
                    deleteDoc(doc(db, "request_landlord", id));
                });
            }

            data.id = rid;
            let otp = Math.floor(100000 + Math.random() * 900000).toString();
            data.otp = otp;
            data.otpExp = Date.now() + 600000;
            let dataRef = doc(db, "request_landlord",rid);
            try {
                setDoc(dataRef, data);
        
                let clientEmailData ={
                    email:data.email,
                    subject:"Registration OTP-RentⓝMeter.Receipt.",
                    content:`<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">OTP for Registration</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Dear ${data.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">You have requested an OTP to create your landlord profile with RentⓝMeter.Receipt. Please use the following OTP (One Time Password) to proceed with the registration process:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;">
                OTP: ${otp}
            </div>

            <p style="font-size: 16px; line-height: 1.5;">This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
        </div>
    </div>
</div>`
                }
                mailer.sendMail(clientEmailData,(resp)=>{
                    if(resp.status==='success'){
                        res.send({status:'success',message:'OTP Sent successfully.',id:rid});
                    }
                });
            } catch (error) {
                res.send(error);
            }
    }

    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send({status:'failure',message:"User Already Registered"});
    } else {
        finalSubmit(regId);
    }
}

module.exports= {
    signupVerify
};