const Category = require('../models/Category');
const Course = require('../models/Course')
const User = require('../models/User')
const { uploadImageToCloudinary } = require('../utils/imageUploader')
require('dotenv').config();

//create Course Handler
exports.createCourse = async (req, res) => {
    try {
        
        const {courseName, courseDescription, whatYouWillLearn, price, category, tag} = req.body;

        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !tag)
        {
            return res.status(400).json({
                success : false,
                message : 'All fields are required',
            })
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails);

        if (!instructorDetails)
        {
            return res.status(404).json({
                success : false,
                message : 'Instructor details not found',
            })
        }

        //check given Category is valid or not
        const categoryDetails = await Category.findById(category);

        if (!categoryDetails)
        {
            return res.status(404).json({
                success : false,
                message : 'Category details not found',
            })
        }
        //upload to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatYouWillLearn,
            price,
            category : categoryDetails._id,
            tag,
            thumbnail : thumbnailImage.secure_url,
        })

        //add to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id : instructorDetails._id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true},
        )

        //update category schema
        await Category.findByIdAndUpdate(
            {_id : categoryDetails._id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true}
        )

        //return res
        return res.status(200).json({
            success : true,
            message : 'Course created successfully',
            data : newCourse,
        })

    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success : false,
            message : 'Failed to create course'
        })
    }
}

//getAllCourses 

exports.getALlCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, 
                                            {
                                                courseName : true,
                                                courseDescription : true,
                                                price : true,
                                                thumbnail : true,
                                                instructor : true,
                                                ratingAndReviews : true,
                                                studentsEnrolled : true,
                                            }
        ).populate('instructor').exec();
        
        return res.status(200).json({
            success : true,
            message : 'Found All courses data',
            allCourses,
        })

    } catch(error)
    {
        return res.status(500).json({
            success : false,
            message : 'cannot get all courses'
        })
    }
}

//get courseDetails
exports.getCourseDetails = async (req, res) => {

    try {
        //get course Id
        const {courseId} = req.body;
        
        //find course details
        const courseDetails = await Course.find(
                                                {_id : courseId},
                                            )
                                            .populate(
                                                {
                                                    path : 'instructor',
                                                    populate: {
                                                        path : 'additionalDetails',
                                                    }
                                                }
                                            )
                                            .populate('category')
                                            // .populate('ratingAndreviews')
                                            .populate(
                                                {
                                                    path : 'courseContent',
                                                    populate : {
                                                        path : 'subSection',
                                                    }
                                                }
                                            ).exec();

    //validation
    if (!courseDetails)
    {
        return res.status(400).json({
            success : false,
            message : `Could not find the course with ${courseId}`,
        })
    }

    //return res
    return res.status(200).json({
        success : true,
        message : 'Course Details fetched successfully',
        data : courseDetails,
    })

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }

}