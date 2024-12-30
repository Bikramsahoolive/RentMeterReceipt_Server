const express = require('express');
const {createUserData,getAllUsers, getRentholdersOfLandlord,getSingleUser,updateUserData,deleteUserData,
    loginRentHolder,registerChallenge,verifyChallenge,authOptions,loginWithPasskey,unregdPasskey,getPaymentDataForRentholder} = require('../controller/rentHolderControl');
const{checkSession,checkAdminUser,checkLandlordUser,checkRentHolderUser} = require('../middlewares/session');
const {checkRentHolderCreateData,checkRentHolderUpdateData} = require('../middlewares/validateUser')
const rentHolderRouter = express.Router();


rentHolderRouter.route('/')
.get(checkSession,checkAdminUser,getAllUsers)
.post(checkSession,checkLandlordUser,checkRentHolderCreateData,createUserData);

rentHolderRouter.route('/user/:id')
.get(checkSession,checkRentHolderUser,getSingleUser)
.put(checkSession,checkRentHolderUser,updateUserData)
.delete(checkSession,checkLandlordUser,deleteUserData);

rentHolderRouter.route('/login')
.post(loginRentHolder);//

rentHolderRouter.route('/landlord')
.get(checkSession,checkLandlordUser,getRentholdersOfLandlord);

rentHolderRouter.route('/reg-challenge')
.get(checkSession,checkRentHolderUser,registerChallenge);

rentHolderRouter.route('/verify-challenge')
.post(checkSession,checkRentHolderUser,verifyChallenge);

rentHolderRouter.route('/auth-options/:id')
.get(authOptions);

rentHolderRouter.route('/login-passkey')
.post(loginWithPasskey);

rentHolderRouter.route('/unregd-passkey/:id')
.delete(checkSession,checkRentHolderUser,unregdPasskey);

rentHolderRouter.route('/rentBill/paymentData')
.get(checkSession,checkRentHolderUser,getPaymentDataForRentholder);

module.exports =rentHolderRouter;