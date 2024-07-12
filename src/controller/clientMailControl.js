require('dotenv').config();
const sendMail = require('./mailSender');
const firebase = require('../model/firebase');
const { getFirestore, doc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, where, query } = require('firebase/firestore');
const db = getFirestore();

async function sendSubscribeMail(req,res){
    try {
        const q = query(collection(db, "subcribed_mail"), where("email", "==",req.body.email));
        const querySnapshot = await getDocs(q);

        let emails=[]
        querySnapshot.forEach((doc) => {
            let d = doc.data()
            emails.push(d.email);
        });
        if(emails.length>0){
            res.send({status:'failure',message:"Already Subscribed."});
            return;
        }
        let dataRef = doc(db, "subcribed_mail",req.body.email);
                         setDoc(dataRef, {email:req.body.email});

                         let emailData={};
                         emailData.email = String(req.body.email);
                         emailData.subject = 'Welcome to RentⓝMeter.Receipt – Simplify Your Rental Management Today!';
                         emailData.content = `Dear User,

Welcome to RentⓝMeter.Receipt! We're thrilled to have you on board. RentⓝMeter.Receipt, founded in 2024, is dedicated to revolutionizing the rental management process for both landlords and tenants. Here's a glimpse of what we offer:

Streamlined Profiles and Tenant Registration: Landlords can effortlessly create profiles and register tenants.
Efficient Bill Generation: Generate and send monthly bills with just a few clicks.
Seamless Payment Collection: Collect payments online or via dynamic UPI QR codes, ensuring a hassle-free experience.
Innovative Technology: Our platform leverages cutting-edge technology to enhance your rental management experience.
Future Expansion: Soon, landlords will be able to list rental properties and connect directly with prospective tenants through our web application.
With our headquarters in Bhubaneswar and a branch in Chandbali, Odisha, we are committed to providing top-notch services to make rental management simpler and more efficient.

Thank you for subscribing to RentⓝMeter.Receipt. We're excited to support you on this journey and give you regular updates on our services. If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,

The RentⓝMeter.Receipt Team
                     
Contact Details.
                     
https://rnmr.vercel.app
                     
Phone: +917978385966
email: rnm.receipt@gmail.com
                     
to unsubscribe click on the link : https://rnmr.vercel.app/unsubscribe/${String(btoa(req.body.email))}`;
                           sendMail(res,emailData);

    } catch (error) {
        console.error(error);
        res.send({status:'failure',message:"error while processing data."});
    }
}

function sendUnsubscribeResponse(req,res){
    let email = req.body.email;
    try {
        deleteDoc(doc(db, "subcribed_mail", email));
        res.send({status:'success',message:'Unsubscribed Successfully'});
    } catch (error) {
        console.log(error);
        res.status(400).send({status:'failure',message:'error while unsubscribe'});
    }
}

function sendFeedbackMail(req,res){
    let data = req.body;
    let emailData={};
    emailData.email = process.env.admin_email;
    emailData.subject = `New feedback from ${data.name}`;
    emailData.content = `Dear Admin,

You have a new feedback received from-

Name: ${data.name}
Email: ${data.email}

And 

message:

${data.message}


The RentⓝMeter.Receipt Team`;
      sendMail(res,emailData);
}

module.exports ={
    sendSubscribeMail,
    sendFeedbackMail,
    sendUnsubscribeResponse
}