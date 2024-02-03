require('dotenv').config();
const express = require('express');
const {createServer} = require('http');

//dev module

const morgan = require('morgan');
const cors = require('cors');


const session = require('express-session');// (stateful) or jwt auth (stateless).
const cookieParser = require('cookie-parser');

const SignupLandlordRouter = require('./src/routes/signUpLandlordRouts');
const adminRouter = require('./src/routes/adminRouter');
const landlordRouter = require('./src/routes/landlordRouts');
const rentHolderRouter = require('./src/routes/rentHolderRouts');
const mainBillRouter = require('./src/routes/mainBillRouts');
const rentBillRouter = require('./src/routes/rentBillRouts')
const{checkRouter, landlordLogout} = require('./src/controller/authControl');
const{checkSession}= require('./src/middlewares/session')

const apiKeyValidation = require('./src/middlewares/validateApi');



const app = express();

const Server = createServer(app);
const PORT = process.env.PORT || 3000;



//Handle Prevalidate middlewares

app.use(apiKeyValidation);

app.use(cors({
  origin:'*',
  credentials: true
}));

app.use(cookieParser());

app.use(session({
    secret:process.env.sess_secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
      secure:false,
      httpOnly:true
    }
  }));

app.use(morgan('dev'));

app.use(express.json()); 
                   
app.use(express.urlencoded({extended:true}));

//Handle Routes 
app.get('/',(req,res)=>res.send("Welcome to Rentⓝmeter.Receipt!"));
app.use('/signup',SignupLandlordRouter);
app.use('/admin',adminRouter);
app.use('/landlord',landlordRouter);
app.use('/rent-holder',rentHolderRouter);

app.use('/main-bill',mainBillRouter);
app.use('/rent-bill',rentBillRouter);

app.post('/check-session',checkRouter);
app.post('/logout',checkSession,landlordLogout);

// Handle Wild Card Routs.
app.use((req,res,next)=>{
  res.status('404').send('Rentⓝmeter.Receipt can not find this Route, Error code 404!');
})





Server.listen(PORT,()=>console.log(`Running on http://localhost:${PORT}`));