const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();
const sendMail = require('./mailSender');

async function signupLandlord(req,res){

        let data = req.body;

    // PASSWORD HASHING

    function encPassword(pass) {
        let hash = bcrypt.hashSync(pass, 10);
        return hash;
    }
    data.password = encPassword(data.password);

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
    
    function finalSubmit(rid) {
            
            data.id = rid;
            delete data.confPass;
            data.status ="pending";

            let dataRef = doc(db, "request_landlord",rid);

            try {

                setDoc(dataRef, data);
                res.send({status:true,message:`Your request submitted successfully with id : ${rid}. Kindly Wait for admin response.`});
                let clientEmailData ={
                    email:data.email,
                    subject:"Info-RentⓝMeter.Receipt.",
                    content:`You are Successfully register with Registration ID :${rid}. Please wait for admin response,The same will be notifyed you shortly. Thank You -Team RNMR.`
                }
                adminEmailData={
                    email:process.env.admin_email,
                    subject:"New Landlord Request",
                    content:`A new registration pending for approval
                        id:${rid}
                        Name:${data.name}
                        Phone:${data.phone}
                        email:${data.email}
                        please take necessary action.
                        Thank You -Team RNMR.
                    `
                }
                sendMail(null,clientEmailData);
                sendMail(null,adminEmailData);
            } catch (error) {
                res.send(error);
            }
        
    }

    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send({status:false,message:"user already resister"});
    } else {
        finalSubmit(regId);
    }

}

async function signupStatus(req,res){

    const docSnap = await getDoc(doc(db, "request_landlord",req.params.id));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.status(400).send({status:false,message:"No Request Found!"});
    }

}

async function getSignupDataOfLandlord (req,res){
    
    const querySnapshot = await getDocs(collection(db, "request_landlord"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    res.send(details);
   
}

module.exports={
    signupLandlord,
    signupStatus,
    getSignupDataOfLandlord

};