const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');


router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/change-password', authController.changePass);
router.post('/signup/party-a', userController.partyASignUp);
router.post('/signup/party-b', userController.partyBSignUp);

// Protect all routes after this middleware
 router.use(authController.protect);

router.delete('/deleteMe', userController.deleteMe);

// Only admin have permission to access for the below APIs
router.use(authController.restrictTo('partyAAdmin'));
router.post('/create-pa-account', userController.createNewPAAccount);



 router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers);


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;