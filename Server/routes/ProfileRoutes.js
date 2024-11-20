const express = require('express');
const router = express.Router();

const {
    updateProfile,
    deleteAccount,
    updateDisplayPicture,
    getAllUserDetails
} = require('../controllers/Profile');

const { auth } = require('../middlewares/auth');

router.put('/updateProfile', auth, updateProfile);
router.delete('/deleteProfile', auth, deleteAccount);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);
router.get('/getUserDetails', auth, getAllUserDetails);

module.exports = router;