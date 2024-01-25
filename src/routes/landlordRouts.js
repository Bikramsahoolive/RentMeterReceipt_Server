const express = require('express');
// const app = express();
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,loginLandlord} = require('../controller/landlordControl');
const{checkLandlordCreateData} = require('../middlewares/landlordMiddleware');
const{checkSession} = require('../middlewares/session');
const landlordRouter = express.Router();



landlordRouter.route('/')
.get(checkSession, getAllUsers)

landlordRouter.route('/action/:id')
.post(checkSession, checkLandlordCreateData,createUserData);

landlordRouter.route('/user/:id')
.get(checkSession, getSingleUser)
.put(checkSession, updateUserData)
.delete(checkSession, deleteUserData);

landlordRouter.route('/login')
.post(loginLandlord);



module.exports =landlordRouter;