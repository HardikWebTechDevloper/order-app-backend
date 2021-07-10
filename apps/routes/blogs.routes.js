const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const blogsController = require('../controllers/blogs.controller');
const Authentication = require('../middleware/auth');

// a simple test url to check that all of our files are communicating correctly.
router.post('/create', Authentication, blogsController.createBlog);
router.post('/update', Authentication, blogsController.updateBlog);
router.post('/delete', Authentication, blogsController.deleteBlog);
router.post('/add/comment', Authentication, blogsController.addCommentsToBlog);
router.post('/get/all', Authentication, blogsController.getAllBlogs);

module.exports = router;