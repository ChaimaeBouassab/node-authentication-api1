const express = require('express')
const router = express.Router()
const morgan = require('morgan')
const createError=require('http-errors');
const User = require('../Models/User.models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
 


router.post("/registre", async (req, res) => {
    try {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      //?check if the user is valid
      const error = await user.validate();
      if (error) throw error;
      // console.log("~ file: auth.js:17 ~ router.post ~ error", error);
  
      //?checking if the users's email il aready used
      const isEmailUsed = await User.isEmailUsed(user.email);
      if (isEmailUsed)
        throw new Error(JSON.stringify({ message: "Email is already used" }));
      //?hasing the password
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
      //?inserting the newuser to the databse
      user.save();
  
      const token = jwt.sign(
        {
          id: user._id,
          exp: Date.now() + +process.env.TOKEN_EXIPE_TIME,
          iat: Date.now(),
        },
        process.env.ACCESS_TOKEN_SECRET
      );
  
      res.header("auth-token", token).json({ status: "ok" });
    } catch (e) {
      res.status(400).send(e.message);
    }
  });
  router.post("/login", async (req, res) => {
    try {
      if (req.body.email === undefined || req.body.password === undefined)
        throw new Error(
          JSON.stringify({ message: "email or password is missing" })
        );
      const user = await User.findOne({ email: req.body.email });
      if (user === null)
        throw new Error(JSON.stringify({ message: "user not found" }));
  
      if (user.email !== req.body.email.toLowerCase())
        throw new Error(
          JSON.stringify({ message: "email or password are incorrect" })
        );
  
      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordCorrect)
        throw new Error(
          JSON.stringify({ message: "email or password  are incorrect" })
        );
  
      const token = jwt.sign(
        {
          id: user._id,
          exp: Date.now() + +process.env.TOKEN_EXIPE_TIME,
          iat: Date.now(),
        },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.header("auth-token", token).json({ status: "ok" });
    
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

  router.post("/changepassword", async (req, res) => {
    try {
      const { email } = req.body;
      if (email === undefined) throw new Error("email is missing");
      const { oldPassword } = req.body;
      if (oldPassword === undefined) throw new Error("old password is missing");
      //?check if the old password is correct
      const { newPassword } = req.body;
      if (newPassword === undefined) throw new Error("new password is missing");
     
      const user = await User.findOne({ email: email });
      if (!user) throw new Error(JSON.stringify({ message: "user not found" }));
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  
      if (!isPasswordCorrect)
        throw new Error(JSON.stringify({ message: "old password is incorrect" }));
  
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      user.password = hashedPassword;
      await user.save();
      res.status(200).send({ status: "ok" });
    } catch (e) {
      res.status(400).send(e.message);
    }
  });
    
    router.post('/refresh-token', async (req, res, next) => {
        const { email, password } = req.body;

    res.send('refresh token route')
    })
    
    router.post('/register', async (req, res, next) => {
    res.send('register route')
    res.status(200).json({ message: 'Registration successful', user: { email } });

    })

    router.delete('/logout', async (req, res, next) => {
        res. send('logout route')
        })

        module.exports = router