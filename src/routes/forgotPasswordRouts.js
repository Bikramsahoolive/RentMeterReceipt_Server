const express = require('express');
const router = express.Router();
const{forgotPasswordRequest,resendOtp,forgotPasswordVerify}=require('../controller/forgotPasswordControl.js');



router.route('/')
.post(forgotPasswordRequest);

router.route('/verify')
.post(forgotPasswordVerify);

router.route('/resend')
.post(resendOtp);

module.exports=router;