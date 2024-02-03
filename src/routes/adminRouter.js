const express = require('express');
const {adminCreate,adminLogin,adminUpdate, resetAdmin} = require('../controller/adminControl');
const {validateAdminReset} = require('../middlewares/validateUser');
const{checkSession,checkAdminUser} = require('../middlewares/session')
const adminRouter = express.Router();

adminRouter.route('/')
.get(adminCreate)
.put(checkSession,checkAdminUser,adminUpdate);

adminRouter.route('/reset')
.post(validateAdminReset,resetAdmin);


adminRouter.route('/login')
.post(adminLogin);




module.exports = adminRouter;