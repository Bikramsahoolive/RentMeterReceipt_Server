const express = require('express');
const {createUserData,getAllUsers, getRentholdersOfLandlord,getSingleUser,updateUserData,deleteUserData,loginRentHolder} = require('../controller/rentHolderControl');
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


module.exports =rentHolderRouter;