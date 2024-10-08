const express = require('express');
const rentBillRouter = express.Router();
const{createRentBill,getAllRentBill,getLandlordRentBill,getRentholderRentBill,getSingleRentBill,updateRentBillPayment,deleteRentBill,createPaymentOrder,updateCapturedPaymentData}=require('../controller/rentBillControl');
const{rentBillCreateValidation,rentBillUpdateValidation,}=require('../middlewares/validateBillData');
const {checkSession,checkAdminUser,checkLandlordUser,checkRentHolderUser} =require('../middlewares/session')


rentBillRouter.route('/')
.post(checkSession,checkLandlordUser,rentBillCreateValidation,createRentBill)
.get(checkSession,checkAdminUser,getAllRentBill)

rentBillRouter.route('/landlord')
.get(checkSession,checkLandlordUser,getLandlordRentBill);

rentBillRouter.route('/rentholder')
.get(checkSession,checkRentHolderUser,getRentholderRentBill);

rentBillRouter.route('/bill/:id')
.get(checkSession,checkRentHolderUser,getSingleRentBill)
.put(checkSession,checkLandlordUser,updateRentBillPayment)
// .post(checkSession,checkLandlordUser,rentBillUpdateValidation,addFineRentBill)
.delete(checkSession,checkLandlordUser,deleteRentBill);

rentBillRouter.route('/create-order')
.post(checkSession,checkRentHolderUser,createPaymentOrder);

rentBillRouter.route('/verify-payment')
.post(checkSession,checkRentHolderUser,updateCapturedPaymentData);

module.exports=rentBillRouter;