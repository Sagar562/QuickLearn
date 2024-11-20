const {instance} = require('../config/razorpay');
const Course = require('../models/Course')
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const mongoose = require('mongoose');

//capture the payments and initiate order in RazorPay
exports.capturePayment = async (req, res) => {

  
        //get courseId and userId 
        const {courseId} = req.body;
        const userId = req.user.id;

        //validation
        //valid courseId
        if (!courseId)
        {
            return res.status(404).json({
                success : false,
                message : 'Please valid courseId'
            })
        }

        //validCourseDetails
        let course;
        try {
            course = await Course.findById(courseId);

            if (!course)
            {
                return res.status(404).json({
                    success : false,
                    message : 'Could not find course details',
                })
            }

            //user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId) //convert userID string to objectID

            if (course.studentsEnrolled.includes(uid))
            {
                return res.status(200).json({
                    success : false,
                    message : 'Student is already enrolled',
                })
            }
            

        }catch(error) {
            return res.status(500).json({
                success : false,
                message : error.message,
            })
        }
        
        //order create
        const amount = course.price;
        const currency = 'INR';

        const options = {
            amount : amount * 100,
            currency,
            receipt : Date.now(),
            notes : {
                courseId,
                userId,
            }
        }
        //initiate the payment using razorpay
        try {
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            //return response
            return res.status(200).json({
                success : true,
                courseName : course.courseName,
                courseDescription : course.courseDescription,
                thumbnail : course.thumbnail,
                orderId : paymentResponse.id,
                currency : paymentResponse.currency,
                amount : paymentResponse.amount,
            })
    

        }catch(error) {
            return res.status(500).json({
                success : false,
                message : 'Could not initiate razorpay order'
            })
        }

    }

//verify signature
exports.verifySignature = async (req, res) => {

    const webhookSecret = '12345678';

    const signature = req.headers['x-razorepay-signature'];

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (signature === digest)
    {
        console.log('Payment is authorized');

        //get notes (course id and user id from razorpay request)
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            //find the course and enrolled in course
            const enrolledCourse = await Course.findOneAndUpdate(
                                                        {_id : courseId},
                                                        {
                                                            $push : {
                                                                studentsEnrolled : userId
                                                            }
                                                        },
                                                        {new : true},
            )

            if (!enrolledCourse)
            {
                return res.status(500).json({
                    success :false,
                    message : 'Course not found'
                })
            }
            console.log(enrolledCourse);

            //find the user (student) and add course (course id)
            const enrolledStudent = await User.findOneAndUpdate(
                                                                {_id : userId},
                                                                {
                                                                    $push : {
                                                                        courses : courseId
                                                                    }
                                                                },
                                                                {new : true}
            )

            if (!enrolledStudent)
            {
                return res.status(500).json({
                    success :false,
                    message : 'User not found'
                })
            }
            
            console.log(enrolledStudent);

            //send confirmation email to user



            //return res
            return res.status(200).json({
                success : true,
                message : 'Signature verified and student enrolled',
            })

        }catch(error) {
            console.log(error);
            return res.status(500).json({
                success : false,
                message : error.message,
            })
        }
    }
    else {
        return res.status(400).json({
            success : false,
            message : 'Invalid request',
        })
    }

}    