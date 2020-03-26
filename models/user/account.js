const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const accSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please fill your name']
    },
    acc_name:{
        type: String,
        required: [true, 'Please fill acc name'],
        unique:true,
    },
    email: {
        type: String,
        required: [true, 'Please fill your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, ' Please provide a valid email']

    },
    password: {
        type: String,
        required: [true, 'Please fill your password'],
        minLength: 1,
        select: false

    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please fill your password confirm'],
        validate: {
            validator: function (el) {
                // "this" works only on create and save 
                return el === this.password;
            },
            message: 'Your password and confirmation password are not the same'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'partyAAdmin', 'partyAEm','partyB'],
        required:true
    },
    status: {
        type: Number,
        default: 1,
        select: false
    },
});

// encrypt the password using 'bcryptjs'
// Mongoose -> Document Middleware
accSchema.pre('save', async function (next) {
    // check the password if it is modified
    if (!this.isModified('password')) {
        return next();
    }

    // Hashing the password
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
accSchema.methods.correctPassword = async function (typedPassword, originalPassword) {
    return await bcrypt.compare(typedPassword, originalPassword);
};

const Account = mongoose.model('Account', accSchema);
module.exports = Account;