const Profile = require('../models/Profile')
const User = require('../models/User')
const { uploadImageToCloudinary } = require('../utils/imageUploader')
require('dotenv').config();

exports.updateProfile = async (req, res) => {
    try {
        //get data
        const {dateOfBirth = "", about = "", contactNumber, gender} = req.body;

        //get usrId
        const id = req.user.id;
        
        //validation
        // if (!gender || !contactNumber || !id) 
        // {
        //     return res.status(400).json({
        //         success : false,
        //         message : 'All Fields are required'
        //     })
        // }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();
        
        //return response
        return res.status(200).json({
            success : true,
            message : 'Profile Updated Successfully',
            profileDetails,
        })
    }catch(error) {
        return res.stats(500).json({
            success : false,
            message : 'Not updating Profile',
            error : error.message,
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        //get Id
        const id = req.user.id;
        console.log(id)
        //validation
        const userDetails = await User.findById(id);
        if (!userDetails)
        {
            return res.status(404).json({
                success : false,
                message : 'User Not Found'
            })
        }
        console.log(userDetails)
        //delete Profile
        await Profile.findByIdAndDelete({_id : userDetails.additionalDetails});

        //delete User
        await User.findByIdAndDelete({_id : id});
        
        //TODO : decrement in enrolled courses

        //return response
        return res.status(200).json({
            success : true,
            message : 'User Account Deleted',
        })
    }catch (error) {
        console.log(error)
        return res.status(500).json({
            success : false,
            message : 'User Cannot Deleted',
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {

    try {

        const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    const updatedImage = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
    );

    //create DB entry
    const updatedProfile = await User.findByIdAndUpdate(
        {_id : userId},
        {image : updatedImage.secure_url},
        {new : true},
    )
    //return res
    return res.status(200).json({
        success : true,
        message : 'Profile Picture Updated Successfully',
        data : updatedProfile
    })

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

exports.getAllUserDetails = async (req, res) => {

    try {
        const userId = req.user.id;

        const userDetails = await User.findById(userId).populate("additionalDetails")
        .exec();;

        return res.status(200).json({
            success : true,
            message : 'All User details',
            userDetails
        })

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }   
}