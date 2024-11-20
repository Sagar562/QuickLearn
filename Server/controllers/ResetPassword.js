const User = require('../models/User')
const mailSender = require('../utils/mailSender')
const bcrypt = require('bcryptjs')

//reset password token
exports.resetPasswordToken = async (req, res) => {

    try {

         //get email 
    const {email} = req.body;

    //email validation
    const user = await User.findOne({email});

    if(!user)
    {
        return res.status(400).json({
            success : false,
            message : 'User not present'
        })
    }
    //generate token
    const token = crypto.randomUUID();
    
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
                                                        {email},
                                                        {
                                                            token : token,
                                                            resetPasswordExpires : 5*60*1000
                                                        },
                                                        {new : true}
                                                    );

    //send token to url
    const url = `http://localhost:3000/update-password/${token}`;

    //send url in email
    await mailSender(email,
                            'Password Reset Link',
                            `Password Reset Link ${url}`)                                                    
    //return response
    return res.json({
        success : true,
        message: 'Email sent successfully'
    })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong while reset password'
        })
    }
}
//reset Password
exports.resetPassword = async (req, res) => {

    try {
        //data fetch
        const {password, confirmPassword, token} = req.body;

        //validation
        if (password !== confirmPassword)
        {
            return res.status(401).json({
                success : false,
                message : 'Password not matched'
            })
        }

        //get user details using token
        const userDetails = await User.findOne({token});

        //check token is present or not
        if (!token) 
        {
            return res.status(404).json({
                success : false,
                message : 'Token not present'
            })
        }

        //hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //update password
        await User.findOneAndUpdate(
            {token},
            {password : hashPassword},
            {new : true}
        );

        //return response
        return res.status(200).json({
            success : true,
            message : 'Password Reset successfully'
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong while updating'
        })
    }

}