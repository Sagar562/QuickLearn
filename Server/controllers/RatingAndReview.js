const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');


//create rating
exports.createRating = async (req, res) => {

    try {
        //get user id
        const userId = req.user.id;

        //fetch data from req body
        const {rating, review, courseId} = req.body;

        //check if user enrolled or not
        const courseDetails = await Course.findOne(
                                                    {
                                                        _id : courseId,
                                                        studentsEnrolled : {$elemMatch : {$eq : userId}}
                                                    }
                                                )
        if (!courseDetails)
        {
            return res.status(404).json({
                success : false,
                message : 'Student is not enrolled in the course',
            })
        }

        //check user can give only for one review
        const alreadyReviewd = await RatingAndReview.findOne(
                                                                {user : userId,
                                                                course : courseId,
                                                                },
                                                            )
        if (alreadyReviewd)
        {
            return res.status(403).json({
                success : false,
                message : 'Course is already reviewed by User',
            })
        }

        //create rating
        const ratingReview = await RatingAndReview.create(
            {
                rating,
                review,
                course : courseId,
                user : userId,
            }
        );
        
        //update in course schema
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                        {_id : courseId},
                                        {
                                            $push : {
                                                ratingAndReviews : ratingReview._id,
                                            }
                                        },
                                        {new : true},
                                    );

        //return res 
        return res.status(200).json({
            success : true,
            message : 'Rating and Review created successfully',
            ratingReview,

        })

    }catch(error) { 
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }

}

//average rating
exports.getAverageRating = async (req, res) => {

    try {

        //get course Id
        const {courseId} = req.body;
        
        //match course Id and use aggregate function
        const result = await RatingAndReview.aggregate([
            {
                $match : {
                    course : new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group : {
                    _id : null,
                    averageRating : {$avg : 'rating'},
                }, 
            },
        ])

        //return res
        if (result.length > 0)
        {
            return res.status(200).json({
                success : true,
                averageRating : result[0].averageRating,
            })
        }

        //return res if no review present
        return res.status(200).json({
            success : true,
            averageRating : 0,
        })

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }

}

//getAllrating
exports.getAllRating = async (req, res) => {

    try {
        const allReviews = await RatingAndReview.find({})
                                                .sort('desc')
                                                .populate({
                                                    path : 'user',
                                                    select : 'firstName lastName email image',
                                                })
                                                .populate({
                                                    path : 'course',
                                                    select : 'courseName',
                                                })
                                                .exec();
        
        //return res
        return res.status(200).json({
            success : true,
            message : 'All rating and reviews fetched successfully',
            data :  allReviews,
        })

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}