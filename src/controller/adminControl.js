require('dotenv').config();
const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();


async function adminCreate(req, res) {
    const querySnapshot = await getDocs(collection(db, "admin"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    if(details.length == 0){
        let pass= bcrypt.hashSync(process.env.admin_pass, 10);
        let adminData ={
            name:process.env.admin_name,
            phone:process.env.admin_phone,
            email:process.env.admin_email,
            password:pass,
            userType:"admin"
        }
        let dataRef = doc(db, "admin", "RNMR_ADMIN");
        try {

            setDoc(dataRef, adminData);
           res.send("<h1 style='color:green; display:flex; align-item:center;justify-content:center;'>Admin Created Successfully!</h1>");

        } catch (error) {
            res.send(error);
        }
        
    }else{
        res.send("<h1 style='color:green; display:flex; align-item:center;justify-content:center;'>Admin Already Created.</h1>");
    }
   
}


async function resetAdmin (req,res){
    let pass= bcrypt.hashSync(process.env.admin_pass, 10);
    let adminData ={
            name:process.env.admin_name,
            phone:process.env.admin_phone,
            email:process.env.admin_email,
            password:pass
        }
        const dataRef = doc(db, "admin", "RNMR_ADMIN");

    try {
        await updateDoc(dataRef,adminData );
        res.send('Admin data reset successfully.');
    } catch (error) {
        res.send(error);
    }
}

async function adminLogin(req, res) {
    let data = req.body;

    //GET FILTERED DATA

    const q = query(collection(db, "admin"), where("phone", "==",(data.phone)));
    const querySnapshot = await getDocs(q);
    let admin;
    querySnapshot.forEach((doc) => {
        admin = doc.data();
    });
    
    if(admin!==undefined){
    if(admin){
        const match = await bcrypt.compare(data.password, admin.password);
    if (match) {
        admin.isActive = true;
        admin.expairTime = Date.now() + 1200000;
        // req.session.key = admin;
        let token = jwt.sign(admin,process.env.sess_secret);
        res.cookie('sid',token,{sameSite:'None',secure:true})
        res.send(admin);

    } else { res.send("Invalid Password") }
    }else{
        res.send('Invalid phone or password.')
    }
}else{
    res.send("No admin data found!")
}
}

async function adminUpdate(req, res) {
    let data = req.body;
    if(data.userType){
        delete data.userType;
    }
    if(data.password){
    let hash = await bcrypt.hashSync(data.password, 10);
    data.password = hash;
    }

    // UPDATE DATA

    const dataRef = doc(db, "admin", "RNMR_ADMIN");

    try {
        updateDoc(dataRef, data);
        res.send(`Admin Data updated Successfully.`);
    } catch (error) {
        res.send(error);
    }
}

async function getAllPayoutData(req,res){
    const querySnapshot = await getDocs(collection(db, "payout"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    res.send(details);
}

async function processPayout(req,res){

    let data = req.body;

    //minus landlord payout amount.

    try {
        const dataRef = doc(db, "landlord",data.id);

    const docSnap = await getDoc(dataRef);
    let user;
    if (docSnap.exists()) {
         user = docSnap.data();
         
    } else {
        res.status(400).send({status:"failure",message:"landlord data not found"});
        return;
    }

    const newPayoutAmount = (+user.payout) - (+data.payout_amt);

        updateDoc(dataRef, {payout:newPayoutAmount});

    //set  complete Payout document.

    let tid = String(Date.now());
    const payoutRef = doc(db, "post_payout",tid);

    setDoc(payoutRef,data);
    //delete payout document.

    deleteDoc(doc(db, "payout",data.id));

    res.status(200).send({status:'success'});
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    

    
    
}

module.exports = { adminCreate, adminLogin, adminUpdate, resetAdmin, getAllPayoutData, processPayout };