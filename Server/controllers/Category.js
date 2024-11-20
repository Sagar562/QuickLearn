const Category = require('../models/Category');

//create Category
exports.createCategory = async (req, res) => {
    try {
        const {name, description} = req.body;

        if (!name || !description)
        {
            return res.status(400).json({
                success : false,
                message : 'all fields are required'
            })
        }
        //create entry in DataBase
        const tagDetails = await Category.create({
            name : name,
            description : description,
        })

        //return res
        return res.status(200).json({
            success : true,
            message : 'Category created successfully',
        })

    } catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

//getAllCategorys
exports.showAllCategory = async (req, res) => {
    try {
        
        const allCategories = await Category.find({}, {name : true, description : true});

        //return res
        return res.status(200).json({
            success : true,
            message : 'All Category returned successfully',
            allCategories,
        })

    } catch(error) {
        console.log('NO Category found')
        return res.status(500).json({
            success : false,
            message : 'No Category found'
        })
    }
}

//category Page Details
exports.categoryPageDetails = async (req, res) => {

    try {
        //get category Id
        const {categoryId} = req.body;

        //get courses for specified category Id
        const selectedCategory = await Category.findById(categoryId)
                                                        .populate('courses')
                                                        .exec();
                                                        
        //validation
        if (!selectedCategory)
        {
            return res.status(404).json({
                success : false,
                message : 'Courses related to Category not found',
            })
        }

        //get courses for diff category
        const diffCategories = await Category.findById({$ne : categoryId})
                                                        .populate('courses')
                                                        .exec();

        //return res
        return res.status(200).json({
            success : true,
            message : 'Courses selected for categories',
            data : {
                selectedCategory,
                diffCategories,
            }
        })
    }catch(error) {
        console.log('error 500', error);
        return res.status(500).json({
            success : false,
            message : 'Internal server error'
        })
    }

}