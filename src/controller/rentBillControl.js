const firebase = require('../model/firebase');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();
const rentBillCalc = require('../calculation/rentBillCalc');
const jwt = require('jsonwebtoken');
const mailer=require('./mailSender');
const NodeCache = require('node-cache');
const myCache = new NodeCache({stdTTl:100});
const Razorpay = require('razorpay');


const razorpay = new Razorpay({
    key_id:process.env.key_id,
    key_secret:process.env.key_secret
  });


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
                res.status(400).send({status:false,message:"Your monthly bill quota has been reached, Upgrade plan"});
                return;
            }else{
                let date = new Date(landlordData.billCountRenewOn);
                date.setMonth(date.getMonth()+1);
                landlordData.billCountRenewOn = date.toISOString().split('T')[0];
                // console.log(landlordData.billCountRenewOn);
                
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
    data.payment_method="NA";
    data.transaction_id = "NA";

    data.id = JSON.stringify(Date.now());

   let calcVal = rentBillCalc(data);

   if(calcVal.final_amt===0){
    res.status(400).send({status:false,message:"Invalid Bill = (0)"});
    return;
   }

const docSnap =  await getDoc(doc(db, "rentholder",calcVal.rentholder_id));
let rentholderData =docSnap.data();
        
   let dataRef = doc(db, "rentbill",calcVal.id);

                setDoc(dataRef, calcVal)
                .then(()=>{
                    res.send({status:true, id:calcVal.id,message:`Bill created with ID : ${calcVal.id}`});

                    const billMailData ={
                        email:rentholderData.email,
                        subject:'New Rent Bill is Created -RentⓝMeter.Receipt',
                        content:`<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Rent Bill Created</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Hi ${rentholderData.name}!</p>
            <p style="font-size: 16px; line-height: 1.5;">This is to inform you that your rent bill has been successfully created. Below are the details:</p>

            <ul style="list-style-type: none; padding: 0;">
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill Date:</strong> ${calcVal.billingDate}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill ID:</strong> ${calcVal.id}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill Amount:</strong> ₹${calcVal.final_amt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Due Date:</strong> ${calcVal.dueDate}</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.5;">Please ensure to pay the bill on or before the due date. You can track your bill details by logging into your account:</p>
            <a href="https://rnmr.vercel.app" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">View Bill Details</a>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you,<br><strong>Team RentⓝMeter.Receipt</strong></p>
            <p style="font-size: 14px; color: #666;">If you have any questions, please don't hesitate to <a href="mailto:support@rnmr.vercel.app" style="color: #4CAF50;">contact us</a>.</p>
        </div>
    </div>
</div>`
}
                mailer.sendMail(billMailData);

                })
                .catch((err)=>res.status(500).send(err));

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

    if(myCache.has(`bill_${id}`)){
        const cachedValue = myCache.get(`bill_${id}`);
        res.send(cachedValue);
    }else{
const q = query(collection(db, "rentbill"), where('landlord_id', '==',id));
const querySnapshot = await getDocs(q);
const details = [];
querySnapshot.forEach((doc) => {
    details.push(doc.data());
});
if(details.length != 0){
    const cacheStatus = myCache.set(`bill_${id}`,details,900);
    if(!cacheStatus)console.log('unable to cache landlord rent bills.');
    res.status(200).send(details);
}else{
    
    res.status(400).send({status:false,message:'No record fount.'});
}
    }
}


async function getRentholderRentBill(req,res){
    // let data = req.session.key;
    const data = jwt.verify(req.cookies.sid, process.env.sess_secret);
    const id = data.id;

    if(myCache.has(`bill_${id}`)){
        const cachedValue = myCache.get(`bill_${id}`);
        res.send(cachedValue);
        
    }else{

const q = query(collection(db, "rentbill"), where('rentholder_id', '==',id));
const querySnapshot = await getDocs(q);
const details = [];
querySnapshot.forEach((doc) => {
    details.push(doc.data());
});
if(details.length != 0){

    const cacheStatus = myCache.set(`bill_${id}`,details,900);
    if(!cacheStatus)console.log('unable to cache rentholder rent bills.');
    res.send(details);
}else{
    
    res.send('No data found');
}
    }
}

