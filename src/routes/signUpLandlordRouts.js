const express = require('express');
const{signupVerify}= require('../controller/signupLandlordControl');
const{checkLandlordCreateData} = require('../middlewares/validateUser');
const{checkSession,checkAdminUser} = require('../middlewares/session');
const SignupLandlordRouter = express.Router();

// SignupLandlordRouter.route('/')

SignupLandlordRouter.route('/verify')
.post(signupVerify);


module.exports=SignupLandlordRouter;