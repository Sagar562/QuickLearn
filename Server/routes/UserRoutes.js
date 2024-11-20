const express = require('express');
const router = express.Router();

//import user controllers and middleware

//user controllers
const {
    signUp,
    logIn,
    changePassword,
    sendOTP
} = require('../controllers/Auth');

const {
    resetPassword,
    resetPasswordToken
} = require('../controllers/ResetPassword');

const { auth } = require('../middlewares/auth');


//AUTHENTICATION ROUTES


router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/sendotp', sendOTP);
router.post('/changepassword', changePassword);


//RESET PASSWORD ROUTES


router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetPassword);


module.exports = router;