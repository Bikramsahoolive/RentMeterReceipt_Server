const express = require('express');
const rentBillRouter = express.Router();
const{createRentBill,getAllRentBill,getLandlordRentBill,getSingleRentBill,updateRentBill,deleteRentBill}=require('../controller/rentBillControl');
const{rentBillValidation}=require('../middlewares/validateCalc');
const {checkSession,checkAdminUser,checkLandlordUser} =require('../middlewares/session')


rentBillRouter.route('/')
.post(checkSession,checkLandlordUser,rentBillValidation,createRentBill)
.get(checkSession,checkAdminUser,getAllRentBill)

rentBillRouter.route('/landlord')
.get(checkSession,checkLandlordUser,getLandlordRentBill);

rentBillRouter.route('/bill/:id')
.get(checkSession,checkLandlordUser,getSingleRentBill)
.put(checkSession,checkLandlordUser,updateRentBill)
.delete(checkSession,checkLandlordUser,deleteRentBill);

module.exports=rentBillRouter;