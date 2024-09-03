const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();
const mailer = require('./mailSender');
const { getStorage, ref, uploadString, getDownloadURL, deleteObject } = require("firebase/storage");
const myCache = require('../model/cache');
const storage = getStorage();



async function createUserData(req, res) {

    let data = req.body;

    delete data.confPass;
    // PASSWORD HASHING
    let rentholderPassword = data.password;
    function encPassword(pass) {
        let hash = bcrypt.hashSync(pass, 10);
        return hash;
    }
    data.password = encPassword(data.password);

    let user = jwt.verify(req.cookies.sid, process.env.sess_secret);
    const docSnap = await getDoc(doc(db, "landlord", user.id));
    let landlordData = docSnap.data();

    if (landlordData.planExp === "") {
        res.status(400).send({ status: "failure", message: "Sorry! No Active Plan." });
        return;
    } else
        if (Date.parse(landlordData.planExp) < Date.now()) {
            if (landlordData.plan !== "No Plan") {
                updateDoc(landlordDataRef, { plan: "No Plan", rcrCount: 0, billCount: 0, billCountRenewOn: "" });
            }

            res.status(400).send({ status: "failure", message: "Your paln has been expired." });
            return;
        }

    // GET ALL IDs
    const querySnapshot = await getDocs(collection(db, "rentholder"));



    const q = query(collection(db, "rentholder"), where('landlord_id', '==', user.id));
    const querySnapshot3 = await getDocs(q);
    const details = [];
    querySnapshot3.forEach((doc) => {
        details.push(doc.data());
    });



    if (details.length >= landlordData.rcrCount) {
        res.status(400).send({ status: 'failure', message: "Maximum Rentholder Reached, Upgrade the plan for more registration." });
        return;
    }

    const ids = [];
    const emails = [];
    const phones = [];

    querySnapshot.forEach((doc) => {
        ids.push(doc.data().id);
        emails.push(doc.data().email);
        phones.push(doc.data().phone);
    });



    // GENERATE DYNAMIC ID 
    function generateId() {

        let ritid = `RH${Math.round(Math.random(100000, 999999) * 1000000)}`;// or Date.now();

        finalSubmit(ritid);
    }
    // CHECK IF ID ALREADY INSERTED
    function checkId(idn) {

        return ids.includes(idn);
    }

    let num = `RH${Math.round(Math.random(100001, 999999) * 1000000)}`;

    // FINAL SUBMITION DATA
    async function finalSubmit(rid) {

        if (checkId(rid)) {
            generateId();

        } else {
            // let user = req.session.key;

            data.landlord_id = user.id;
            data.landlord_name = user.name;
            data.paid_amt = 0;
            data.id = rid;
            data.userType = "Rentholder";

            let dataRef = doc(db, "rentholder", rid);


            try {
                if(data.deedURL){
                const docFilename = `doc_${rid}`;
                const documentFile = data.deedURL;
                data.docFileName = docFilename;
                const storageRef = ref(storage, `rent-documents/${docFilename}`);
                const snapshot = await uploadString(storageRef, documentFile, 'data_url');
                data.deedURL = await getDownloadURL(snapshot.ref);
                }

                if(data.photo){
                const photoFilename = `photo_${rid}`;
                const photoFile = data.photo;
                data.photoFileName = photoFilename;
                const storageRef2 = ref(storage, `photos/${photoFilename}`);
                const snapshot2 = await uploadString(storageRef2, photoFile, 'data_url');
                data.photo = await getDownloadURL(snapshot2.ref);
                }


                setDoc(dataRef, data);
                res.send({ status: true, message: `Rent holder created` });

                let rentHolderCreateMail = {
                    email: data.email,
                    subject: 'Info-RentⓝMeter.Receipt.',
                    content: `<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Registration Confirmation</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Dear ${data.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">You have been successfully registered as a rentholder by <strong>${user.name}</strong>. You can now log in to your account at <a href="https://rnmr.vercel.app" style="color: #4CAF50;">RentⓝMeter.Receipt</a> using the following credentials:</p>
            
            <ul style="list-style-type: none; padding: 0;">
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>User ID:</strong> ${data.phone}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Password:</strong> ${rentholderPassword}</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.5;">Once logged in, you will be able to view your rent and bill details, and make payments online.</p>
            <p style="font-size: 16px; line-height: 1.5;">We hope you have a great experience using our platform. If you have any questions or need assistance, please feel free to contact our support team.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
        </div>
    </div>
</div>`
                }
                mailer.sendMail(rentHolderCreateMail);

            } catch (error) {
                console.log(error);
                res.status(500).send(error);
            }

        }
    }
    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send({ status: 'failure', message: "user already exist" });
    } else {
        finalSubmit(num);
    }

}





async function getAllUsers(req, res) {
    let landlordId = req.params.id;

    // GET ALL DATA

    const querySnapshot = await getDocs(collection(db, "rentholder"));
    const details = [];
    querySnapshot.forEach((doc) => {
        details.push(doc.data());
    });
    if (details.length != 0) {
        res.send(details);
    } else { res.send('Document is empty.'); }
}





