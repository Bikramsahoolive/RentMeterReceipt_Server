const express = require('express');
// const app = express();
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,loginLandlord} = require('../controller/landlordControl');
const{checkLandlordCreateData,checkLandlordUpdateData,validateLogin} = require('../middlewares/validateUser');
const{checkSession,checkAdminUser,checkLandlordUser} = require('../middlewares/session');
const landlordRouter = express.Router();



landlordRouter.route('/')
.get(checkSession,checkAdminUser, getAllUsers)

landlordRouter.route('/action/:id')
.post(checkSession,checkAdminUser, checkLandlordCreateData,createUserData);

landlordRouter.route('/user/:id')
.get(checkSession, getSingleUser)
.put(checkSession,checkLandlordUser,checkLandlordUpdateData,updateUserData)
.delete(checkSession,checkLandlordUser,deleteUserData);

landlordRouter.route('/login')
.post(validateLogin,loginLandlord);



module.exports =landlordRouter;