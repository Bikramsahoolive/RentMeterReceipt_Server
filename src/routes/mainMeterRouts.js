const express = require('express');
const {createMainMeterBill,getAllMainBill,getLandlordMainBill,getSingleMainBill,deleteMainBill} = require('../controller/mainMeterControl');
const{checkSession} = require('../middlewares/session')
const mainMeterRouter = express.Router();

mainMeterRouter.route('/')
.post(checkSession,createMainMeterBill)
.get(checkSession,getAllMainBill);

mainMeterRouter.route('/landlord')
.get(checkSession,getLandlordMainBill);


mainMeterRouter.route('/bill/:id')
.get(checkSession,getSingleMainBill)
// .put()
.delete(checkSession,deleteMainBill);



module.exports = mainMeterRouter;