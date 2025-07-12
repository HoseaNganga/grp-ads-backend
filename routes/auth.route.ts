import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUserById,
  verifyUserByCode,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUserById);
router.post("/verify-code", verifyUserByCode);

export default router;
