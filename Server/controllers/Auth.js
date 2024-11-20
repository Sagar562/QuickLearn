const User = require('../models/User')
const OTP = require('../models/OTP')
const Profile = require('../models/Profile')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mailSender = require('../utils/mailSender')
const { otpTemplate } = require('../mail/templates/emailVerificationTemplate')

require('dotenv').config();


//send otp
exports.sendOTP = async (req, res) => {

    try {

        //fetch email
        const {email} = req.body;

        //check user exist or not
        const checkUser = await User.findOne({email});

        if (checkUser)
        {
            return res.status(401).json({
                success : false,
                message : 'User already registered'
            })
        }
        //generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false
        })
        //check for unique otp
        var resultOtp = await OTP.findOne({otp : otp})

        while (resultOtp) 
        {
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false
            })
            // resultOtp = await OTP.findOne({otp : otp})
        }
        
        const otpPayload = {email, otp};

        //create Database entry
        const otpBody = await OTP.create({
            email : email,
            otp : otp
        });
        console.log(otpBody);
        console.log('otp saved in db');

        // await mailSender(
        //     otpBody.email,
        //     otpTemplate(otpBody.otp),
        // );

        res.status(200).json({
            success : true, 
            message : 'Otp sent successfully',
            otp : otpBody.otp,
        })

    } catch(error) {
        return res.status(500).json({
            success : false,
            message : 'email not found',
            error : error.message,
        })
    }
}

//sign up
exports.signUp = async (req, res) => {

    try {

        const {firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;

        //validate
        if (!firstName || !lastName || !email || !password || !confirmPassword
            || !otp)
        {
            return res.status(403).json({
                success : false,
                message : 'All fileds are required'
            })
        }
        //2 password check

        if (password !== confirmPassword)
        {
            return res.status(400).json({
                success : false,
                message : 'value is not matched'
            }) 
        }
        //check user 
        const checkUser = await User.findOne({email})
        if (checkUser)
        {
            return res.status(400).json({
                success : false,
                message : 'User already present'
            })
        }

        //find most recent otp 
        const recentOtp = await OTP.find({email}).sort({cratedAt : -1}).limit(1);

        console.log(recentOtp)

        //validate OTP
        if (recentOtp.length == 0)
        {
            return res.status(400).json({
                success : false,
                message : 'OTP not found'
            })
        }
        else if (otp !== recentOtp[0].otp)
        {
            //otp not matched
            return res.status(400).json({
                success : false,
                message : 'OTP not matched'
            })
        }

        //hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //create entry in db
        const profileDetails = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password : hashPassword,
            accountType,
            additionalDetails : profileDetails._id,
            image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success :true,
            message : 'User is signUp successfully',
            user
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'User cannot signUp'
        })
    }
}


//login
exports.logIn = async (req, res) => {

    try {

        const {email, password} = req.body;

        //validate
        if (!email || !password)
        {
            return res.status(403).json({
                success : false,
                message : 'please enter all fileds'
            })
        }
        //check user exist or not
        const user = await User.findOne({email}).populate('additionalDetails');

        if (!user)
        {
            return res.status(400).json({
                success : false,
                message : 'User is not present'
            })
        }
        //check password & generate token
     
        const checkPassword = await bcrypt.compare(password, user.password);

        if (checkPassword) 
        {
            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType
            }
            let token =jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn : '2h'
            });
            user.token = token;
            user.password = undefined;
       
             //create cookie and send response
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                http : true
            }
            res.cookie('token', token, options).status(200).json({
                success : true,
                token,
                user,
                message : 'Logged In successufully'
            })
        }
        else
        {
            return res.status(401).json({
                success : false,
                message : 'Password is incorrect'
            })
        }

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'LogIn failure, please try again'
        })
    }
}

//change password
exports.changePassword = async (req, res) => {
    try {


        //get user details for user old password
        const userDetails = await User.findById(req.user.id);
        
        //get user data from req body
        const {oldPassword, newPassword, confirmPassword} = req.body;

        //check on old password of user
        const checkPassword = await bcrypt.compare(oldPassword, userDetails.password);

        if (!checkPassword)
        {
            return res.status(401).json({
                success : false,
                message : 'The Old Password is incorrect'
            })
        }

        //check newPassword and confirmPassword
        if (newPassword !== confirmPassword)
        {
            return res.status(400).json({
                success : false,
                message : 'newPassword and confirmPassword does not matched',
            })
        }

        //update password in Database
        const newUpdatedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUserDetails = await User.findByIdAndUpdate(
                                                                    req.user.id,
                                                                    {password : newUpdatedPassword},
                                                                    {new : true},
                                                                )
        //send email to user for password updation successfully
        try {

            const emailResponse = await mailSender(
                updatedUserDetails.email,
                `Password updated for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            );
        }catch(error) {
        // If there's an error sending the email
                console.error("Error occurred while sending email:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error occurred while sending email",
                    error: error.message,
                });
        }                                             

        return res.status(200).json({
            success : true,
            message : 'PassWord updated successfully',
            updatedUserDetails
        })

    }catch(error) {
        console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }     

}