const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();

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

            let dataRef = doc(db, "request_landlord", JSON.stringify(rid));

            try {

                setDoc(dataRef, data);
                res.send({status:true,message:`Your request submitted successfully with id : ${rid}. Kindly Wait for admin response.`});

            } catch (error) {
                res.send(error);
            }
        
    }

    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send({message:"user already resister"});
    } else {
        finalSubmit(regId);
    }

}

async function signupStatus(req,res){

    const docSnap = await getDoc(doc(db, "request_landlord", JSON.stringify(req.params.id)));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.send("No Request Found!");
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