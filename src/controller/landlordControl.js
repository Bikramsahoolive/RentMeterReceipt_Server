require('dotenv').config();
const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const mailer = require('./mailSender');
const { json } = require('express');
const myCache = require('../model/cache');
const { getStorage, ref, uploadString, getDownloadURL, deleteObject } = require("firebase/storage");

const storage = getStorage();


async function createUserData(req, res) {

    let data = req.body;
    if (!data.termNconditions) {
        res.send({ status: "failure", message: "error while creating laldlord profile" });
        return;
    }
    delete data.termNconditions;
    delete data.confPass;

    const dataRef = doc(db, "request_landlord", data.id);
    const docSnap = await getDoc(dataRef);

    if (docSnap.exists()) {
        let user = docSnap.data();
        if (user.otp !== data.otp || data.otpExp < Date.now()) {
            res.send({ status: "failure", message: "Invalid otp or otp expaired, try again." });
            return;
        }
        if (user.name !== data.name || user.phone !== data.phone || user.email !== data.email) {
            res.send({ status: "failure", message: "Registered data mismatch, try again" });
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

            let date = new Date();
            let year = date.getFullYear();
            let month = (date.getMonth() + 2).toString().padStart(2, '0');
            // let day = date.getDate().toString().padStart(2,'0');


            data.id = rid;
            data.userType = "Landlord";
            data.photo = '';
            data.signature = '';
            data.plan = 'Free';
            data.planExp = '2030-01-01';
            data.payout = 0;
            data.billCount = 10;
            data.billCountRenewOn = `${year}-${month}-01`;
            data.rcrCount = 5;

            let dataRef = doc(db, "landlord", rid);

            try {

                setDoc(dataRef, data);
                res.send({ status: 'success', message: `Landlord Profile Created with landlord Id: ${rid}` });
                let clientApproveMailData = {
                    email: data.email,
                    subject: 'Welcome to RentⓝMeter.Receipt! Landlord Registration Completed',
                    content: ` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; text-align: center;">Congratulations!</h2>
        <p>Your profile has been created  on <strong>RentⓝMeter.Receipt</strong>.</p>
        <p>As a landlord, you can now log in using your phone number as your user ID and password.</p>
        <p>We are excited to have you on board! <strong>RentⓝMeter.Receipt</strong> aims to make rental management effortless and efficient. Manage your properties, track payments, and communicate with tenants all in one place.</p>
        <p>Thank you for choosing <strong>RentⓝMeter.Receipt</strong>. If you have any questions, our support team is here to help.</p>
        <p style="text-align: center; margin-top: 40px;">Best regards,<br><strong>Team RentⓝMeter.Receipt</strong></p>
    </div>
    </div>`
                }
                mailer.sendMail(clientApproveMailData);

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

async function updateUserData(req, res) {
    let data = req.body;
    const id = req.params.id;
    try {

        if (data.password) {
            let hash = bcrypt.hashSync(data.password, 10);
            data.password = hash;
        }

        if (data.photo) {
            if (data.photo !== 'null') {
                const photoFilename = `photo_${id}`;
                const photoFile = data.photo;
                data.photoFileName = photoFilename;
                const storageRef2 = ref(storage, `photos/${photoFilename}`);
                const snapshot2 = await uploadString(storageRef2, photoFile, 'data_url');
                data.photo = await getDownloadURL(snapshot2.ref);
            } else {
                deleteObject(ref(storage, `photos/photo_${id}`));
                data.photo = "";
                data.photoFileName = "";
            }

        }

        if (data.signature) {
            if (data.signature !== 'null') {
                const docFilename = `sign_${id}`;
                const documentFile = data.signature;
                data.signFileName = docFilename;
                const storageRef = ref(storage, `signatures/${docFilename}`);
                const snapshot = await uploadString(storageRef, documentFile, 'data_url');
                data.signature = await getDownloadURL(snapshot.ref);
            } else {
                deleteObject(ref(storage, `signatures/sign_${id}`));
                data.signature = "";
                data.signFileName = "";
            }

        }

        // UPDATE DATA

        const dataRef = doc(db, "landlord", id);
        updateDoc(dataRef, data);
        res.send({ status: 'success', message: `Data updated Successfully.` });
        if (myCache.has(id)) myCache.del(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}



async function getSingleUser(req, res) {

    // GET SINGLE DATA

    if (myCache.has(req.params.id)) {
        const value = myCache.get(req.params.id);
        res.send(value);


    } else {
        const docSnap = await getDoc(doc(db, "landlord", req.params.id));

        if (docSnap.exists()) {
            let user = docSnap.data();
            delete user.password;
            const cacheStatus = myCache.set(req.params.id, user, 900);
            if (!cacheStatus) console.log('unable to cache landlord data.');
            res.send(user);
        } else {
            res.send({ status: "failure", message: "document not available" });
        }
    }


}

async function deleteUserData(req, res) {
    const id = req.params.id;
    const snap = await getDoc(doc(db, "landlord", id));
    const landlorddata = snap.data();

    async function deleteRentBill(id) {
        const q = query(collection(db, "rentbill"), where("landlord_id", "==", id));
        const querySnapshot = await getDocs(q);
        let user = []
        querySnapshot.forEach((doc) => {
            let d = doc.data()
            user.push(d.id);
        });
        // console.log(user);
        user.forEach((docId) => {
            deleteDoc(doc(db, "rentbill", docId));
            if (myCache.has(docId)) myCache.del(docId);
        });
    }

    async function deleteRentHolder(id) {
        const q = query(collection(db, "rentholder"), where("landlord_id", "==", id));
        const querySnapshot = await getDocs(q);
        const user = [];
        // const userId = [];
        querySnapshot.forEach((d) => {
            user.push(d.data());
        });
        user.forEach((rentholder) => {
            if (rentholder.photo) deleteObject(ref(storage, `photos/photo_${rentholder.id}`));
            if (rentholder.deedURL) deleteObject(ref(storage, `rent-documents/doc_${rentholder.id}`));
            deleteDoc(doc(db, "rentholder", rentholder.id));
            if (myCache.has(`rentholder_${rentholder.id}`)) myCache.del(`rentholder_${rentholder.id}`);
            if (myCache.has(rentholder.id)) myCache.del(rentholder.id);
            if (myCache.has(`bill_${rentholder.id}`)) myCache.del(`bill_${rentholder.id}`);
        });
    }

    //DELETE USER DATA

    if (landlorddata.photo) deleteObject(ref(storage, `photos/photo_${id}`));
    if (landlorddata.signature) deleteObject(ref(storage, `signatures/sign_${id}`));

    deleteDoc(doc(db, "landlord", id))
        .then(async () => {
            await deleteRentBill(id);
            await deleteRentHolder(id);
            res.send({ status: "success", message: "Deleted successfully" });
            if (myCache.has(id)) myCache.del(id);
            if (myCache.has(`bill_${id}`)) myCache.del(`bill_${id}`);

        })
        .catch((err) => res.send(err))

}


async function loginLandlord(req, res) {
    let data = req.body;
    // console.log(data);

    //GET FILTERED DATA
    try {
        const q = query(collection(db, "landlord"), where("phone", "==", (data.phone)));
        const querySnapshot = await getDocs(q);
        let user;
        querySnapshot.forEach((doc) => {
            user = doc.data();
        });

        if (user) {
            const match = await bcrypt.compare(data.password, user.password);
            if (match) {

                // req.session.key = user;
                let tokenData = { id: user.id, phone: user.phone, email: user.email, userType: user.userType, name: user.name };
                tokenData.isActive = true;
                tokenData.expairTime = Date.now() + 1200000;
                let responce = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isActive: true
                }
                const secretKey = process.env.sess_secret;
                const token = jwt.sign(tokenData, secretKey);
                responce.authToken = token;
                // res.cookie('sid',token,{sameSite:'None',secure:true});
                res.send(responce);
                if (data.fcm_token) updateDoc(doc(db, 'landlord', user.id), { fcm_token: data.fcm_token });
            } else { res.status(400).send({ message: "Invalid Password" }) }
        } else {
            res.status(400).send({ message: 'Invalid phone or password' });
        }
    } catch (error) {
        res.send(error);
    }


}

async function getPaymentDataForLandlord(req, res) {

    try {
        const user = jwt.verify(req.headers['authorization'], process.env.sess_secret);

        const q = query(collection(db, "paymentData"), where("landlordId", "==", (user.id)));
        const querySnapshot = await getDocs(q);
        let paymentData = [];
        querySnapshot.forEach((doc) => {
            paymentData.push(doc.data());
        });
        res.status(200).send(paymentData);

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error.');
    }


}

async function landlordPayout(req, res) {
    let data = req.body;
    let payoutData = await checkPayoutAlreadyExist(data.id);
    if (payoutData) {
        res.status(400).send({ message: "Payout already queued.", status: "failure" });
        return;
    }

    if (data.payout_amt < 100 || data.payout_amt > 50000) {
        res.status(400).send({ status: 'failure', message: 'Invalid payout amount (Should be ₹100 to ₹10,000).' });
        return;
    }
    let docref = doc(db, "payout", data.id);
    setDoc(docref, data)
    res.send({ status: "success", message: "Your payout request queued." });

    const adminMailData = {
        email: process.env.admin_email,
        subject: 'Payout Request',
        content: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #FF5733; text-align: center;">New Payout Request Pending</h2>
        <p>Hi Admin,</p>
        <p>A new payout request is pending in the queue for processing. Please find the details below:</p>

        <h3 style="color: #4CAF50;">Landlord Details:</h3>
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>ID:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.id}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>UPI ID:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.upi}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Account Number:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.account_no}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>IFSC:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.ifsc}</td>
            </tr>
        </table>

        <h3 style="color: #4CAF50; margin-top: 20px;">Payout Details:</h3>
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payout Amount:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">₹ ${data.payout_amt}/-</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Request Date:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.request_date}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Method:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.payout_method}</td>
            </tr>
        </table>

        <p style="margin-top: 20px;">Please ensure that this payout is processed within the next 3 to 5 working days.</p>
        <p style="text-align: center; margin-top: 40px;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
    </div>
</div>`
    }
    mailer.sendMail(adminMailData);
}

async function checkAlreadyQueuedPayoutRequest(req, res) {
    const id = req.params.id;
    let payoutData = await checkPayoutAlreadyExist(id);
    if (payoutData) {
        res.send(payoutData);
    } else {
        res.send({ message: "Payout data not found.", status: false });
    }
}

async function checkPayoutAlreadyExist(id) {

    const docSnap = await getDoc(doc(db, "payout", id));

    if (docSnap.exists()) {
        let payoutData = docSnap.data();

        return payoutData;
    } else {
        return false;
    }
}

async function getProcessedPayoutOfLandlord(req, res) {
    const user = jwt.verify(req.headers['authorization'], process.env.sess_secret);
    try {
        const q = query(collection(db, "post_payout"), where("id", "==", (user.id)));
        const querySnapshot = await getDocs(q);
        let data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        res.send(data)
    } catch (error) {

        console.log(error);
        res.status(500).send(error);

    }
}




// const rpid = "localhost"; 
// const origin ="http://localhost:4200";

const rpid = "rnmr.vercel.app";
const origin = "https://rnmr.vercel.app";

const rpname = "RentⓝMeter.Receipt";

async function registerChallenge(req, res) {
    try {
        let user = jwt.verify(req.headers['authorization'], process.env.sess_secret);

        const docSnap = await getDoc(doc(db, "landlord", user.id));

        if (docSnap.exists()) {
            user = docSnap.data();
            if (user.passkey_info) {
                return res.status(400).send({ status: false, message: 'passkey already registered.' });
            }

        }


        const chanllengePayload = await generateRegistrationOptions({
            rpID: rpid,
            rpName: rpname,
            userName: user.name,
            userDisplayName: user.name,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                // authenticatorAttachment:'platform'
            }
        });

        const dataRef = doc(db, "landlord", user.id);
        updateDoc(dataRef, { passkey_challlenge: chanllengePayload.challenge });


        res.json({ challenge: chanllengePayload });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);

    }
}

async function verifyChallenge(req, res) {
    const { publicKey } = req.body;

    try {

        let user = jwt.verify(req.headers['authorization'], process.env.sess_secret);

        const docSnap = await getDoc(doc(db, "landlord", user.id));

        if (docSnap.exists()) {
            user = docSnap.data();

        }
        const challenge = user.passkey_challlenge;

        const verifyChallengeData = await verifyRegistrationResponse({
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpid,
            response: publicKey
        });

        if (!verifyChallengeData.verified) {
            return res.status(400).json({ status: 'failure', message: 'Auth Data verification failed.' });
        }


        const passkyData = {
            credentialID: verifyChallengeData.registrationInfo.credentialID,
            credentialPublicKey: btoa(String.fromCharCode.apply(null, verifyChallengeData.registrationInfo.credentialPublicKey)),
            counter: verifyChallengeData.registrationInfo.counter,
            deviceType: verifyChallengeData.registrationInfo.credentialDeviceType,
            backedUp: verifyChallengeData.registrationInfo.credentialBackedUp,
            transports: publicKey.response.transports
        };
        const dataRef = doc(db, "landlord", user.id);
        updateDoc(dataRef, { passkey_info: passkyData, passkey_challlenge: '' });
        res.send({ status: 'success', message: 'passkey registered successfully.', name: user.name, id: user.id, userType: user.userType, phone: user.phone });

        if (myCache.has(user.id)) myCache.del(user.id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);

    }

}

async function authOptions(req, res) {
    const userId = req.params.id;

    try {
        const docSnap = await getDoc(doc(db, "landlord", userId));
        let user = {};
        if (docSnap.exists()) {
            user = docSnap.data();
            if (!user.passkey_info || user.passkey_info == "") {
                return res.send({ status: 'failure', message: 'Passkey not found, Please Re-register.' });
            }
        }
        let passkeyInfo = [];
        passkeyInfo.push(user.passkey_info);

        const option = await generateAuthenticationOptions({
            rpID: rpid,
            allowCredentials: passkeyInfo.map(passkey => ({
                id: passkey.credentialID,
                transports: passkey.transports
            }))
        });


        const dataRef = doc(db, "landlord", userId);
        updateDoc(dataRef, { passkey_challlenge: option.challenge });

        res.send({ option: option });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }


}

async function loginWithPasskey(req, res) {

    const { userId, publicKey } = req.body;

    try {

        const docSnap = await getDoc(doc(db, "landlord", userId));
        let user = {};
        if (docSnap.exists()) {
            user = docSnap.data();
            if (!user.passkey_info || user.passkey_info == "") {
                res.status(400).send({ status: false, message: 'Passkey not registered.' });
                return;
            }
        }

        const passkeyInfo = user.passkey_info;

        const binaryString = atob(passkeyInfo.credentialPublicKey);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        passkeyInfo.credentialPublicKey = bytes;

        const validateUser = await verifyAuthenticationResponse({
            response: publicKey,
            expectedOrigin: origin,
            expectedChallenge: user.passkey_challlenge,
            expectedRPID: rpid,
            authenticator: passkeyInfo
        });

        if (!validateUser.verified) {
            res.status(400).send({ status: "failure", message: "User Validation failed." });
            return;
        }

        let tokenData = { id: user.id, phone: user.phone, email: user.email, userType: user.userType, name: user.name };
        tokenData.isActive = true;
        tokenData.expairTime = Date.now() + 1200000;
        let responce = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: true
        }
        const secretKey = process.env.sess_secret;
        const token = jwt.sign(tokenData, secretKey);
        responce.authToken = token;
        // res.cookie('sid',token,{sameSite:'None',secure:true});

        res.send(responce);

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

}

function unregdPasskey(req, res) {
    const id = req.params.id;
    try {
        const docref = doc(db, 'landlord', id);
        updateDoc(docref, { passkey_info: "" });
        res.send({ status: 'success', message: 'Passkey De-registered' });

        if (myCache.has(id)) myCache.del(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

async function yearlyChartData(req, res) {
    const year = req.params.year;

    try {
        let data = jwt.verify(req.headers['authorization'], process.env.sess_secret);
    let id = data.id;


    const q = query(collection(db, "rentbill"), where('landlord_id', '==', id));
    const querySnapshot = await getDocs(q);
    const details = [];
    querySnapshot.forEach((doc) => {
        details.push(doc.data());
    });

    const requiredBillData = details.filter((bill) => {
        let billYear = new Date(+bill.id).getFullYear();
        if (billYear === +year) {
            return bill;
        }
    });

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthTotals = Array(12).fill(null).map(() => ({ totalAmount: 0, paid_amt: 0 }));

    requiredBillData.forEach(entry => {
        const [day, month, year] = entry.billingDate.split('-');
        const monthIndex = parseInt(month, 10) - 1;

        monthTotals[monthIndex].totalAmount += entry.final_amt || 0;
        monthTotals[monthIndex].paid_amt += entry.paid_amt || 0;

    });

    const monthsArray = [];
    const totalAmountArray = [];
    const paidAmountArray = [];

    monthTotals.forEach((totals, index) => {
        if (totals.totalAmount > 0 || totals.paid_amt > 0) {
            monthsArray.push(monthNames[index]);
            totalAmountArray.push(totals.totalAmount);
            paidAmountArray.push(totals.paid_amt);
        }
    });

    res.status(200).json({ status: 'success',message:'Yearly Chart Data Get Successfully.', months: monthsArray, billedAmount: totalAmountArray, paidAmount: paidAmountArray });

    } catch (error) {
        console.log(error);
        res.status(500).json({status:'failure',message:'Internal server error.'})
        
    }
}

async function totalChartData(req,res){

    try {

         let data = jwt.verify(req.headers['authorization'], process.env.sess_secret);
    let id = data.id;


    const q = query(collection(db, "rentbill"), where('landlord_id', '==', id));
    const querySnapshot = await getDocs(q);
    const details = [];
    querySnapshot.forEach((doc) => {
        details.push(doc.data());
    });

    // console.log(details);

    const billedData = {billedAmount:0,percent:'100'};
    const paidData = {paidAmount:0,percent:0};
    const pendingData = {pendingAmount:0,percent:0}

    details.forEach((bill)=>{
        billedData.billedAmount += bill.final_amt;
        paidData.paidAmount += bill.paid_amt;
        pendingData.pendingAmount += bill.final_amt-bill.paid_amt;
    })
    
    paidData.percent = (paidData.paidAmount/billedData.billedAmount*100).toFixed(2);
    pendingData.percent = (100 - paidData.percent).toFixed(2);

    res.status(200).json({status:'success',message:'Total Chart Data Get Successfully.',billedData,paidData,pendingData});

    } catch (error) {
        console.log(error);
        res.status(500).json({status:'failure',message:'Internal server error.'})
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
    checkAlreadyQueuedPayoutRequest,
    getProcessedPayoutOfLandlord,
    registerChallenge,
    verifyChallenge,
    authOptions,
    loginWithPasskey,
    unregdPasskey,
    getPaymentDataForLandlord,
    yearlyChartData,
    totalChartData
}