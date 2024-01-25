const express = require('express');
const {createUserData,getAllUsers, getRentholderOfLandlord,getSingleUser,updateUserData,deleteUserData,loginRentHolder} = require('../controller/rentHolderControl');
const{checkSession} = require('../middlewares/session');
const {checkRentHolderCreateData} = require('../middlewares/rentHolderMiddleware')
const rentHolderRouter = express.Router();


rentHolderRouter.route('/')
.get(checkSession,getAllUsers)
.post(checkSession,checkRentHolderCreateData,createUserData);

rentHolderRouter.route('/user/:id')
.get(checkSession,getSingleUser)
.put(checkSession,updateUserData)
.delete(checkSession,deleteUserData);

rentHolderRouter.route('/login')
.post(loginRentHolder);

rentHolderRouter.route('/landlord')
.get(checkSession,getRentholderOfLandlord);


module.exports =rentHolderRouter;