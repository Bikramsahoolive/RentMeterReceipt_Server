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

    const landlordDataRef = doc(db, "landlord", user.id);
    const docSnap1 =  await getDoc(landlordDataRef);
    let landlordData =docSnap1.data();
    
    if(landlordData.planExp===""){
        res.status(400).send({status:false,message:"Sorry! No Active Plan"});
        return;
    }else
    if(Date.parse(landlordData.planExp) < Date.now()){
        if(landlordData.plan!=="No Plan"){
         updateDoc(landlordDataRef,{plan:"No Plan",rcrCount:0,billCount:0,billCountRenewOn:""});
        }
    res.status(400).send({status:false,message:"your paln has expired"});
        return;
    }else{
        if(landlordData.billCount<=0){
            if(Date.parse(landlordData.billCountRenewOn)>Date.now()){
                res.status(400).send({status:false,message:"Your monthly bill quota has been reached,Please upgrade the plan"});
                return;
            }else{
                let date = new Date(landlordData.billCountRenewOn);
                date.setMonth(date.getMonth()+1);
                
                landlordData.billCountRenewOn = date.toISOString().split('T')[0];
                console.log(landlordData.billCountRenewOn);
                
                if(landlordData.plan ==='Pro'){
                    landlordData.billCount = 150;
                }else if(landlordData.plan==='Basic'){
                    landlordData.billCount = 40;
                }else{
                    landlordData.billCount = 10;
                }
                
                updateDoc(landlordDataRef, {billCountRenewOn:landlordData.billCountRenewOn});

            }
        }
    }
    landlordData.billCount -=1;
    updateDoc(landlordDataRef, {billCount:landlordData.billCount});

    data.landlord_id= user.id;
    data.landlord_name=user.name;
    
    data.paid_amt=0;
    data.payment_date="pending";
    data.payment_method="NA"

    data.id = JSON.stringify(Date.now());

   let calcVal = rentBillCalc(data);

const docSnap =  await getDoc(doc(db, "rentholder",calcVal.rentholder_id));
let rentholderData =docSnap.data();
        
   let dataRef = doc(db, "rentbill",calcVal.id);

                setDoc(dataRef, calcVal)
                .then(()=>{
                    res.send({status:true, id:calcVal.id,message:`Bill created with ID : ${calcVal.id}`});

                    const billMailData ={
                        email:rentholderData.email,
                        subject:'New Rent Bill is Generated -RentⓝMeter.Receipt',
                        content:`Hi ${rentholderData.name}!

We are pleased to inform you that your rent bill has been successfully created.

- **Bill Date**:  ${calcVal.billingDate}
- **Bill ID**:  ${calcVal.id}
- **Bill Amount**:  ₹${calcVal.final_amt}/-
- **Due Date**:  ${calcVal.dueDate}

Please ensure to pay the bill on or before the due date. You can also track your bill details by logging into your account at https://rnmr.vercel.app

Thank you,

Team RentⓝMeter.Receipt`,
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
    
    res.status(400).send({status:false,message:'No record fount.'});
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
        let billId = data.id;
        delete data.id;
        const docSnap = await getDoc(doc(db, "rentbill", req.params.id));

        if (docSnap.exists()) {
            let userdetails = jwt.verify(req.cookies.sid,process.env.sess_secret);
            let billData = docSnap.data();
            if(billData.landlord_id !== userdetails.id){
                res.status(400).send({status:'failure',message:'Unauthorized bill access.'});
                return;
            }
            let paidAmount = data.paid_amt;
            let toBePaid = billData.final_amt - billData.paid_amt;
            let remainingAmount = toBePaid - data.paid_amt;
            if(billData.final_amt == billData.paid_amt){
                res.status(400).send({status:"failure",message:"Bill already paid."});
                return;
            }else if(data.paid_amt > toBePaid ){
                res.status(400).send({status:"failure",message:"Invalid Paid Amount."});
                return;
            }
        let rentholderPaymentState=await updateRentHolderPaymentData(billData.rentholder_id,data.paid_amt);
        if(rentholderPaymentState.status){
            try {
                data.paid_amt = Number(billData.paid_amt) + Number(paidAmount);
                const dataRef = doc(db, "rentbill", req.params.id);
                updateDoc(dataRef, data);
                res.send({status:true,message:`Payment Done.`});

                let emailData = {
                    email:rentholderPaymentState.email,
                    subject:"Rent Bill Payment Confirmation.",
                    content:`Dear ${rentholderPaymentState.name},

We are pleased to inform you that your rent bill payment has been successfully processed.

- **Bill ID**:   ${billId};
- **Bill Amount**:   ₹${billData.final_amt}/-

- **Payment Date**:   ${data.payment_date}
- **Paid Amount**:   ₹${paidAmount}/-
- **Payment Method**:   ${data.payment_method}

- **Remaining Amount**:   ₹${remainingAmount}/-

You can view and track all your payment details by logging into your account at https://rnmr.vercel.app.

Thank you for your payment.

Best regards,

Team RentⓝMeter.Receipt`
                }
                sendMail(null,emailData)
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
        data.paid_amt = (+userData.paid_amt) + (+paidAmt);

        try {
            const dataRef = doc(db, "rentholder",id);
            updateDoc(dataRef, data);
            return {status:true,name:userData.name,email:userData.email};
        } catch (err) {
            return {status:false};
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