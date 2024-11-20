const express = require('express');
const router = express.Router();

//import the controllers

//Course controllers
const {
    createCourse,
    getALlCourses,
    getCourseDetails
} = require('../controllers/Course');

//Category contollers
const {
    createCategory,
    showAllCategory,
    categoryPageDetails
} = require('../controllers/Category');

//Section controllers
const {
    createSection,
    updateSection,
    deleteSection
} = require('../controllers/Section');

//SubSection controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/SubSection');

//Rating and Reviews controllers
const {
    createRating,
    getAverageRating,
    getAllRating
} = require('../controllers/RatingAndReview');

//importing middlewares
const {
    auth,
    isAdmin,
    isInstructor,
    isStudent
} = require('../middlewares/auth');

//Routes for courses

//courses can only created by instructor
router.post('/createCourse', auth, isInstructor, createCourse);
//add section
router.post('/addSection', auth, isInstructor, createSection);
//update section
router.put('/updateSection', auth, isInstructor, updateSection);
//delete section
router.delete('/deleteSection', auth, isInstructor, deleteSection);
//add subsection
router.post('/addSubSection', auth, isInstructor, createSubSection);
//update subsection
router.put('/updateSubSection', auth, isInstructor, updateSubSection);
//delete subsection
router.delete('/deleteSubSection', auth, isInstructor, deleteSubSection);
//get all courses
router.get('/getAllCourses', getALlCourses);
//get specific course
router.get('/getCourseDetails', getCourseDetails);// check for get


//CATEGORY ROUTES

//category is created by admin
router.post('/createCategory', auth, isAdmin, createCategory);
//showAll category
router.get('/showAllCategories', showAllCategory);
//category page details
router.get('/getCategoryPageDetails', categoryPageDetails);


//RATING AND REVIEWS ROUTES

//create rating and reviews by student
router.post('/createRating', auth, isStudent, createRating);
//get average ratings
router.get('/getAverageRating', getAverageRating);
//get all ratings
router.get('/getReviews', getAllRating);

module.exports = router;