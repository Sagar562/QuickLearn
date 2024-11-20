const jwt = require('jsonwebtoken')
const User = require('../models/User')

require('dotenv').config();

//auth
exports.auth = async (req, res, next) => {

    try {
        
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header('Authorisation').replace('Bearer ','');

        if (!token) 
        {
            return res.status(401).json({
                success : false,
                message : 'Token missing'
            })
        }
        //verify token
        try {

            const verifyToken = jwt.verify(token,process.env.JWT_SECRET);
            req.user = verifyToken;


        } catch(error) {
            return res.status(401).json({
                success : false,
                message : 'Token is invalid'
            })
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success : false,
            message : 'Something went wrong while validating'
        }) 
    }
}

//isStudent
exports.isStudent = async (req, res, next) => {

    try {
            //check role
            if (req.user.accountType !== 'Student')
            {
                return res.status(401).json({
                    success : false,
                    message : 'This is protected routes for Students'
                })
            }
            next();

    } catch(error) {
        return res.status(500).json({
            success : false,
            message : 'User role cannot be verified, please try again'
        })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {

    try {
            //check role
            if (req.user.accountType !== 'Admin')
            {
                return res.status(401).json({
                    success : false,
                    message : 'This is protected routes for Admin'
                })
            }
            next();

    } catch(error) {
        return res.status(500).json({
            success : false,
            message : 'User role cannot be verified, please try again'
        })
    }
}

//is Instructor
exports.isInstructor = async (req, res, next) => {

    try {
            //check role
            if (req.user.accountType !== 'Instructor')
            {
                return res.status(401).json({
                    success : false,
                    message : 'This is protected routes for Instructor'
                })
            }
            next();

    } catch(error) {
        return res.status(500).json({
            success : false,
            message : 'User role cannot be verified, please try again'
        })
    }
}

