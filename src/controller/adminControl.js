require('dotenv').config();
const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
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
            password:pass
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

    if(admin){
        const match = await bcrypt.compare(data.password, admin.password);
    if (match) {
        admin.isActive = true;
        admin.expairTime = Date.now() + 600000;
        req.session.key = admin;
        
        res.send(admin);

    } else { res.send("Invalid Password") }
    }else{
        res.send('Invalid phone or password.')
    }
}

async function adminUpdate(req, res) {
    let data = req.body;
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

module.exports = { adminCreate, adminLogin, adminUpdate, resetAdmin };