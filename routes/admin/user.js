const express = require('express');
const router = express.Router();
const userController = require('./../../controllers/userController');
const authController = require('./../../controllers/authController');

// Protect all routes after this middleware
 router.use(authController.protect);



// Only admin have permission to access for the below APIs
router.use(authController.restrictTo('admin'));
router.post('/partyas', userController.getAllPartyA);

router.post('/partybs', userController.getAllPartyB);
router.post('/party-a/get-accs', userController.getPartyAAccs);
 router.use(authController.restrictTo('admin'));


module.exports = router;