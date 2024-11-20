const Section = require('../models/Section')
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');

exports.createSection = async(req, res) => {
    try {
        //data fetch
        const {sectionName, courseId} = req.body;
        
        //data validate
        if (!sectionName || !courseId)
        {
            return res.status(400).json({
                success : false,
                message : 'All data required'
            })
        }
        //create section
        const newSection = await Section.create({sectionName});

        //update in course
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                                courseId,
                                                            {
                                                                $push : {
                                                                    courseContent : newSection._id
                                                                }
                                                            },
                                                            {new : true},
                                                        )
                                                        //populate section and subsection
                                                        .populate(
                                                            {
                                                                path : 'courseContent',
                                                                populate : {
                                                                    path : 'subSection'
                                                                },
                                                            }
                                                        ).exec();
                                                        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success : true,
            message : 'Section created successfully',
            updatedCourseDetails
        })

    }catch (error) {
        return res.status(500).json({
            success : false,
            message : 'unable to create a section'
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        //data from input
        const {sectionName ,sectionId} = req.body;

        //data validate
        if (!sectionName || !sectionId)
        {
            return res.status(400).json({
                success : false,
                message : 'All data required'
            })
        }
        //update data into database
        const section = await Section.findByIdAndUpdate(sectionId,
                                                        {sectionName},
                                                        {new : true},
                                                        )
                console.log('section', section)
                                                
        //return response
        return res.status(200).json({
            success : true,
            message : 'section updated',
            section
        })
    }catch(error) {
        console.log(error)
        return res.status(500).json({
            success : false,
            message : 'unable to update a section'
        })
    }
}

exports.deleteSection = async (req,res) => {
    try {
        //get id from params    
        const {courseId, sectionId} = req.body;
    
        // console.log(sectionId)
        // console.log(courseId)
        
        //delete id
        await Course.findByIdAndUpdate(
            courseId,
            {
                $pull : {
                    courseContent : sectionId
                }
            },
            {new : true}
        )

        //delete all subSection for thet we have to get section data
        const sectionData = await Section.findById(sectionId);

        if (sectionData.subSection)
        {
            await SubSection.deleteMany(
                {
                    _id : {$in : sectionData.subSection}
                }
            )
        }

        await Section.findByIdAndDelete(sectionId);
        
        //return response
        return res.status(200).json({
            success : true,
            message : 'Section deleted successfully'
        })

    }catch(error) {
        console.log(error)
        return res.status(500).json({
            success : false,
            message : 'unable to delete a section'
        })
    }
}