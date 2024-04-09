const { userModel } = require('../model/userModel');
const { Sequelize, sequelize, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateUser, validateUserLogin, } = require('../helpers/validation');
const { sendEmail } = require('../email');
const { generateDynamicEmail } = require('../emailHTML');
const { resetFunc } = require('../forgotPassword');
const resetHTML = require('../resetHTML');
require('dotenv').config();


//function to capitalize the first letter
const capitalizeFirstLetter = (str) => {
    return str[0].toUpperCase() + str.slice(1);
};


//Function to register a new user
exports.signUp = async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            });
        }

        const { userName, email, password } = req.body;


        // Check if email exists (case-insensitive)
        const emailExists = await userModel.findOne({
            where: {
                email: {
                    [Op.iLike]: email.toLowerCase()
                }
            }
        });

        if (emailExists) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }

        // Check if username exists (case-insensitive)
        const userNameExists = await userModel.findOne({
            where: {
                userName: {
                    [Op.iLike]: userName.toLowerCase()
                }
            }
        });

        if (userNameExists) {
            return res.status(400).json({
                message: 'Username taken'
            });
        }
        // Hash the user password
        const salt = bcrypt.genSaltSync(12);
        const hashpassword = bcrypt.hashSync(password, salt);

        // Create a new user instance
        const newUser = await userModel.create({
            userName: capitalizeFirstLetter(userName).trim(),
            email: email.toLowerCase(),
            password: hashpassword
        });

        // Generate token
        const token = jwt.sign(
            { email: newUser.email }, process.env.secret,
            { expiresIn: '60s' });
        newUser.token = token;


        //generate OTP
        const generateOTP = () => {
            const min = 1000;
            const max = 9999;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        const subject = 'Email Verification'
        // Generate OTP
        const otp = generateOTP();
        console.log("Generated OTP:", otp);
        newUser.newCode = otp;


        // Log the value of newUser.newCode just before saving
        console.log("Value of newUser.newCode before saving:", newUser.newCode);


        // Send verification email
        const html = generateDynamicEmail(userName, otp);
        sendEmail({
            email: newUser.email,
            html,
            subject
        });

        // Save user to database
        await newUser.save();

        return res.status(200).json({
            message: "Please check your email for the new OTP",
            data: newUser,
            token: token
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

//Function to verify a new user with an OTP
exports.verify = async (req, res) => {
    try {
        const id = req.params.id;

        //const token = req.params.token;
        const user = await userModel.findByPk(id);
        console.log(user)
        const { userInput } = req.body;


        // verify OTP
        if (user && userInput === user.newCode) {
            // Update the user if verification is successful
            await userModel.update(
                { isVerified: true },
                { where: { id: id } },
            );
            return res.status(200).send("You have been successfully verified. Kindly visit the login page.");
        } else {
            return res.status(400).json({
                message: "Incorrect OTP, Please check your email for the code"
            })
        }

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
};


// Function to resend the OTP incase the user didn't get the OTP
exports.resendOTP = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userModel.findById(id);

        const generateOTP = () => {
            const min = 1000;
            const max = 9999;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        const subject = 'Email Verification'
        const otp = generateOTP();

        user.newCode = otp
        const html = generateDynamicEmail(user, otp)
        sendEmail({
            email: user.email,
            html,
            subject
        })
        await user.save()
        return res.status(200).json({
            message: "Please check your email for the new OTP"
        })


    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
};

//Function to login a verified user
exports.logIn = async (req, res) => {
    try {
        const { error } = validateUserLogin(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {
            const { email, password } = req.body;
            // Check if user exists
            const user = await userModel.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                return res.status(404).json({
                    message: 'email not found'
                });
            }
            const checkPassword = bcrypt.compareSync(password, user.password);
            if (!checkPassword) {
                return res.status(404).json({
                    message: "Password is incorrect"
                })
            }
            const token = jwt.sign({
                userId: user.id,
                email: user.email,
            }, process.env.secret, { expiresIn: "48h" });

            if (user.isVerified === true) {
                res.status(200).json({
                    message: "Welcome " + user.userName,
                    token: token
                })
                user.token = token;
                await user.save();
            } else {
                res.status(400).json({
                    message: "Sorry user not verified yet."
                })
            }
        }

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

//Function for the user incase password is forgotten
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                message: 'Email does not exist'
            });
        }

        else {
            const subject = 'Kindly reset your password'
            const link = `${req.protocol}://${req.get('host')}/api/v1/reset/${user.id}`
            const html = resetFunc(user.userName, link)
            sendEmail({
                email: user.email,
                html,
                subject
            })
            return res.status(200).json({
                message: "Kindly check your email to reset your password",
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

//Funtion to send the reset Password page to the server
exports.resetPasswordPage = async (req, res) => {
    try {
        const userId = req.params.userId;
        const resetPage = resetHTML(userId);

        // Send the HTML page as a response to the user
        res.send(resetPage);
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}


//Function to reset the user password
exports.resetPassword = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find the user by ID
        const user = await userModel.findByPk(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const password = req.body.password;

        if (!password) {
            return res.status(400).json({
                message: "Password cannot be empty",
            });
        }

        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        // Update the user's password
        await user.update({ password: hashPassword });

        return res.status(200).json({
            message: "Password reset successfully",
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

// Function to change password
exports.changePassword = async (req, res) => {
    try {

        const userId = req.user.userId;

        // Find the user by ID
        const user = await userModel.findByPk(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const { currentPassword, newPassword } = req.body;

        // Check if the current password is correct
        const isPasswordCorrect = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            });
        }

        // Hash the new password
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: 'Password changed successfully'
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};


//sign out function
exports.signOut = async (req, res) => {
    try {
        //get the user's id from the request user payload
        const { userId } = req.user

        const hasAuthorization = req.headers.authorization
        if (!hasAuthorization) {
            return res.status(401).json({
                message: 'Invalid authorization',
            })
        }

        const token = hasAuthorization.split(' ')[1]

        const user = await userModel.findById(userId)

        //check if theuser is not exisiting
        if (!hasAuthorization) {
            return res.status(401).json({
                message: "User not found",
            })
        }

        //Blacklist the token
        user.blacklist.push(token)

        await user.save()

        //return a respponse
        res.status(200).json({
            message: "User logged out successfully"
        })


    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}



//get a user 
exports.getOneUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userModel.findByPk(id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        } else {
            return res.status(200).json({
                message: `${user.userName} found in the database`
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

//get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.findAll()
        if (users.length == 0) {
            res.status(404).json({
                message: "No users found"
            })
        } else {
            res.status(200).json({
                message: `There are ${users.length} users in the database`,
                data: users
            })
        }

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

//update a user in the database
exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;

        const users = await userModel.findByPk(id)

        if (!users || users.length <= 0) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const userData = {
            userName: capitalizeFirstLetter(req.body.userName) || userData.userName
        }

        // Update the user data
        const [updatedRowsCount] = await userModel.update(userData, {
            where: { id: id }
        });

        // Check if any rows were updated
        if (updatedRowsCount < 1) {

            return res.status(400).json({
                message: "Unable to update user data"
            });
        }

        // Fetch the updated user
        const updatedUser = await userModel.findByPk(id);

        // Capitalize the updated username before sending the response
        updatedUser.userName = capitalizeFirstLetter(updatedUser.userName);

        // Return success response with the updated user data
        return res.status(200).json({
            message: "User data updated successfully",
            data: updatedUser
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}



exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await userModel.findByPk(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Delete the user
        await user.destroy();

        return res.status(200).json({
            message: 'User has deleted'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};