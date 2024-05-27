const firebase = require('../model/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();



async function createUserData(req, res) {

    let data = req.body;
    // PASSWORD HASHING

    // function encPassword(pass) {
    //     let hash = bcrypt.hashSync(pass, 10);
    //     return hash;
    // }
    // data.password = encPassword(data.password);

    if(data.status === "approved"){

        // UPDATE DATA
    
        const dataRef = doc(db, "request_landlord", JSON.stringify(req.params.id));
    
        try {
           await updateDoc(dataRef, data);
        } catch (error) {
            res.send(error);
        }
    

    // GET ALL IDs
    const querySnapshot = await getDocs(collection(db, "landlord"));

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
            delete data.status;
            data.id = rid;
            data.userType = "landlord";

            let dataRef = doc(db, "landlord", JSON.stringify(rid));

            try {

                setDoc(dataRef, data);
                res.send({message:`Landlord request Approved with landlord Id ${rid}`});
               

            } catch (error) {
                res.send(error);
            }
        }
    }
    if (phones.includes(data.phone) || emails.includes(data.email)) {
        res.status(400).send({message:"User already exist"});
    } else {
        finalSubmit(num);
}
    }else if(data.status ==='rejected'){
        const dataRef = doc(db, "request_landlord",JSON.stringify( req.params.id));
    
        try {
           await updateDoc(dataRef, data);
            res.send({message:`Landlord request Rejected with id ${req.params.id}`});
        } catch (error) {
            res.send(error);
        }
    }
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

    if(data.userType){
        delete data.userType;
    }
    let hash = bcrypt.hashSync(data.password, 10);
    data.password = hash;

    // UPDATE DATA

    const dataRef = doc(db, "landlord", req.params.id);

    try {
        updateDoc(dataRef, data);
        res.send({status:true,message:`Data updated Successfully with id ${req.params.id}`});
    } catch (error) {
        res.send(error);
    }
}



async function getSingleUser(req, res) {

    // GET SINGLE DATA

    const docSnap = await getDoc(doc(db, "landlord", JSON.stringify(req.params.id)));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.send({status:"failure",message:"document not available"});
    }


}

async function deleteUserData(req, res) {
    let id =  req.params.id;

    //Delete related data.
   async function deleteMainBill (id){
    const q = query(collection(db, "mainmeter"), where("rentholder_id", "==",id));
    const querySnapshot = await getDocs(q);
    let user=[]
    querySnapshot.forEach((doc) => {
        let d = doc.data()
        user.push(d.id);
    });
        console.log(user);
    user.forEach((docId) => {
        deleteDoc(doc(db, "rentbill", docId));
      });
    }

    async function deleteRentBill (id){
    const q = query(collection(db, "rentbill"), where("landlord_id", "==",id));
    const querySnapshot = await getDocs(q);
    let user=[]
    querySnapshot.forEach((doc) => {
        let d = doc.data()
        user.push(d.id);
    });
        console.log(user);
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
            console.log(user);
        user.forEach((docId) => {
            deleteDoc(doc(db, "rentbill", docId));
          });
        }

    //DELETE USER DATA

    deleteDoc(doc(db, "landlord",id))
        .then(() => {
            deleteMainBill(id);
            deleteRentBill(id);
            deleteRentHolder(id);
            res.send({status:"success",message:"Deleted successfully"})
        
        })
        .catch((err) => res.send(err))

}


async function loginLandlord(req, res) {
    let data = req.body;
    console.log(data);

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
        user.isActive = true;
        user.expairTime = Date.now() + 600000;
        // req.session.key = user;
        delete user.password;
        delete user.photo;
        delete user.signature;
        const secretKey = process.env.sess_secret;
        const token = jwt.sign(user,secretKey);
        res.cookie('sid',token,{sameSite:'None',secure:true});
        res.send(user);

    } else { res.status(400).send({message:"Invalid Password"}) }
    }else{
        res.status(400).send({message:'Invalid phone or password'})
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