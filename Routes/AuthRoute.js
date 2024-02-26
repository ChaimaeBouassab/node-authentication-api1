import express from "express";
import { register, login, refreshToken, changePassword, logout, createUser, getUserByToken, editUserData, deleteUser, searchUsers, getUsersByYear, getUsersWithPagination } from "../Controllers/AuthController.js";
const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/changepassword", changePassword);
router.delete("/logout", logout);

// Create a new user
router.post("/api/v1/users", createUser);

// Get a user by token
router.get("/api/v1/users", getUserByToken);

// Edit User Data
router.patch("/api/v1/users", editUserData);

router.delete("/api/v1/users", deleteUser);


router.get("/api/v1/users/search", searchUsers);

router.get("/api/v1/users/getByYear/:year", getUsersByYear);

// Get Users with Pagination
router.get("/api/v1/users/:year", getUsersWithPagination);

export default router;
