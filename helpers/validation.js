const joi = require('@hapi/joi');

const validateUser = (data) => {
    try {
        const validateSchema = joi.object({
          
            userName: joi.string().min(3).max(30).trim().required().messages({
                'string.empty': "Username field can't be left empty",
                'string.min': "Minimum of 3 characters for the username field",
                'any.required': "Please username is required"
            }),
            
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            password: joi.string().min(8).max(20).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (err) {
        return res.status(500).json({
            Error: "Error while validating user: " + err.message,
        })
    }
}


const validateUserLogin = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            password: joi.string().min(8).max(20).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (err) {
        return res.status(500).json({
            Error: "Error while validating user: " + err.message,
        })
    }
}



const validateCreateTodoList = (data) => {
    try {
        const validateSchema = joi.object({
            title: joi.string().max(40).trim().regex(/^[\w\s]+$/).required().messages({
                'string.pattern.base': "Title can only contain letters, numbers, and spaces",
                'string.empty': "Title field can't be left empty",
                'any.required': "Please enter a title"
            }),
            description: joi.string().min(8).trim().regex(/^[\w\s]+$/).required().messages({
                'string.pattern.base': "Description can only contain letters, numbers, and spaces",
                'string.empty': "Description field can't be left empty",
                'string.min': "Description must be at least 8 characters long",
                'any.required': "Please enter a description"
            }),
            dueDate: joi.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).required().messages({
                'string.pattern.base': "Due date must be in the format YYYY-MM-DD",
                'any.required': "Please enter a due date"
            })
        });

        return validateSchema.validate(data);
    } catch (err) {
        return res.status(500).json({
            Error: "Error while validating to-do list item: " + err.message,
        });
    }
};




module.exports = {
    validateUser,
    validateUserLogin,
    validateCreateTodoList

}