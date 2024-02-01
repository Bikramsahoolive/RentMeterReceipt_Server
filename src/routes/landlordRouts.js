const express = require('express');
// const app = express();
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,loginLandlord} = require('../controller/landlordControl');
const{checkLandlordCreateData} = require('../middlewares/landlordMiddleware');
const{checkSession,checkAdminUser,checkLandlordUser} = require('../middlewares/session');
const landlordRouter = express.Router();



landlordRouter.route('/')
.get(checkSession,checkAdminUser, getAllUsers)

landlordRouter.route('/action/:id')
.post(checkSession,checkAdminUser, checkLandlordCreateData,createUserData);

landlordRouter.route('/user/:id')
.get(checkSession,checkLandlordUser, getSingleUser)
.put(checkSession,checkLandlordUser,updateUserData)
.delete(checkSession,checkAdminUser,deleteUserData);

landlordRouter.route('/login')
.post(loginLandlord);



module.exports =landlordRouter;