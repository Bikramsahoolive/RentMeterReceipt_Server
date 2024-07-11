require('dotenv').config();
const sendMail = require('./mailSender');

function sendSubscribeMail(req,res){
    let emailData={};
    emailData.email = String(req.body.email);
    emailData.subject = 'Welcome to RentⓝMeter.Receipt – Simplify Your Rental Management Today!';
    emailData.content = `Dear User,

Welcome to RentⓝMeter.Receipt! We're thrilled to have you on board.

RentⓝMeter.Receipt Founded in 2024, is dedicated to revolutionizing the rental management process for both landlords and tenants. Here's a glimpse of what we offer:

Streamlined Profiles and Tenant Registration: Landlords can effortlessly create profiles and register tenants.

Efficient Bill Generation: Generate and send monthly bills with just a few clicks.

Seamless Payment Collection: Collect payments online or via dynamic UPI QR codes, ensuring a hassle-free experience.

Innovative Technology: Our platform leverages cutting-edge technology to enhance your rental management experience.

Future Expansion: Soon, landlords will be able to list rental properties and connect directly with prospective tenants through our web application.

With our headquarters in Bhubaneswar and a branch in Chandbali, Odisha, we are committed to providing top-notch services to make rental management simpler and more efficient.

Thank you for subscribing RentⓝMeter.Receipt. We're excited to support you on this journey and give you regular updates on our services. 
If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,

The RentⓝMeter.Receipt Team

Contact Details.

https://rnmr.vercel.app

Phone: +917978385966
email: rnm.receipt@gmail.com

to unsubscribe click on the link : https://rnmr.vercel.app/unsubscribe/${String(req.body.email)}`;
      sendMail(res,emailData);
}


function sendFeedbackMail(req,res){
    let data = req.body;
    let emailData={};
    emailData.email = process.env.admin_email;
    emailData.subject = `New feedback from ${data.name}`;
    emailData.content = `Dear Admin,

You have a new feedback received from-

Name: ${data.name}
Email: ${data.email} ,

message:

${data.message}


The RentⓝMeter.Receipt Team
}`;
      sendMail(res,emailData);

}

module.exports ={
    sendSubscribeMail,
    sendFeedbackMail
}