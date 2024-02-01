const firebase= require('../model/firebase');
const {getFirestore,  doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query} = require('firebase/firestore');
const db = getFirestore();
const{mainBill} = require('../calculation/mainBillCalc');

function createMainMeterBill(req,res){
    let data = req.body;

    let user = req.session.key;

    data.landlord_id= user.id;
    data.consumerName = user.name;
    let id =JSON.stringify( Date.now());
    data.id = `mBILL${id.slice(4,10)}`;

   let calcVal = mainBill(data);
//    res.send(calcVal);
        
   let dataRef = doc(db, "mainmeter", JSON.stringify(calcVal.id));

            try {

                setDoc(dataRef, calcVal);
                res.send(`Main Meter Bill Created with Bill number ${calcVal.id}`);
               

            } catch (error) {
                res.send(error);
            }

}


async function getAllMainBill(req,res){
    const querySnapshot = await getDocs(collection(db, "mainMeter"));
    const details = [];
    querySnapshot.forEach((doc) => {
        
        details.push(doc.data());
    });
    res.send(details);
}




async function getLandlordMainBill(req,res){
    let data = req.session.key;
    let id = data.id;

const q = query(collection(db, "mainMeter"), where('landlord_id', '==',id));
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

async function getSingleMainBill(req,res){
    const docSnap = await getDoc(doc(db, "mainMeter", JSON.stringify(req.params.id)));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.send("No such document!");
    }
}


function deleteMainBill(req,res){
    deleteDoc(doc(db, "mainMeter", JSON.stringify(req.params.id)))
        .then(() => res.send(`Main Meter Bill deleted successfully.`))
        .catch((err) => res.send(err))
}


module.exports = {
    createMainMeterBill,
    getAllMainBill,
    getLandlordMainBill,
    getSingleMainBill,
    deleteMainBill
}