require('dotenv').config();
const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const sendMail=require('./mailSender');



async function createUserData(req, res) {

    let data = req.body;
    if(!data.termNconditions){
        res.send({status:"failure",message:"error while creating laldlord profile"});
        return;
    }
    delete data.termNconditions;
    delete data.confPass;

    const dataRef = doc(db, "request_landlord",data.id);
    const docSnap = await getDoc(dataRef);

    if (docSnap.exists()) {
        let user = docSnap.data();
        if(user.otp !== data.otp || data.otpExp< Date.now()){
            res.send({status:"failure",message:"Invalid otp or otp expaired, try again."});
            return;
        }
        if(user.name!== data.name || user.phone !==data.phone || user.email!== data.email){
            res.send({status:"failure",message:"Registered data mismatch, try again"});
            return;
        }
    }
    deleteDoc(dataRef);
    delete data.otp;

    // PASSWORD HASHING

    function encPassword(pass) {
        let hash = bcrypt.hashSync(pass, 10);
        return hash;
    }
    data.password = encPassword(data.password);

    // GET ALL IDs
    const querySnapshot = await getDocs(collection(db, "landlord"));

    const ids = [];
    // const emails = [];
    // const phones = [];

    querySnapshot.forEach((doc) => {
        ids.push(doc.data().id);
        // emails.push(doc.data().email);
        // phones.push(doc.data().phone);
    });

    // GENERATE DYNAMIC ID 
    function generateId() {

        let ritid = `LL${Math.round(Math.random(100000, 999999) * 1000000)}`;// or Date.now();

        finalSubmit(ritid);
    }
    // CHECK IF ID ALREADY INSERTED
    function checkId(idn) {

        return ids.includes(idn);
    }

    let num = `LL${Math.round(Math.random(100000, 999999) * 1000000)}`;

    // FINAL SUBMITION DATA
    
    function finalSubmit(rid) {

        if (checkId(rid)) {
            generateId();

        } else {

            let date= new Date();
            let year = date.getFullYear();
            let month =(date.getMonth()+2).toString().padStart(2,'0');
            // let day = date.getDate().toString().padStart(2,'0');
             

            data.id = rid;
            data.userType = "landlord";
            data.photo='';
            data.signature='';
            data.plan = 'Free';
            data.planExp = '2026-01-01';
            data.payout = 0;
            data.billCount = 10;
            data.billCountRenewOn = `${year}-${month}-01`;
            data.rcrCount= 5;

            let dataRef = doc(db, "landlord", rid);

            try {

                setDoc(dataRef, data);
                res.send({status:'success',message:`Landlord request Approved with
                     landlord Id ${rid}`});
                let clientApproveMailData={
                    email:data.email,
                    subject:'Welcome to RentⓝMeter.Receipt! Landlord Registration Completed',
                    content:`        Congratulations!

Your profile has been created with Landlord ID: ${rid} on RentⓝMeter.Receipt. As a landlord, you can now log in using your phone number as your user ID and the password you chose during registration.

We are excited to have you on board! RentⓝMeter.Receipt aims to make rental management effortless and efficient. Manage your properties, track payments, and communicate with tenants all in one place.

Thank you for choosing RentⓝMeter.Receipt. If you have any questions, our support team is here to help.

Best regards,

Team RentⓝMeter.Receipt`
                }
                sendMail(null,clientApproveMailData);
               
            } catch (error) {
                res.send(error);
                console.log(error);
            }
        }
    }

    finalSubmit(num);
}

