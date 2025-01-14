import { Student } from "../models/student.model.js";
import { Company } from "../models/company.model.js";
import { University } from "../models/university.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import { generateRefreshTokenAndAccessToken } from "../utils/generateAccessAndRefreshTokens.js";
import ApiError from "../utils/ApiError.js";

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  //   console.log(username);
  // Validate input
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (email && !validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Determine user model and role
  let userType = null;
  let userModel = null;

  //   console.log(username.startsWith("s"))
  if (username?.startsWith("s" || "S")) {
    userModel = Student;
    userType = "student";
  } else if (username?.startsWith("c" || "C")) {
    userType = "company";
    userModel = Company;
  } else if (username?.startsWith("u" || "U")) {
    userModel = University;
    userType = "university";
  } else {
    throw new ApiError(400, "Invalid username prefix");
  }

  // Find user
  const user = await userModel
    .findOne({ $or: [{ username: username.toUpperCase() }, { email }] })
    .select("+password");
  if (!user) {
    throw new ApiError(404, `${userType} user does not exist`);
  }

  // Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  //   console.dir(userModel,{depth: null});
  // Generate tokens
  const { accessToken, refreshToken } = await generateRefreshTokenAndAccessToken(
    user._id,
    userType === "student" 
      ? Student 
      : userType === "company" 
      ? Company 
      : userType === "university"
      ? University 
      : null
  );
  

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Token generation failed");
  }

  // Save refresh token to the user
  user.refreshToken = refreshToken;
  await user.save();

  // Exclude sensitive fields before sending the response
  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  // Configure secure cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, //
  };

  // Send response
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      message: `${userType} logged in successfully`,
      user: loggedInUser,
      accessToken,
      refreshToken,
    });
});

export default loginUser;
