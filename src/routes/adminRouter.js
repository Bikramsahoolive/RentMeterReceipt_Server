const express = require('express');
const {adminCreate,adminLogin,adminUpdate, resetAdmin,getAllPayoutData,processPayout} = require('../controller/adminControl');
const {validateAdminReset} = require('../middlewares/validateUser');
const{checkSession,checkAdminUser} = require('../middlewares/session')
const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin management routes
 */


adminRouter.route('/')
/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Create Admin
 *     description: create defult admin.
 *     tags: 
 *           - Admin
 *     responses:
 *       200:
 *         description: Admin Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The user name
 *                     example: John Doe
 */
.get(adminCreate)


/**
 * @swagger
 * /admin:
 *   put:
 *     summary: Update Admin
 *     description: update admin data.
 *     tags:
 *           - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Admin Name
 *     responses:
 *       200:
 *         description: Admin Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The user name
 *                     example: John Doe
 */
.put(checkSession,checkAdminUser,adminUpdate);

adminRouter.route('/get/payout')
.get(checkSession,checkAdminUser,getAllPayoutData);

adminRouter.route('/process/payout')
.post(checkSession,checkAdminUser,processPayout);

adminRouter.route('/reset')
.post(validateAdminReset,resetAdmin);


adminRouter.route('/login')
.post(adminLogin);




module.exports = adminRouter;