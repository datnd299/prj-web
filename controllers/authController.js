const {
    promisify
} = require('util');
const jwt = require('jsonwebtoken');
const Account = require('../models/user/account');
const AccessToken = require('../models/access/token');
const AppError = require('../utils/appError');


const createToken = id => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;
        
        // 1) check if email and password exist
        if (!email || !password) {
            return next(new AppError(404, 'fail', 'Please provide email or password'), req, res, next);
        }
        
        // 2) check if user exist and password is correct
        const acc = await Account.findOne({
            $or:[{email:email},{acc_name:email}]
        }).select('+password');
        

        if (!acc || !await acc.correctPassword(password, acc.password)) {
            return next(new AppError(401, 'fail', 'Email or Password is wrong'), req, res, next);
        }
        // 3) All correct, send jwt to client
        const token = createToken(acc.id);
        await AccessToken.create({
            token :token,
            acc : acc

        })
        // Remove the password from the output 
        acc.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                acc
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.changePass = async (req, res, next) => {
    try {
        
        const {
            username,
            password,
            n_password,
            n_password_confirm
        } = req.body;
       
        
        // 1) check if email and password exist
        if (!username || !password) {
            return next(new AppError(404, 'fail', 'Please provide email or password'), req, res, next);
        }
        if (n_password!= n_password_confirm ||!n_password) {
            return next(new AppError(401, 'fail', 'New password is wrong'), req, res, next);
        }
        // 2) check if user exist and password is correct
        const acc = await Account.findOne({
            $or:[{email:username},{acc_name:username}]
        }).select('+password');

        if (!acc || !await acc.correctPassword(password, acc.password)) {
            return next(new AppError(401, 'fail', 'Email or Password is wrong'), req, res, next);
        }
        acc.password = n_password;
        acc.passwordConfirm = n_password_confirm;
        await acc.save();
        res.status(200).json({
            status: 'success',
            data: {
                acc
            }
        });

    } catch (err) {
        next(err);
    }
};






exports.signup = async (req, res, next) => {

    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role,
        });

        const token = createToken(user.id);

        user.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user
            }
        });

    } catch (err) {
        next(err);
    }

};

exports.protect = async (req, res, next) => {
    try {
        // 1) check if the token is there
        let token;
        
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError(401, 'fail', 'You are not logged in! Please login in to continue'), req, res, next);
        }


        // 2) Verify token 
        const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) check if the user is exist (not deleted)
        const acc = await Account.findById(decode.id);
        if (!acc) {
            return next(new AppError(401, 'fail', 'This user is no longer exist'), req, res, next);
        }

        req.acc = acc;
        next();

    } catch (err) {
        next(err);
    }
};

// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.acc.role)) {
            return next(new AppError(403, 'fail', 'You are not allowed to do this action'), req, res, next);
        }
        next();
    };
};