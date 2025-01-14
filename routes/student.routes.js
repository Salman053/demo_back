import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Student } from "../models/student.model.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/test").get((req, res) => res.send("sdas"));

router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyJWT(Student), logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
// router.route("/change-password").post(verifyJWT(Student), changeCurrentPassword);
router.route("/current-user").get(verifyJWT(Student), getCurrentUser);
router.route("/update-account").patch(verifyJWT, getCurrentUser);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
