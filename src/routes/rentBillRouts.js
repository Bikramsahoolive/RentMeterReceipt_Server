const express = require('express');
const rentBillRouter = express.Router();
const{createRentBill}=require('../controller/rentBillControl');
const{rentBillValidation}=require('../middlewares/validateCalc');
const {checkSession} =require('../middlewares/session')


rentBillRouter.route('/')
.post(checkSession,rentBillValidation,createRentBill);


module.exports=rentBillRouter;