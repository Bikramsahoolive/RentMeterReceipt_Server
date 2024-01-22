const express = require('express');
//dev module
const morgan = require('morgan');
const cors = require('cors');

const session = require('express-session');//jwt
const cookieParser = require('cookie-parser');
const landlordRouter = require('./routes/landlordRouts');
const rentHolderRouter = require('./routes/rentHolderRouts');
const{checkRouter, landlordLogout} = require('./controller/authControl');

require('dotenv').config();

const PORT = process.env.PORT;

const app = express();
app.use(cors({
  origin:'http://localhost:4200',
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

app.use('/landlord',landlordRouter);
app.use('/rent-holder',rentHolderRouter);

app.post('/check-rout',checkRouter);
app.post('/logout',landlordLogout);







app.listen(PORT,()=>console.log(`Running on http://localhost:${PORT}`));