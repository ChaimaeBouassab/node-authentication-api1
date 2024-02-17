import httpErrors from "http-errors";
const { BadRequest, InternalServerError } = httpErrors;
import bcrypt from "bcrypt";
const { genSalt, hash, compare } = bcrypt;
import jwt from "jsonwebtoken";
const { sign } = jwt;
import { signAccessToken, signRefreshToken } from "../Helpers/JWTHelpers.js";

const register = async (req, res) => {
  try {
    const { name, email, password, level, github, linkedin, team } = req.body;

    // Validate user input
    if (
      !name ||
      !email ||
      !password ||
      !level ||
      !github ||
      !linkedin ||
      !team
    ) {
      return res.status(400).send("All fields are required");
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email format");
    }

    const user = new MemberModel({
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
    if (isEmailUsed) res.status(204).json({ message: "Email is already used" });

    const salt = await genSalt();
    user.password = await hash(user.password, salt);

    const data = new MemberModel(user);
    const savedData = await data.save();

    const token = sign(
      {
        id: user._id,
        exp: Date.now() + +process.env.TOKEN_EXPIRE_TIME,
        iat: Date.now(),
      },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).json({ member: savedData, token });
    // Sending the token in the response header
    res.header("auth-token", token).json({ status: "ok" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email or password is missing" });
    }

    const user = await MemberModel.findOne({ email: email });

    if (!user) return res.status(204).json({ message: "user not found" });

    if (user.email.toLowerCase() !== email.toLowerCase())
      return res
        .status(400)
        .json({ message: "email or password are incorrect " });

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect)
      res.status(204).json({ message: "email or password are incorrect" });

    // "Generation of the authentication token"

    const token = sign(
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
};

const changePassword = async (req, re) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email) return res.status(400).send("email  or password is missing");

    if (!oldPassword)
      return res
        .status(400)
        .json({ message: "old password  or email is missing" });

    if (!newPassword)
      return res.status(400).json({ message: "newpassword is missing" });

    const user = await MemberModel.findOne({ email: email });

    if (!user) res.status(400).json({ message: "user not found" });

    const isPasswordCorrect = await compare(oldPassword, user.password);

    if (!isPasswordCorrect)
      res.status(201).json({ message: "old password or email is incorrect" });

    const salt = await genSalt();
    const hashedPassword = await hash(newPassword, salt);
    user.password = hashedPassword;

    const data = new MemberModel(user);
    await data.save();

    res.status(200).send({ status: "ok" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// It handles the refresh token logic to generate new access and refresh tokens.
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};
// This function handles the logout process for a user.
// It requires a valid refresh token to log the user out.
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    // Check if the refresh token is provided.

    if (!refreshToken) throw BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    client.DEL(userId, (err, val) => {
      if (err) {
        console.log(err.message);
        throw InternalServerError(); // Throw an internal server error if the deletion fails.
      }
      console.log(val);
      res.sendStatus(204); // Send a 204 (No Content) response indicating successful logout.
    });
  } catch (error) {
    next(error);
  }
};
// This function creates a new user based on the data provided in the request body.
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    // Create a new instance of the MemberModel with the provided user data.
    const newUser = new MemberModel(userData);
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const editUserData = async (req, res) => {
  try {
    // Extract the user ID from the request parameters.
    const userId = req.params.user_id;
    const updatedUserData = req.body;

    const updatedUser = await MemberModel.findByIdAndUpdate(
      userId,
      updatedUserData,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User data updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// This function retrieves a user by their ID.

const getUserById = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const userYear = req.params.user_year;

    const user = await MemberModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.user_id;

    // Delete the user by ID
    const deletedUser = await MemberModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUsersWithPagination = async (req, res) => {
  try {
    const { year } = req.params;
    const { page, pageSize } = req.query;

    // Validate page and pageSize parameters, set default values if not provided
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10; // Default page size

    const skip = (pageNum - 1) * size;

    // Fetch users with pagination based on the provided year
    const users = await MemberModel.limit(size);

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query and year from request parameters  = req.query; // Get the search query from request parameters

    // Perform the search based on the query criteria (e.g., name, email, team)
    const users = await MemberModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Search by name (case-insensitive)
        { email: { $regex: query, $options: "i" } }, // Search by email (case-insensitive)
        { team: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json({ users }); // Return the found users
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUsersByYear = async (req, res) => {
  try {
    const { year } = req.params;

    const MemberModel = getMemberModel(year);

    // Retrieve users based on the provided year
    const users = await MemberModel.find();

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  register,
  login,
  refreshToken,
  changePassword,
  logout,
  createUser,
  getUserById,
  editUserData,
  deleteUser,
  searchUsers,
  getUsersByYear,
  getUsersWithPagination,
};
