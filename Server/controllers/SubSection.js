const SubSection = require('../models/SubSection')
const Section = require('../models/Section')
const {uploadImageToCloudinary} = require('../utils/imageUploader');
// const { default: subscriptions } = require('razorpay/dist/types/subscriptions');
require('dotenv').config();


//create SubSection 
exports.createSubSection = async (req,res) => {
    try {
        //fetch data 
        const {title, timeDuration, description, sectionId} = req.body;

        //get video file
        const video = req.files.videoFile;
        
        //validation
        if (!sectionId || !title || !timeDuration || !description || !video) 
        {
            return res.status(400).json({
                success : false,
                message : 'All fields are required',
            })
        }

        //upload video to cloudinary
        const uploadDeatails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create entry in Database
        const subSectionDetails = await SubSection.create({
            title : title,
            timeDuration : timeDuration,
            description : description,
            videoUrl : uploadDeatails.secure_url,
        })

        //update in Section id $push
        const updatedSection = await Section.findByIdAndUpdate(
                                                                {_id : sectionId},
                                                                {
                                                                    $push : {
                                                                        subSection : subSectionDetails._id,
                                                                    }
                                                                },
                                                                {new : true},
                                                            ).populate('subSection').exec();//populate subsection in section
        //return response
        return res.status(200).json({
            success : true,
            message : 'SubSection created successfully',
            updatedSection,     
        })
                                                                                     
    }catch(error) {
        return res.status(500).json({
            success : false,
            message : 'Unable to create SubSection'
        })
    }
}

//update SubSection
exports.updateSubSection = async (req, res) => {

    try {

        //get Section id and SubSction id from req body
        const {title, timeDuration, description, subSectionId} = req.body;

        //find by id
        const subSectionValue = await SubSection.findById(subSectionId);
        
        if (!subSectionValue)
        {
            return res.status(404).json({
                success : false,
                message : 'SubSection not found',
            })
        }

        //now update the value
        if (title !== undefined)
        {
            subSectionValue.title = title; 
        }

        if (description !== undefined)
        {
            subSectionValue.description = description;
        }

        if (req.files && req.files.video !== undefined)
        {
            const video = req.files.video;

            const uploadUpdatedValue = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )

            subSectionValue.videoUrl = uploadUpdatedValue.secure_url;
            subSectionValue.timeDuration = `${uploadUpdatedValue.duration}`;
        }

        //save updated value in Database
        await subSectionValue.save();

        //return res
        return res.status(200).json({
            success : true,
            message : 'SubSection data updated Successfully',
        })

    }catch(error) {
        console.log('Error while updating SuubSection', error);
        return res.status(500).json({
            success : false,
            message : 'Internal Server error'
        })
    }
}

//delete SubSection
exports.deleteSubSection = async (req, res) => {

    try {
        //get SubSection id
        const {sectionId, subSectionId} = req.body;
        
        //find and update SubSection from section
        await Section.findByIdAndUpdate(
            sectionId,
            {
                $pull : {
                    subSection : subSectionId,
                }
            },
            {new : true},
        )

        //delete the SubSection
        await SubSection.findByIdAndDelete(subSectionId);
        
        //return res
        return res.status(200).json({
            success : true,
            message : 'SubSection deleted successfully',
        })
    }catch(error) {
        console.log('Error while deleting SubSection', error);
        return res.status(500).json({
            success : fasle,
            message : 'Internal server error',
        })
    }

}

