require('dotenv').config();
const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const mailer = require('./mailSender');
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
        // res.cookie('sid',token,{sameSite:'None',secure:true})
        admin.authToken = token;
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
        if(myCache.has(data.id))myCache.del(data.id);
    //set  complete Payout document.

    let tid = String(Date.now());
    const payoutRef = doc(db, "post_payout",tid);

    setDoc(payoutRef,data);
    //delete payout document.

    deleteDoc(doc(db, "payout",data.id));

    res.status(200).send({status:'success'});

    const landlordMail = {
        email:user.email,
        subject:"Payout Proccessed !",
        content:`<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Payout Processed Successfully</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Dear ${user.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">We are pleased to inform you that your payout has been successfully processed. Below are the details of your payout:</p>
            
            <ul style="list-style-type: none; padding: 0;">
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payout Processed Date:</strong> ${data.process_date}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payout Amount:</strong> ₹${data.payout_amt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payout Method:</strong> ${data.payout_method}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Transaction ID:</strong> ${data.payout_transactionId}</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.5;">You can view and track all your payout details by logging into your account at <a href="https://rnmr.vercel.app" style="color: #4CAF50;">RentⓝMeter.Receipt</a>.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
        </div>
    </div>
</div>`
    }

    mailer.sendMail(landlordMail);

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    

    
    
}

module.exports = { adminCreate, adminLogin, adminUpdate, resetAdmin, getAllPayoutData, processPayout };