async function getSingleRentBill(req,res){
    if(myCache.has(req.params.id)){
        const value = myCache.get(req.params.id);
         res.send(value);
    }else{
    const docSnap = await getDoc(doc(db, "rentbill", req.params.id));

    if (docSnap.exists()) {
        const billData = docSnap.data();
        const cacheStatus = myCache.set(req.params.id,billData,900);
        if(!cacheStatus)console.log('unable to cache landlord data.');
        res.send(billData)
    } else {
        res.send("No such document!");
    }
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

                
                if(myCache.has(`bill_${billData.rentholder_id}`))myCache.del(`bill_${billData.rentholder_id}`);
                if(myCache.has(`bill_${billData.landlord_id}`))myCache.del(`bill_${billData.landlord_id}`);
                if(myCache.has(req.params.id))myCache.del(req.params.id);

                let emailData = {
                    email:rentholderPaymentState.email,
                    subject:"Rent Bill Payment Confirmation.",
                    content:`<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Payment Processed</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Dear ${rentholderPaymentState.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">We are pleased to inform you that your rent bill payment has been successfully processed. Below are the details:</p>

            <ul style="list-style-type: none; padding: 0;">
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill ID:</strong> ${billId}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill Amount:</strong> ₹${billData.final_amt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payment Date:</strong> ${data.payment_date}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Paid Amount:</strong> ₹${paidAmount}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payment Method:</strong> ${data.payment_method}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Remaining Amount:</strong> ₹${remainingAmount}/-</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.5;">You can view and track all your payment details by logging into your account at <a href="https://rnmr.vercel.app" style="color: #4CAF50;">RentⓝMeter.Receipt</a>.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you for your payment.<br><strong>Best regards,</strong><br>Team RentⓝMeter.Receipt</p>
        </div>
    </div>
</div>`
 }
                mailer.sendMail(emailData);
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
            return {status:true,name:userData.name,email:userData.email,landlord_id:userData.landlord_id};
        } catch (err) {
            return {status:false};
        }

    }
}

