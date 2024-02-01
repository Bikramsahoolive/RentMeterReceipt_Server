const express = require('express');
const {createMainMeterBill,getAllMainBill,getLandlordMainBill,getSingleMainBill,deleteMainBill} = require('../controller/mainMeterControl');
const{checkSession,checkAdminUser,checkLandlordUser} = require('../middlewares/session')
const mainMeterRouter = express.Router();

mainMeterRouter.route('/')
.post(checkSession,checkLandlordUser,createMainMeterBill)
.get(checkSession,checkAdminUser,getAllMainBill);

mainMeterRouter.route('/landlord')
.get(checkSession,checkLandlordUser,getLandlordMainBill);


mainMeterRouter.route('/bill/:id')
.get(checkSession,checkLandlordUser,getSingleMainBill)
// .put()
.delete(checkSession,checkLandlordUser,deleteMainBill);



module.exports = mainMeterRouter;