async function getRentholdersOfLandlord(req, res) {
    // let data = req.session.key;
    const data = jwt.verify(req.cookies.sid, process.env.sess_secret);
    const id = data.id;

    if(myCache.has(`rentholder_${id}`)){
        const cachedValue = myCache.get(`rentholder_${id}`);
        res.send(cachedValue);
    }else{
    const q = query(collection(db, "rentholder"), where('landlord_id', '==', id));
    const querySnapshot = await getDocs(q);
    const details = [];
    querySnapshot.forEach((doc) => {
        details.push(doc.data());
    });
    if (details.length != 0) {
        const cacheStatus = myCache.set(`rentholder_${id}`,details,900);
    if(!cacheStatus)console.log('unable to cache rentholders of landlord.');
        res.send(details);
    } else {

        res.status(400).send({ status: false, message: 'No data found' });
    }
}
}



async function updateUserData(req, res) {

    // UPDATE DATA
    const user = jwt.verify(req.cookies.sid, process.env.sess_secret);
    let data = req.body;
    const id = req.params.id
    

    try {

        if (data.password) {
            let hash = bcrypt.hashSync(data.password, 10);
            data.password = hash;
        }

        if (data.photo) {

            const photoFilename = `photo_${id}`;
            const photoFile = data.photo;
            data.photoFileName = photoFilename;
            const storageRef2 = ref(storage, `photos/${photoFilename}`);
            const snapshot2 = await uploadString(storageRef2, photoFile, 'data_url');
            data.photo = await getDownloadURL(snapshot2.ref);

        }

        if (data.deedURL) {
            const docFilename = `doc_${id}`;
            const documentFile = data.deedURL;
            data.docFileName = docFilename;
            const storageRef = ref(storage, `rent-documents/${docFilename}`);
            const snapshot = await uploadString(storageRef, documentFile, 'data_url');
            data.deedURL = await getDownloadURL(snapshot.ref);

        }

        const dataRef = doc(db, "rentholder", id);
        updateDoc(dataRef, data);
        res.send({ status: 'success', message: `Data updated Successfully.` });
        if(myCache.has(`rentholder_${user.id}`))myCache.del(`rentholder_${user.id}`);
        if(myCache.has(`rentholder_${id}`))myCache.del(`rentholder_${id}`);
        if(myCache.has(id))myCache.del(id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}



async function getSingleUser(req, res) {

    // GET SINGLE DATA
    
    //use node cache here;
    if(myCache.has(req.params.id)){
        const value = myCache.get(req.params.id);
         res.send(value);
    }else{
    const docSnap = await getDoc(doc(db, "rentholder", req.params.id));

    if (docSnap.exists()) {
        const rentholderData = docSnap.data();
        const cacheStatus = myCache.set(req.params.id,rentholderData,900);
        if(!cacheStatus)console.log('unable to cache landlord data.');
        res.send(rentholderData);
    } else {
        res.send("No such document!");
    }
    }

}



async function deleteUserData(req, res) {
    const id = req.params.id
    // Delete related data. 
    try {
        const snap = await getDoc(doc(db, "rentholder",id));
        const user = snap.data();
    async function deleteRentBill(id) {
        const q = query(collection(db, "rentbill"), where("rentholder_id", "==", id));
        const querySnapshot = await getDocs(q);
        let user = []
        querySnapshot.forEach((doc) => {
            let d = doc.data()
            user.push(d.id);
        });
        user.forEach((docId) => {
            deleteDoc(doc(db, "rentbill", docId));
            if(myCache.has(docId))myCache.del(docId);
        });
    }

    // //DELETE USER DATA.

    if(user.photo)deleteObject(ref(storage, `photos/photo_${id}`));
    if(user.deedURL)deleteObject(ref(storage, `rent-documents/doc_${id}`));

    if(myCache.has(`bill_${user.id}`))myCache.del(`bill_${user.id}`);
    if(myCache.has(`bill_${user.landlord_id}`))myCache.del(`bill_${user.landlord_id}`);
    if(myCache.has(`rentholder_${user.landlord_id}`))myCache.del(`rentholder_${user.landlord_id}`)

    deleteDoc(doc(db, "rentholder", id))
        .then(() => {
            deleteRentBill(id);
            res.send({ status: true, message: `Deleted successfully` });
            if(myCache.has(`rentholder_${id}`))myCache.del(`rentholder_${id}`);
            if(myCache.has(id))myCache.del(id);
        })
        .catch((err) => res.status(500).send(err))
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

}


async function loginRentHolder(req, res) {
    let data = req.body;

    //GET FILTERED DATA

    const q = query(collection(db, "rentholder"), where("phone", "==", (data.phone)));
    const querySnapshot = await getDocs(q);
    let user;
    querySnapshot.forEach((doc) => {
        user = doc.data();
    });

    if (user) {
        const match = await bcrypt.compare(data.password, user.password);
        if (match) {
            let tokenData = { id: user.id, phone: user.phone, email: user.email, userType: user.userType, name: user.name };
            tokenData.isActive = true;
            tokenData.expairTime = Date.now() + 1200000;
            let responce = {
                id: user.id,
                landlord_id: user.landlord_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                rent: user.rent,
                member_count: user.member_count,
                isActive: true
            }
            const secretKey = process.env.sess_secret;
            const token = jwt.sign(tokenData, secretKey);
            res.cookie('sid', token, { sameSite: 'None', secure: true });
            res.send(responce);

        } else { res.status(400).send("Invalid Password"); }
    } else { res.status(400).send('Invalid phone or password.'); }

}



module.exports = {
    createUserData,
    getAllUsers,
    getRentholdersOfLandlord,
    updateUserData,
    getSingleUser,
    deleteUserData,
    loginRentHolder,
};