async function getAllUsers(req, res) {

    // GET ALL DATA

    const querySnapshot = await getDocs(collection(db, "landlord"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    res.send(details);

}

function updateUserData(req, res) {
    let data = req.body;
    if (data.password){
    let hash = bcrypt.hashSync(data.password, 10);
    data.password = hash;
    }

    // UPDATE DATA

    const dataRef = doc(db, "landlord",req.params.id);

    try {
        updateDoc(dataRef, data);
        res.send({status:'success',message:`Data updated Successfully.`});
    } catch (error) {
        res.send(error);
    }
}



async function getSingleUser(req, res) {

    // GET SINGLE DATA

    const docSnap = await getDoc(doc(db, "landlord",req.params.id));

    if (docSnap.exists()) {
        let user = docSnap.data();
        delete user.password;
        res.send(user);
    } else {
        res.send({status:"failure",message:"document not available"});
    }


}

async function deleteUserData(req, res) {
    let id =  req.params.id;

    //Delete related data.
//    async function deleteMainBill (id){
//     const q = query(collection(db, "mainmeter"), where("rentholder_id", "==",id));
//     const querySnapshot = await getDocs(q);
//     let user=[]
//     querySnapshot.forEach((doc) => {
//         let d = doc.data()
//         user.push(d.id);
//     });
//         // console.log(user);
//     user.forEach((docId) => {
//         deleteDoc(doc(db, "rentbill", docId));
//       });
//     }

    async function deleteRentBill (id){
    const q = query(collection(db, "rentbill"), where("landlord_id", "==",id));
    const querySnapshot = await getDocs(q);
    let user=[]
    querySnapshot.forEach((doc) => {
        let d = doc.data()
        user.push(d.id);
    });
        // console.log(user);
    user.forEach((docId) => {
        deleteDoc(doc(db, "rentbill", docId));
      });
    }

    async function deleteRentHolder (id){
        const q = query(collection(db, "rentholder"), where("landlord_id", "==",id));
        const querySnapshot = await getDocs(q);
        let user=[]
        querySnapshot.forEach((doc) => {
            let d = doc.data()
            user.push(d.id);
        });
            // console.log(user);
        user.forEach((docId) => {
            deleteDoc(doc(db, "rentholder",docId));
          });
        }

    //DELETE USER DATA

    deleteDoc(doc(db, "landlord",id))
        .then(async() => {
            // deleteMainBill(id);
           await deleteRentBill(id);
           await deleteRentHolder(id);
            res.send({status:"success",message:"Deleted successfully"})
        
        })
        .catch((err) => res.send(err))

}


async function loginLandlord(req, res) {
    let data = req.body;
    // console.log(data);

    //GET FILTERED DATA
    try {
        const q = query(collection(db, "landlord"), where("phone", "==",(data.phone)));
    const querySnapshot = await getDocs(q);
    let user;
    querySnapshot.forEach((doc) => {
        user = doc.data();
    });

    if(user){
        const match = await bcrypt.compare(data.password, user.password);
    if (match) {

        // req.session.key = user;
        let tokenData = {id:user.id,phone:user.phone,email:user.email,userType:user.userType,name:user.name};
        tokenData.isActive = true;
        tokenData.expairTime = Date.now() + 1200000;
        let responce = {
            id:user.id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            isActive:true
        }
        const secretKey = process.env.sess_secret;
        const token = jwt.sign(tokenData,secretKey);
        res.cookie('sid',token,{sameSite:'None',secure:true});
        res.send(responce);

    } else { res.status(400).send({message:"Invalid Password"}) }
    }else{
        res.status(400).send({message:'Invalid phone or password'});
    }
    } catch (error) {
        res.send(error);
    }
    

}

async function landlordPayout(req,res){
    let data = req.body;
    let payoutData = await checkPayoutAlreadyExist(data.id);
    if(payoutData){
        res.status(400).send({message:"Payout already queued.",status:"failure"});
        return;
    }

    if(data.payout_amt < 100 || data.payout_amt > 10000){
        res.status(400).send({status:'failure',message:'Invalid payout amount (Should be ₹100 to ₹10,000).'});
        return;
    }
    let docref = doc(db,"payout",data.id);
    setDoc(docref,data)
    res.send({status:"success",message:"Your payout request queued."});

    const adminMailData = {
        email:process.env.admin_email,
        subject:'Payout Request pending.',
        content:`        Hi Admin !

A new payout request pending in queue to settle with
 

 Landlord details-:

 ID : ${data.id}
 Name: ${data.name}
 Phone : ${data.phone}
 Email : ${data.email}
 UPI ID : ${data.upi}

 Payout Amount : ₹ ${data.payout_amt}/-
 Request Date : ${data.request_date}

 And the same should be settled with in 3 to 5 days.
 

Team RentⓝMeter.Receipt`
    }
    sendMail(null,adminMailData);
}

async function checkAlreadyQueuedPayoutRequest(req,res){
    const id = req.params.id;
    let payoutData = await checkPayoutAlreadyExist(id);
    if(payoutData){
        res.send(payoutData);
    }else{
        res.send({message:"Payout data not found.",status:false});
    }
}

async function checkPayoutAlreadyExist(id){

    const docSnap = await getDoc(doc(db, "payout",id));

    if (docSnap.exists()) {
        let payoutData = docSnap.data();
        
        return payoutData;
    } else {
        return false;
    }
}


module.exports = {
    createUserData,
    getAllUsers,
    updateUserData,
    getSingleUser,
    deleteUserData,
    loginLandlord,
    landlordPayout,
    checkAlreadyQueuedPayoutRequest
}