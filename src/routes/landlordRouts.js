const express = require('express');
// const app = express();
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,
    loginLandlord,landlordPayout,checkAlreadyQueuedPayoutRequest,getProcessedPayoutOfLandlord,registerChallenge,verifyChallenge,authOptions,loginWithPasskey,unregdPasskey,getPaymentDataForLandlord,
yearlyChartData,totalChartData} = require('../controller/landlordControl');
const{checkLandlordCreateData,checkLandlordUpdateData,validateLogin} = require('../middlewares/validateUser');
const{checkSession,checkAdminUser,checkLandlordUser,checkRentHolderUser} = require('../middlewares/session');
const landlordRouter = express.Router();



landlordRouter.route('/')
.get(checkSession,checkAdminUser, getAllUsers)

landlordRouter.route('/action')
.post(checkLandlordCreateData,createUserData);

landlordRouter.route('/user/:id')
.get(checkSession,checkRentHolderUser, getSingleUser)
.put(checkSession,checkLandlordUser,checkLandlordUpdateData,updateUserData)
.delete(checkSession,checkLandlordUser,deleteUserData);

landlordRouter.route('/login')
.post(validateLogin,loginLandlord);

landlordRouter.route('/payout')
.post(checkSession,checkLandlordUser,landlordPayout);

landlordRouter.route('/payout')
.get(checkSession,checkLandlordUser,getProcessedPayoutOfLandlord);

landlordRouter.route('/reg-challenge')
.get(checkSession,checkLandlordUser,registerChallenge);

landlordRouter.route('/verify-challenge')
.post(checkSession,checkLandlordUser,verifyChallenge);

landlordRouter.route('/auth-options/:id')
.get(authOptions);

landlordRouter.route('/login-passkey')
.post(loginWithPasskey);

landlordRouter.route('/unregd-passkey/:id')
.delete(checkSession,checkLandlordUser,unregdPasskey);

landlordRouter.route('/check-payout/:id')
.get(checkSession,checkLandlordUser,checkAlreadyQueuedPayoutRequest);

landlordRouter.route('/rentBill/paymentData')
.get(checkSession,checkLandlordUser,getPaymentDataForLandlord);

landlordRouter.route('/yearlyChartData/:year')
.get(checkSession,checkLandlordUser,yearlyChartData);

landlordRouter.route('/totalChartData')
.get(checkSession,checkLandlordUser,totalChartData);


module.exports =landlordRouter;