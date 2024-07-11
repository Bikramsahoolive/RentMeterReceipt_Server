const express = require('express');
const router = express.Router();
const{sendSubscribeMail,sendFeedbackMail}=require('../controller/clientMailControl.js');



router.route('/subscribe')
.post(sendSubscribeMail);

router.route('/feedback')
.post(sendFeedbackMail);


module.exports=router;