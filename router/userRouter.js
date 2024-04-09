const express = require('express');

const router = express.Router();

const { signUp, 
    verify, 
    logIn, 
    forgotPassword,
     resetPasswordPage,
      resetPassword,
      changePassword,
       signOut,
       getOneUser ,
    getUsers,
    updateUser,
    deleteUser} = require('../controller/userController');
const { authenticate } = require('../middlewear/authentication');


//endpoint to register a new user
router.post('/signup', signUp);

router.post('/verify/:id', verify); 

//endpoint to login a verified user
router.post('/login', logIn);

//endpoint for forget Password
router.post('/forgotpass', forgotPassword);

//endpoint for reset Password Page
router.get('/reset/:userId', resetPasswordPage);

//endpoint to reset user Password
router.post('/resetUser', authenticate, resetPassword);

//endpoint for forget Password
router.post('/changePass',authenticate, changePassword);

//endpoint to sign out a user
router.post("/signout/:userId", signOut)

// endpoint to delete a user
router.delete("/deleteuser/:userId", deleteUser)


//endpoint to get a use
router.get("/getUser/:id", getOneUser)

//endpoint to get a use
router.get("/getUsers", getUsers)

//endpoint to update user
router.put("/updateuser/:id", updateUser)

module.exports = router;

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

        // Generate password reset token (you can use a library like crypto to generate a random token)
        const resetToken = generateResetToken(); // Implement this function

        // Set/reset the password reset token and expiration time in the user model
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

        // Save the user with updated reset token and expiration time
        await user.save();

        // Create a password reset link with the token
        const resetLink = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;

        // Send the password reset email
        const subject = 'Password Reset';
        const html = `Click the link below to reset your password:<br><a href="${resetLink}">${resetLink}</a>`;
        await sendEmail(user.email, subject, html); // Implement the sendEmail function

        // Respond with success message
        return res.status(200).json({
            message: 'Password reset email sent. Check your email for instructions.'
        });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};






exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email exists in the database
        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Email does not exist' });
        }

        // Generate a password reset link
        const resetLink = `${req.protocol}://${req.get('host')}/api/v1/reset/${user.id}`;

        // Prepare the email content
        const subject = 'Password Reset Request';
        const html = resetFunc(user.firstName, resetLink);

        // Send the password reset email
        await sendEmail({
            email: user.email,
            subject,
            html
        });

        return res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};