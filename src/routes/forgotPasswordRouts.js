const express = require('express');
const router = express.Router();
const{forgotPasswordRequest,resendOtp,forgotPasswordVerify}=require('../controller/forgotPasswordControl.js');
const validateCaptcha = require('../middlewares/recaptcha');


router.route('/')
.post(validateCaptcha,forgotPasswordRequest);

router.route('/verify')
.post(forgotPasswordVerify);

router.route('/resend')
.post(resendOtp);

module.exports=router;