const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();
const sendMail = require('./mailSender');


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
                    content:`Dear ${data.name},

You have requested OTP to create your account with RentⓝMeter.Receipt, Please use the following OTP (One Time Password) to proceed with the Registration process:

OTP: ${otp}

This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.

Thank you,
Team
RentⓝMeter.Receipt`
                }
                sendMail(null,clientEmailData);
                res.send({status:'success',message:'OTP Sent successfully.',id:rid});
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