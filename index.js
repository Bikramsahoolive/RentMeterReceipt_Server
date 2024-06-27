require('dotenv').config();
const express = require('express');
// const {createServer} = require('http');
//dev module

// const morgan = require('morgan');
const cors = require('cors');


// const session = require('express-session');//session auth (stateful).
// const jwt = require('jsonwebtoken'); //jwt auth (stateless).
const cookieParser = require('cookie-parser');

const SignupLandlordRouter = require('./src/routes/signUpLandlordRouts');
const adminRouter = require('./src/routes/adminRouter');
const landlordRouter = require('./src/routes/landlordRouts');
const rentHolderRouter = require('./src/routes/rentHolderRouts');
const mainBillRouter = require('./src/routes/mainBillRouts');
const rentBillRouter = require('./src/routes/rentBillRouts')
const forgotPasswordRouter = require('./src/routes/forgotPasswordRouts');
const{checkRouter, landlordLogout} = require('./src/controller/authControl');
const{checkSession}= require('./src/middlewares/session')
const sendMail = require('./src/controller/mailSender');
const apiKeyValidation = require('./src/middlewares/validateApi');



const app = express();

// const Server = createServer(app);
const PORT = process.env.PORT || 3000;



//Handle Prevalidate middlewares
app.use(cors({
  origin:'https://rnmr.vercel.app',
  credentials: true
}));
// app.use(apiKeyValidation);
app.get('/',(req,res)=>res.send("Welcome to Rentⓝmeter.Receipt Server!"));




app.use(cookieParser());

// app.use(session({
//     secret:process.env.sess_secret,
//     resave:false,
//     saveUninitialized:true,
//     cookie:{
//       sameSite:"None",
//       secure:true
      
//     }
//   }));

// app.use(morgan('dev'));

app.use(express.json({limit:'10mb'})); 
                   
app.use(express.urlencoded({extended:true}));

//Handle Routes 

app.use('/signup',SignupLandlordRouter);
app.use('/forgot-password',forgotPasswordRouter);
app.use('/admin',adminRouter);
app.use('/landlord',landlordRouter);
app.use('/rent-holder',rentHolderRouter);

app.use('/main-bill',mainBillRouter);
app.use('/rent-bill',rentBillRouter);

app.post('/check-session',checkRouter);
app.post('/logout',checkSession,landlordLogout);
app.post('/email-subscribe',(req,res)=>{
    let emailData={};
    emailData.email = String(req.body.email);
    emailData.subject = 'Info-RentⓝMeter.Receipt.';
    emailData.content = `This is a thank you mail for your subscription,Your email Subscribed successfully. Thank You -RNMR Team.`;
      sendMail(res,emailData);
})

// Handle Wild Card Routs.
app.use((req,res,next)=>{
  res.status(404).send('Rentⓝmeter.Receipt can not find this Route, Error code 404!');
})





app.listen(PORT,()=>console.log(`Running on http://localhost:${PORT}`));