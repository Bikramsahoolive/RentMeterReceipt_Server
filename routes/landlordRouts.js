const express = require('express');
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,loginLandlord,landlordCheckLogin,landlordLogout} = require('../controller/landlordControl');
const{checkLandlordCreateData,chckSession} = require('../middlewares/landlordMiddleware');
const router = express.Router();


router.route('/')
.get(getAllUsers)
.post(checkLandlordCreateData , createUserData);

router.route('/:id')
.get(getSingleUser)
.put(updateUserData)
.delete(deleteUserData);

router.route('/login')
.post(loginLandlord);

router.route('/isActive')
.post(chckSession,landlordCheckLogin);

router.route('/logout')
.post(chckSession,landlordLogout)


module.exports =router;