const firebase = require('../model/firebase');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const rentBillCalc = require('../calculation/rentBillCalc');

function createRentBill (req,res){
    let data = req.body;

    let user = req.session.key;

    data.landlord_id= user.id;

    data.id = JSON.stringify(Date.now());

   let calcVal = rentBillCalc(data);
//    res.send(calcVal);
        
   let dataRef = doc(db, "rentbill","1546852");

                setDoc(dataRef, calcVal)
                .then(()=>res.send(`rent bill created with bill no : ${calcVal.id}`))
                .catch((err)=>res.send(err))

}

module.exports ={
    createRentBill
}