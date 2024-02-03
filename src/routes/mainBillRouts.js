const express = require('express');
const {createMainMeterBill,getAllMainBill,getLandlordMainBill,getSingleMainBill,updateMainBill,deleteMainBill} = require('../controller/mainBillControl');
const{checkSession,checkAdminUser,checkLandlordUser} = require('../middlewares/session');
const{mainBillCreateValidation}=require('../middlewares/validateBillData');
const mainBillRouter = express.Router();

mainBillRouter.route('/')
.post(checkSession,checkLandlordUser,mainBillCreateValidation,createMainMeterBill)
.get(checkSession,checkAdminUser,getAllMainBill);

mainBillRouter.route('/landlord')
.get(checkSession,checkLandlordUser,getLandlordMainBill);


mainBillRouter.route('/bill/:id')
.get(checkSession,checkLandlordUser,getSingleMainBill)
.put(checkSession,checkLandlordUser,updateMainBill)
.delete(checkSession,checkLandlordUser,deleteMainBill);



module.exports = mainBillRouter;