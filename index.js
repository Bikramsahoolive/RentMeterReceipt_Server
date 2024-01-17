const express = require('express');
const {requestLog} = require('./middlewares/userMiddleware');
const session = require('express-session');//jwt
const landlordRouter = require('./routes/landlordRouts')

require('dotenv').config();

const PORT = process.env.PORT;

const app = express();

app.use(requestLog());

app.use(express.json()); 
                   
app.use(express.urlencoded({extended:true}));

app.use('/landlord',landlordRouter);





app.listen(PORT,()=>console.log(`Running on http://localhost:${PORT}`));