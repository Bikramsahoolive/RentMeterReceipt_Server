const express = require('express');
const{signupLandlord,signupStatus}= require('../controller/signupLandlordControl');
const{checkLandlordCreateData} = require('../middlewares/landlordMiddleware')
const SignupLandlordRouter = express.Router();

SignupLandlordRouter.route('/')
.post(checkLandlordCreateData,signupLandlord)

SignupLandlordRouter.route('/status/:id')
.get(signupStatus)


module.exports=SignupLandlordRouter;