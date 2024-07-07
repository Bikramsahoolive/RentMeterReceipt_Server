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
            data.id = rid;
            data.userType = "landlord";
            data.photo='';
            data.signature='';

            let dataRef = doc(db, "landlord", rid);

            try {

                setDoc(dataRef, data);
                res.send({status:'success',message:`Landlord request Approved with
                     landlord Id ${rid}`});
                let clientApproveMailData={
                    email:data.email,
                    subject:'Info-RentⓝMeter.Receipt.',
                    content:`        Congratulation!!!
                    Your profile created with landlord id ${rid}
                    on RentⓝMeter.Receipt as a Landlord,
                    Now you can login with your
                    phone as user ID and password,
                    Have a great day.
                    
                    Thank You
		    Team -RentⓝMeter.Receipt
                    `
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
            phone:user.phone
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



module.exports = {
    createUserData,
    getAllUsers,
    updateUserData,
    getSingleUser,
    deleteUserData,
    loginLandlord,
}