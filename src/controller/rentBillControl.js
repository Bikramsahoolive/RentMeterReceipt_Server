const firebase = require('../model/firebase');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const rentBillCalc = require('../calculation/rentBillCalc');
const jwt = require('jsonwebtoken');
const sendMail=require('./mailSender');



 async function createRentBill (req,res){
    let data = req.body;

    // let user = req.session.key;
    let user = jwt.verify(req.cookies.sid, process.env.sess_secret);

    data.landlord_id= user.id;
    data.landlord_name=user.name;
    data.fine_amt=0;
    data.fine_type="NA";
    data.paid_amt=0;
    data.payment_date="pending";

    data.id = JSON.stringify(Date.now());

   let calcVal = rentBillCalc(data);
//    res.send(calcVal);
const docSnap =  await getDoc(doc(db, "rentholder",calcVal.rentholder_id));
let rentholderData =docSnap.data();
        
   let dataRef = doc(db, "rentbill",calcVal.id);

                setDoc(dataRef, calcVal)
                .then(()=>{
                    res.send({status:true, id:calcVal.id,message:`Bill created with ID : ${calcVal.id}`});

                    const billMailData ={
                        email:rentholderData.email,
                        subject:'New Bill Created RNMR.',
                        content:`    Hi ${rentholderData.name}
                        This is to inform you,
                        that your bill created successfully with
                        Bill Id : ${calcVal.id}
                        Bill Date : ${calcVal.billingDate}
                        Bill Amount : ${calcVal.final_amt}
                        and the same will be pay on/before
                        ${calcVal.dueDate} .
                        Thank You Team-RNMR.
                        `,
                    }
                    sendMail(null,billMailData);
                })
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
    // let data = req.session.key;
    let data = jwt.verify(req.cookies.sid, process.env.sess_secret);
    let id = data.id;

const q = query(collection(db, "rentbill"), where('landlord_id', '==',id));
const querySnapshot = await getDocs(q);
const details = [];
querySnapshot.forEach((doc) => {
    details.push(doc.data());
});
if(details.length != 0){
    res.status(200).send(details);
}else{
    
    res.send({status:false,message:'No record fount.'});
}
}


async function getRentholderRentBill(req,res){
    // let data = req.session.key;
    let data = jwt.verify(req.cookies.sid, process.env.sess_secret);
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
    const docSnap = await getDoc(doc(db, "rentbill", req.params.id));

    if (docSnap.exists()) {
        res.send(docSnap.data())
    } else {
        res.send("No such document!");
    }
}

 async function updateRentBillPayment (req,res){

        let data = req.body;

        const docSnap = await getDoc(doc(db, "rentbill", req.params.id));

        if (docSnap.exists()) {
            let billData = docSnap.data();
            let paidAmount = data.paid_amt;
            let toBePaid = billData.final_amt - billData.paid_amt;
            if(billData.final_amt == billData.paid_amt){
                res.status(400).send({status:"failure",message:"Bill already paid."});
                return;
            }else if(data.paid_amt > toBePaid ){
                res.status(400).send({status:"failure",message:"Invalid Paid Amount."});
                return;
            }
        let rentholderPaymentState=await updateRentHolderPaymentData(billData.rentholder_id,data.paid_amt);
        if(rentholderPaymentState){
            try {
                data.paid_amt = Number(billData.paid_amt) + Number(paidAmount);
                const dataRef = doc(db, "rentbill", req.params.id);
                updateDoc(dataRef, data);
                res.send({status:true,message:`Payment Done.`});
            } catch (err) {
                res.status(400).send({error:err});
            }
        }else{
            res.status(400).send({status:false,message:'Rent holder not found.'})
        }
            
    
        } else {
            res.status(400).send({status:false,message:"document not found."});
        }
}

async function updateRentHolderPaymentData(id,paidAmt){
        let data={};
    const docSnap = await getDoc(doc(db, "rentholder", id));
    if(docSnap.exists()){
        let userData = docSnap.data();
        data.paid_amt = userData.paid_amt + paidAmt;

        try {
            const dataRef = doc(db, "rentholder",id);
            updateDoc(dataRef, data);
            return true;
        } catch (err) {
            return false;
        }

    }
}




async function addFineRentBill (req,res){
    let data = req.body;

    const docSnap = await getDoc(doc(db, "rentbill", req.params.id));

    if (docSnap.exists()) {
        let billData = docSnap.data()
        data.final_amt = (+billData.final_amt) + (+data.fine_amt);

        try {
            const dataRef = doc(db, "rentbill", req.params.id);
            updateDoc(dataRef, data);
            res.send({status:true,message:`Fine Added Successfully.`});
        } catch (err) {
            res.status(400).send({error:err});
        }

    } else {
        res.status(400).send({status:false,message:"document not found."});
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
    updateRentBillPayment,
    deleteRentBill,
    addFineRentBill
}