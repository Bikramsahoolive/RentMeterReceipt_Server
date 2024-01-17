const express = require('express');
const {createUserData,getAllUsers,getSingleUser,updateUserData,deleteUserData,loginLandlord} = require('../controller/landlordControl');
const{checkLandlordCreateData} = require('../middlewares/userMiddleware');
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





module.exports =router;