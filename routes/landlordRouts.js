const express = require('express');
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,loginLandlord,landlordSessionCheck,landlordLogout} = require('../controller/landlordControl');
const{checkLandlordCreateData,chckSession} = require('../middlewares/landlordMiddleware');
const landlordRouter = express.Router();


landlordRouter.route('/')
.get(getAllUsers)
.post(checkLandlordCreateData , createUserData);

landlordRouter.route('/user/:id')
.get(getSingleUser)
.put(updateUserData)
.delete(deleteUserData);

landlordRouter.route('/login')
.post(loginLandlord);

landlordRouter.route('/isActive')
.post(chckSession,landlordSessionCheck);

landlordRouter.route('/logout')
.post(chckSession,landlordLogout)


module.exports =landlordRouter;