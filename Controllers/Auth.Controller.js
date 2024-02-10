const express = require("express");
const router = express.Router();
const morgan = require("morgan");
const mongoose = require('mongoose')
const createError = require("http-errors");
const getMemberModel = require("../Models/User.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signAccessToken, signRefreshToken } = require("../helpers/jwt_helpers");


module.exports = {
  register: async (req, res) => {
    const MemberModel = getMemberModel(new Date().getFullYear());
    try {
      const { name, email, password, level, github, linkedin, team } =
        req.body;

      const user = new  MemberModel({
        name: name,
        email: email,
        password: password,
        level: level,
        github: github,
        linkedin: linkedin,
        team: team,
        year: new Date().getFullYear(),
      });

      const error = await user.validate();
      if (error) throw error;

      const isEmailUsed = await MemberModel.isEmailUsed(user.email);
      if (isEmailUsed)
        throw new Error(JSON.stringify({ message: "Email is already used" }));

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);

      const data = new MemberModel(user);
      const savedData = await data.save();
  
      const token = jwt.sign(
        {
          id: user._id,
          exp: Date.now() + +process.env.TOKEN_EXPIRE_TIME,
          iat: Date.now(),
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      res.status(200).json({ member: savedData, token });
      // Envoi du token dans l'en-tête de la réponse
      res.header("auth-token", token).json({ status: "ok" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, year } = req.body;

      if (!email || !password || !year)
        throw new Error(
          JSON.stringify({ message: "email or password or year is missing" })
        );

      const MemberModel = getMemberModel(year);
   
      const user = await MemberModel.findOne({ email: email });

      if (!user) throw new Error(JSON.stringify({ message: "user not found" }));

      if (user.email.toLowerCase() !== email.toLowerCase())
        throw new Error(
          JSON.stringify({ message: "email or password are incorrect" })
        );

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect)
        throw new Error(
          JSON.stringify({ message: "email or password are incorrect" })
        );

      // Génération du token d'authentification
      const token = jwt.sign(
        {
          id: user._id,
          exp: Date.now() + +process.env.TOKEN_EXPIRE_TIME,
          iat: Date.now(),
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      res.header("auth-token", token).json({ status: "ok" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  changePassword: async (req, res) => {
    try {
      const { email, oldPassword, newPassword, year } = req.body;

      if (!email) throw new Error("email is missing");

      if (!oldPassword) throw new Error("old password is missing");

      if (!newPassword) throw new Error("new password is missing");

      if (!year) throw new Error("year is missing");

      const MemberModel = getMemberModel(year);

      const user = await MemberModel.findOne({ email: email });

      if (!user) throw new Error(JSON.stringify({ message: "user not found" }));

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isPasswordCorrect)
        throw new Error(
          JSON.stringify({ message: "old password is incorrect" })
        );

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;

      await data.save();

      res.status(200).send({ status: "ok" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
//Cette fonction vérifie si le token de rafraîchissement
// est valide et retourne l'ID de l'utilisateur associé.
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);
      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      // Extraction du refreshToken de la requête
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      //client.DEL(userId, ...)  méthode de node-redis permettant de
      //supprimer une clé de Redis (ici, userId)
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createError.InternalServerError();
        }
        console.log(val);
        res.sendStatus(204);
      });
    } catch (error) {
      next(error);
    }
  },
  createUser :async (req, res) => {
    try {
      const userData = req.body;

      const MemberModel = getMemberModel(userData.year);

      const newUser = new MemberModel(userData);
      await newUser.save();
  
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },
  editUserData : async (req, res) => {
    try {
      const userId = req.params.user_id;
      const updatedUserData = req.body;

      const MemberModel = getMemberModel(updatedUser.year);

      const updatedUser = await MemberModel.findByIdAndUpdate(userId, updatedUserData, {
        new: true,
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User data updated successfully", user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getUserById : async (req, res) => {
    try {
      const userId = req.params.user_id;
      const userYear = req.params.user_year;  

      const MemberModel = getMemberModel(userYear);

      const user = await MemberModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  },

  deleteUser : async (req, res) => {
    try {
      const userId = req.params.user_id;
      const userYear = req.params.user_year;  
      
      const MemberModel = getMemberModel(userYear);
  
      const deletedUser = await MemberModel.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getUsersWithPagination: async (req, res) => {
    try {
      const { year } = req.params;
      const { page, pageSize } = req.query;

        // Validate page and pageSize parameters, set default values if not provided
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 10; // Default page size

      const skip = (pageNum - 1) * size;

      const MemberModel = getMemberModel(year);

      // Fetch users with pagination based on the provided year
      const users = await MemberModel.limit(size);

      res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  searchUsers : async (req, res) => {
    try {
        const { query, year } = req.query; // Get the search query and year from request parameters  = req.query; // Get the search query from request parameters

        const MemberModel = getMemberModel(year);

        // Perform the search based on the query criteria (e.g., name, email, team)
        const users = await MemberModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // Search by name (case-insensitive)
                { email: { $regex: query, $options: 'i' } }, // Search by email (case-insensitive)
                { team: { $regex: query, $options: 'i' } } 
            ]
        });

        res.status(200).json({ users }); // Return the found users
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
},
getUsersByYear : async (req, res) => {
  try {
      const { year } = req.params;

      const MemberModel = getMemberModel(year);

      // Retrieve users based on the provided year
      const users = await MemberModel;

      res.status(200).json({ users });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
},


};
