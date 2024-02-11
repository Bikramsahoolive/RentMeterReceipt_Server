const firebase = require('../model/firebase');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const rentBillCalc = require('../calculation/rentBillCalc');

function createRentBill (req,res){
    let data = req.body;

    let user = req.session.key;

    data.landlord_id= user.id;
    data.fine_amt="0";
    data.fine_type="NA";
    data.paid_amt="0";
    data.payment_date="pending";

    data.id = JSON.stringify(Date.now());

   let calcVal = rentBillCalc(data);
//    res.send(calcVal);
        
   let dataRef = doc(db, "rentbill",calcVal.id);

                setDoc(dataRef, calcVal)
                .then(()=>res.send({status:'success',message:`rent bill created with bill no : ${calcVal.id}`}))
                .catch((err)=>res.send(err))

}

async function getAllRentBill(req,res){
    const querySnapshot = await getDocs(collection(db, "rentbill"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    res.send(details);
}




async function getLandlordRentBill(req,res){
    let data = req.session.key;
    let id = data.id;

const q = query(collection(db, "rentbill"), where('landlord_id', '==',id));
const querySnapshot = await getDocs(q);
const details = [];
querySnapshot.forEach((doc) => {
    details.push(doc.data());
});
if(details.length != 0){
    res.send(details);
}else{
    
    res.send('No data found');
}
}


async function getRentholderRentBill(req,res){
    let data = req.session.key;
    let id = data.id;

const q = query(collection(db, "rentbill"), where('rentholder_id', '==',id));
const querySnapshot = await getDocs(q);
const details = [];
querySnapshot.forEach((doc) => {
    details.push(doc.data());
});
if(details.length != 0){
    res.send(details);
}else{
    
    res.send('No data found');
}
}

async function getSingleRentBill(req,res){
    const docSnap = await getDoc(doc(db, "rentbill", JSON.stringify(req.params.id)));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.send("No such document!");
    }
}

function updateRentBill (req,res){

        let data = req.body;
        //other needed data will be updated later which require by frontend engg.
        let updateData ={paid_amt:data.paid_amt};

    try {
        const dataRef = doc(db, "rentbill", req.params.id);
        updateDoc(dataRef, updateData);
        res.send({status:'success',message:`Data updated Successfully with id ${req.params.id}`});
    } catch (error) {
        res.send(error);
    }
}


function deleteRentBill(req,res){
    deleteDoc(doc(db, "rentbill", req.params.id))
        .then(() => res.send({status:'success',message:`Rent Bill deleted successfully.`}))
        .catch((err) => res.send(err))
}

module.exports ={
    createRentBill,
    getAllRentBill,
    getLandlordRentBill,
    getRentholderRentBill,
    getSingleRentBill,
    updateRentBill,
    deleteRentBill
}