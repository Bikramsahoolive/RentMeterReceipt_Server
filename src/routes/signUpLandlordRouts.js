const express = require('express');
const{signupLandlord,signupStatus,getSignupDataOfLandlord}= require('../controller/signupLandlordControl');
const{checkLandlordCreateData} = require('../middlewares/validateUser');
const{checkSession,checkAdminUser} = require('../middlewares/session');
const SignupLandlordRouter = express.Router();

SignupLandlordRouter.route('/')
.post(checkLandlordCreateData,signupLandlord)
.get(checkSession,checkAdminUser,getSignupDataOfLandlord);

SignupLandlordRouter.route('/status/:id')
.get(signupStatus)


module.exports=SignupLandlordRouter;