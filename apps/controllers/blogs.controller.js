const Blog = require('../models/blogs.model');

/**
 * This function create new blog.
 *
 * @param title, description, author
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-12-19
 */
exports.createBlog = async function (request, response) {
    // Create a new Blog
    try {
        var body = request.body;
        var errors = [];

        if (!body.title) {
            errors.push(['Title is required']);
        }

        if (!body.author) {
            errors.push(['Author is required']);
        }

        if (!body.description) {
            errors.push(['Description is required']);
        }

        if (errors && errors.length > 0) {
            var message = errors.join(', ');

            return response.status(400).send({
                status: false,
                message: message
            })
        }

        const blog = new Blog(body)
        await blog.save();

        if (blog) {
            return response.status(201).send({
                status: true,
                message: "Blog has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Blog has not been created."
            })
        }
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

/**
 * This function update blog.
 *
 * @param title, description, id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-12-19
 */
exports.updateBlog = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["Blog id is required"]);
    }
    if (!body.title) {
        errors.push(["Title is required"]);
    }
    if (!body.description) {
        errors.push(["Description is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(", ");
        return response.status(400).send({
            status: false,
            message: message
        });
    }

    try {
        Blog.updateOne({ _id: body.id }, {
            title: body.title,
            description: body.description
        }, function (error, result) {
            if (error) {
                return response, status(400).send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(200).send({
                    status: true,
                    message: "Blog has been updated successfully"
                })
            }
        });
    } catch (error) {
        return response.status(200).send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * This function delete blog.
 *
 * @param id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-12-19
 */
exports.deleteBlog = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["Blog id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(", ");
        return response.status(400).send({
            status: false,
            message: message
        });
    }

    try {
        Blog.deleteOne({ _id: body.id }, function (error, result) {
            if (error) {
                return response, status(400).send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(200).send({
                    status: true,
                    message: "Blog has been deleted successfully"
                })
            }
        });
    } catch (error) {
        return response.status(200).send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * This function store comments to a particular blog.
 *
 * @param id, comment, user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-12-19
 */
exports.addCommentsToBlog = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["Blog id is required"]);
    }
    if (!body.comment) {
        errors.push(["Comment is required"]);
    }
    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(", ");
        return response.status(400).send({
            status: false,
            message: message
        });
    }

    try {
        Blog.update({ _id: body.id }, { $push: { comments: { comment: body.comment, user_id: body.user_id } } }, function (error, result) {
            if (error) {
                return response, status(400).send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(200).send({
                    status: true,
                    message: "Comment has been added to blog successfully."
                })
            }
        });
    } catch (error) {
        return response.status(200).send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * Get all blogs.
 *
 * @param --
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-12-19
 */
exports.getAllBlogs = async function (request, response) {
    var body = request.body;

    try {
        Blog.aggregate([
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'user_details'
                }
            }
        ]).exec(function (error, blogs) {
            if (error) {
                return response, status(400).send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(200).send({
                    status: true,
                    data: blogs
                })
            }
        });
    } catch (error) {
        console.log(error)
        return response.status(200).send({
            status: false,
            message: "Something went wrong."
        });
    }
}