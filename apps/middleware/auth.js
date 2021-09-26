const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

exports.checkToken = async (req, res, next) => {
    if (!req.header('Authorization') || typeof req.header('Authorization') == 'undefined') {
        return res.send({ status: false, message: 'Authorization token has not been found.' })
    } else {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_KEY)
        try {
            const user = await User.findOne({ _id: data._id, 'tokens.token': token });
            if (!user) {
                // throw new Error()
                return res.send({ status: false, message: 'User has not been found.' })
            }
            req.user = user
            req.token = token
            next();
        } catch (error) {
            return res.send({ status: false, message: 'Not authorized to access this resource.' })
        }
    }
}