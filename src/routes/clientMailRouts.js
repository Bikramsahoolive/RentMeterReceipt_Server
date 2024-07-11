const express = require('express');
const router = express.Router();
const{sendSubscribeMail,sendFeedbackMail,sendUnsubscribeResponse}=require('../controller/clientMailControl.js');



router.route('/subscribe')
.post(sendSubscribeMail);

router.route('/unsubscribe')
.post(sendUnsubscribeResponse);

router.route('/feedback')
.post(sendFeedbackMail);


module.exports=router;