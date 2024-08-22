require('dotenv').config();
const mailer = require('./mailSender');
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
                         emailData.content = ` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
                         <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; text-align: center;">Welcome to RentⓝMeter.Receipt!</h2>
        <p>Dear User,</p>
        <p>We're thrilled to have you on board. <strong>RentⓝMeter.Receipt</strong>, founded in 2024, is dedicated to revolutionizing the rental management process for both landlords and tenants. Here's a glimpse of what we offer:</p>
        <ul style="margin: 20px 0; padding-left: 20px;">
            <li><strong>Streamlined Profiles and Tenant Registration:</strong> Landlords can effortlessly create profiles and register tenants.</li>
            <li><strong>Efficient Bill Generation:</strong> Generate and send monthly bills with just a few clicks.</li>
            <li><strong>Seamless Payment Collection:</strong> Collect payments online or via dynamic UPI QR codes, ensuring a hassle-free experience.</li>
            <li><strong>Innovative Technology:</strong> Our platform leverages cutting-edge technology to enhance your rental management experience.</li>
            <li><strong>Future Expansion:</strong> Soon, landlords will be able to list rental properties and connect directly with prospective tenants through our web application.</li>
        </ul>
        <p>With our headquarters in Bhubaneswar and a branch in Chandbali, Odisha, we are committed to providing top-notch services to make rental management simpler and more efficient.</p>
        <p>Thank you for subscribing to <strong>RentⓝMeter.Receipt</strong>. We're excited to support you on this journey and provide you with regular updates on our services. If you have any questions or need assistance, please don't hesitate to reach out.</p>
        <p style="text-align: center; margin-top: 40px;">Best regards,<br><strong>The RentⓝMeter.Receipt Team</strong></p>
        <div style="margin-top: 40px; text-align: center;">
            <p><strong>Contact Details:</strong></p>
            <p>Website: <a href="https://rnmr.vercel.app" style="color: #4CAF50; text-decoration: none;">https://rnmr.vercel.app</a></p>
            <p>Phone: +91 7978385966</p>
            <p>Email: <a href="mailto:rnm.receipt@gmail.com" style="color: #4CAF50; text-decoration: none;">rnm.receipt@gmail.com</a></p>
        </div>
        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #777;">To unsubscribe, click on the link: <a href="https://rnmr.vercel.app/unsubscribe/${String(btoa(req.body.email))}" style="color: #4CAF50; text-decoration: none;">Unsubscribe</a></p>
    </div>
    </div>`;
                           mailer.sendMail(emailData,(resp)=>{
                            if(resp.status==='success')res.send({status:'success',message:'User Subscribed.'});
                            });

    } catch (error) {
        console.error(error);
        res.send({status:'failure',message:"error while processing data."});
    }
}

async function sendUnsubscribeResponse(req,res){
    let email = req.body.email;

    let status =await checkSubscribtion(email);
    if(!status){
        res.send({status:'failure',message:"Email id not exists or unsubscribed."});
        return;
    }else if(status ==='error'){
        res.status(500).send({status:'error',message:"Error while fetching data. try again"});
        return;
    }

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
    emailData.content = ` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4CAF50; text-align: center;">New Feedback Received</h2>
        <p>Dear Admin,</p>
        <p>You have received new feedback from one of our users. Below are the details:</p>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td>
            </tr>
        </table>
        <p style="margin-top: 20px;"><strong>Message:</strong></p>
        <p style="padding: 10px; background-color: #f9f9f9; border-left: 4px solid #4CAF50; margin-bottom: 20px;">${data.message}</p>
        <p>We recommend reviewing this feedback promptly to ensure the best experience for our users. If any follow-up is needed, please do not hesitate to reach out to the user directly.</p>
        <p style="text-align: center; margin-top: 40px;">Best regards,<br><strong>The RentⓝMeter.Receipt Team</strong></p>
    </div> 
    </div> `;
      mailer.sendMail(emailData,(resp)=>{
        if(resp.status==='success')res.send({status:'success',message:'feedback submitted'});
      });
}

async function checkUnsubscribed(req,res){

    let status =await checkSubscribtion(req.body.email);
    if(status){
        res.send({status:true,message:"Email id exists"});
    }else if(status ==='error'){
        res.status(500).send({status:'error',message:"Error while fetching data."});
    }else{
        res.send({status:false,message:"Email id not exists or unsubscribed."});
    }
}

async function checkSubscribtion(id){
    
    try {
        const docSnap = await getDoc(doc(db, "subcribed_mail",id));

        if (docSnap.exists()) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.log(error);
        return 'error';
    }
   
}

module.exports ={
    sendSubscribeMail,
    sendFeedbackMail,
    sendUnsubscribeResponse,
    checkUnsubscribed
}