async function updateCapturedPaymentData(req,res){
    const {paymentId,paymentDate}=req.body;
    try {
        const paymentDetails = await razorpay.payments.fetch(paymentId);
          if(paymentDetails.status==="captured"){
            const docSnap = await getDoc(doc(db, "rentbill",paymentDetails.notes.billId));
            let billdata ;
            if (docSnap.exists()) {
                billdata = docSnap.data();
            }
            if(billdata.final_amt <= billdata.paid_amt){
                res.status(400).send({status:'failure',message:"Payment Processing Canceled."});
                return;
            }

            let capAmount =(+paymentDetails.notes.billAmt) + (+billdata.paid_amt);
            let rentholderPaymentState = await updateRentHolderPaymentData(billdata.rentholder_id,paymentDetails.notes.billAmt);
            const landlordDocSnap = await getDoc(doc(db, "landlord",rentholderPaymentState.landlord_id));
            const landlordData = landlordDocSnap.data();
            let payoutVal = (+landlordData.payout) + (+paymentDetails.notes.billAmt);
            
            const landlorddataRef = doc(db, "landlord", landlordData.id);
                  updateDoc(landlorddataRef,{payout:payoutVal});

            const dataRef = doc(db, "rentbill", paymentDetails.notes.billId);
                  updateDoc(dataRef, {paid_amt:capAmount,payment_date:paymentDate,payment_method:paymentDetails.method,transaction_id:paymentDetails.id});
            res.send({message:"payment successful",status:"success",billId:paymentDetails.notes.billId});

            // Clear cacheing;
            if(myCache.has(`bill_${billdata.rentholder_id}`))myCache.del(`bill_${billdata.rentholder_id}`);
            if(myCache.has(`bill_${billdata.landlord_id}`))myCache.del(`bill_${billdata.landlord_id}`);
            if(myCache.has(req.params.id))myCache.del(billdata.id);

            //send Mail
            let emailDataRentholder = {
                email:rentholderPaymentState.email,
                subject:"Rent Bill Payment Confirmation.",
                content:`<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Payment Processed</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Dear ${billdata.consumer_Name},</p>
            <p style="font-size: 16px; line-height: 1.5;">We are pleased to inform you that your rent bill payment has been successfully processed. Below are the details:</p>

            <ul style="list-style-type: none; padding: 0;">
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill ID:</strong> ${billdata.id}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill Amount:</strong> ₹${billdata.final_amt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payment Date:</strong> ${paymentDate}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Paid Amount:</strong> ₹${paymentDetails.notes.billAmt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payment Method:</strong> ${paymentDetails.method}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Remaining Amount:</strong> ₹${(+billdata.final_amt) - (+capAmount)}/-</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.5;">You can view and track all your payment details by logging into your account at <a href="https://rnmr.vercel.app" style="color: #4CAF50;">RentⓝMeter.Receipt</a>.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you for your payment.<br><strong>Best regards,</strong><br>Team RentⓝMeter.Receipt</p>
        </div>
    </div>
</div>`
            };

            let emailDataLandlord = {
                email:landlordData.email,
                subject:" Online Rentholder Bill Payment Confirmation.",
                content:`<div style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); border: 1px solid #eaeaea;">
        <div style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Payment Processed</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5;">Dear ${landlordData.name},</p>
            <p style="font-size: 16px; line-height: 1.5;">We are pleased to inform you that ${billdata.consumer_Name} has paid their rent bill online and the payment has been successfully processed. Below are the details:</p>

            <ul style="list-style-type: none; padding: 0;">
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill ID:</strong> ${billdata.id}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Bill Amount:</strong> ₹${billdata.final_amt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payment Date:</strong> ${paymentDate}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Paid Amount:</strong> ₹${paymentDetails.notes.billAmt}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Payment Method:</strong> ${paymentDetails.method}</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Remaining Amount:</strong> ₹${(+billdata.final_amt) - (+capAmount)}/-</li>
                <li style="background-color: #f9f9f9; margin: 10px 0; padding: 10px; border-left: 4px solid #4CAF50; font-size: 16px;"><strong>Total Payout Amount:</strong> ₹${payoutVal}/-</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.5;">You can view and track all your payment details by logging into your account at <a href="https://rnmr.vercel.app" style="color: #4CAF50;">RentⓝMeter.Receipt</a>.</p>
        </div>
        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; border-top: 1px solid #eaeaea; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #666;">Thank you for your payment.<br><strong>Best regards,</strong><br>Team RentⓝMeter.Receipt</p>
        </div>
    </div>
</div>`
            };


            mailer.sendMail(emailDataLandlord);
            mailer.sendMail(emailDataRentholder);
            
          }else{
            res.status(402).send({message:"Payment Processing Failed",status:"failure"});
          }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
}


async function deleteRentBill(req,res){
    let user = jwt.verify(req.cookies.sid,process.env.sess_secret);
    

    if(user.userType === 'Landlord'){
        const docSnap = await getDoc(doc(db, "rentbill", req.params.id));
            const billData = docSnap.data()
            if(billData.paid_amt == 0){
                let currentDate = new Date();
                let cmonth =(currentDate.getMonth()+1).toString().padStart(2,'0');
                let cyear = currentDate.getFullYear().toString();
                 let billingMontAndYear = String(billData.billingDate).split('-');
                
                 if(billingMontAndYear[1]===cmonth && billingMontAndYear[2]===cyear){
                    const landlordDataRef = doc(db, "landlord", user.id);
                    const userSnap = await getDoc(landlordDataRef);
                    user = userSnap.data();
                    landlordBillCount = user.billCount +1;
                    updateDoc(landlordDataRef, {billCount:landlordBillCount});
                 }
                 if(myCache.has(`bill_${billData.rentholder_id}`))myCache.del(`bill_${billData.rentholder_id}`);
                 if(myCache.has(`bill_${billData.landlord_id}`))myCache.del(`bill_${billData.landlord_id}`);
                 if(myCache.has(req.params.id))myCache.del(req.params.id);
                 deleteDoc(doc(db, "rentbill", req.params.id))
                .then(() => res.send({status:'success',message:`Rent Bill deleted successfully.`}))
                .catch((err) => res.send(err))
                
            }else{
                res.status(400).send({status:'failure',message:'can not delete paid bill.'});
            }
    }else if(user.userType === 'Admin'){
        deleteDoc(doc(db, "rentbill", req.params.id))
        .then(() => res.send({status:'success',message:`Rent Bill deleted successfully.`}))
        .catch((err) => res.send(err))
    }
    //check user data;//complte
    //get bill data;
    //check if landlord then chck already paid or not;
    //if not paid then compare current month and year with bill create month year;
    //if matched then increase bill count for landlord and delete bill
    //else only delete bill; 
    
}

module.exports ={
    createRentBill,
    getAllRentBill,
    getLandlordRentBill,
    getRentholderRentBill,
    getSingleRentBill,
    updateRentBillPayment,
    updateCapturedPaymentData,
    deleteRentBill,
}