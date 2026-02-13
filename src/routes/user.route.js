import express from "express";
import { registerUser ,loginUser, logOut,refreshAccessToken, changePassword, getCurrentUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JWT_verify } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

router.route("/login").post(loginUser)

router.route("/logout").post(JWT_verify,logOut)

router.route("/refreshToken").post(refreshAccessToken)

router.route("/changepassword").post(JWT_verify,changePassword)

router.route("/getuser").get(JWT_verify,getCurrentUser)

export default router;

