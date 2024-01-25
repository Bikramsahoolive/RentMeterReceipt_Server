const express = require('express');
const {adminCreate,adminLogin,adminUpdate, resetAdmin} = require('../controller/adminControl');
const {adminReset} = require('../middlewares/adminMiddleware');
const{checkSession} = require('../middlewares/session')
const adminRouter = express.Router();

adminRouter.route('/')
.get(adminCreate)
.put(checkSession,adminUpdate);

adminRouter.route('/reset')
.post(adminReset,resetAdmin);


adminRouter.route('/login')
.post(adminLogin);




module.exports = adminRouter;