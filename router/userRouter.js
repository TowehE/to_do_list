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
