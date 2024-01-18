const express = require('express');
const morgan = require('morgan');
const session = require('express-session');//jwt
const landlordRouter = require('./routes/landlordRouts')

require('dotenv').config();

const PORT = process.env.PORT;

const app = express();

app.use(session({
    secret:process.env.sess_secret,
    resave:false,
    saveUninitialized:true
  }));

app.use(morgan('dev'));

app.use(express.json()); 
                   
app.use(express.urlencoded({extended:true}));

app.use('/landlord',landlordRouter);





app.listen(PORT,()=>console.log(`Running on http://localhost:${PORT}`));