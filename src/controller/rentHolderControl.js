const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query, increment } = require('firebase/firestore');
const db = getFirestore();
const sendMail = require('./mailSender');



async function createUserData(req, res) {

    let data = req.body;

    // PASSWORD HASHING
    let rentholderPassword = data.password;
    function encPassword(pass) {
        let hash = bcrypt.hashSync(pass, 10);
        return hash;
    }
    data.password = encPassword(data.password);

    // GET ALL IDs
    const querySnapshot = await getDocs(collection(db, "rentholder"));

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
    function finalSubmit(rid) {

        if (checkId(rid)) {
            generateId();

        } else {
            // let user = req.session.key;
            let user =jwt.verify(req.cookies.sid, process.env.sess_secret);
            data.landlord_id = user.id;
            data.landlord_name = user.name;
            data.paid_amt = "0";
            data.id = rid;
            data.userType = "rentholder";

            let dataRef = doc(db, "rentholder", rid);

            try {

                setDoc(dataRef, data);
                res.send({status:true,message:`Rent holder created`});

                let rentHolderCreateMail={
                    email:data.email,
                    subject:'Info-RentⓝMeter.Receipt.',
                    content:`Dear ${data.name},
                    Your are registered as a rentholder with id ${rid}
                     by ${user.name},
                    Now you can login on http://rnmr.vercel.app with,

                    User ID: ${data.phone}
                    Password: ${rentholderPassword}
                    
                    to get your rent bill details.
                    Have a great day.

                    Thank You
                    Team
                    RentⓝMeter.Receipt.
                    `
                }
                sendMail(null,rentHolderCreateMail);

            } catch (error) {
               console.log(error);
            }

        }
    }
    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send("user already exist");
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
    if(details.length!=0){
        res.send(details);
    }else{res.send('Document is empty.');}
}





async function getRentholdersOfLandlord (req,res){
    // let data = req.session.key;
    let data = jwt.verify(req.cookies.sid, process.env.sess_secret);
    let id = data.id;

const q = query(collection(db, "rentholder"), where('landlord_id', '==',id));
const querySnapshot = await getDocs(q);
const details = [];
querySnapshot.forEach((doc) => {
    details.push(doc.data());
});
if(details.length != 0){
    res.send(details);
}else{
    
    res.send({status:false,message:'No data found'});
}
}



function updateUserData(req, res) {

    // UPDATE DATA

    let data = req.body;
    if (data.password){
        let hash = bcrypt.hashSync(data.password, 10);
        data.password = hash;
        }
    const dataRef = doc(db, "rentholder", req.params.id);

    try {
        updateDoc(dataRef, data);
        res.send({status:'success',message:`Data updated Successfully.`});
    } catch (error) {
        res.send(error);
    }
}



async function getSingleUser(req, res) {

    // GET SINGLE DATA
    const docSnap = await getDoc(doc(db, "rentholder", req.params.id));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.send("No such document!");
    }


}



function deleteUserData(req, res) {
    let id =req.params.id
    // Delete related data. 
    async function deleteRentBill(id){const q = query(collection(db, "rentbill"), where("rentholder_id", "==",id));
    const querySnapshot = await getDocs(q);
    let user=[]
    querySnapshot.forEach((doc) => {
        let d = doc.data()
        user.push(d.id);
    });
    user.forEach((docId) => {
        deleteDoc(doc(db, "rentbill", docId));
      });}

    // //DELETE USER DATA.

    deleteDoc(doc(db, "rentholder", id))
        .then(() => {
            deleteRentBill(id);
            res.send({status:true,message:`Deleted successfully`});
    })
        .catch((err) => res.send(err))

}


async function loginRentHolder(req, res) {
    // let data = req.body;

    //GET FILTERED DATA

    // const q = query(collection(db, "rentholder"), where("phone", "==",(data.phone)));
    // const querySnapshot = await getDocs(q);
    // let user;
    // querySnapshot.forEach((doc) => {
    //     user = doc.data();
    // });

    // if(user){
    //     const match = await bcrypt.compare(data.password, user.password);
    // if (match) {
    //     user.isActive = true;
    //     user.expairTime = Date.now() + 600000;
    //     req.session.key = user;
        
    //     res.send(user);

    // } else { res.send("Invalid Password");}
    // }else{ res.send('Invalid phone or password.');}

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