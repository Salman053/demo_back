import asyncHandler from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { options } from "../constants.js";
import { generateRefreshTokenAndAccessToken } from "../utils/generateAccessAndRefreshTokens.js";
import ApiError from "../utils/ApiError.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ([email, username, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  const existingUser = await Student.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(400, "Username or email already exists");
  }
  const profilePic = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let profilePicRes;
  // let coverImageRes;

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Please upload an avatar");
  // }
  if (profilePic) {
    profilePicRes = await uploadOnCloudinary(profilePic);
    // if (coverImageLocalPath) {
    //   coverImageRes = await uploadOnCloudinary(coverImageLocalPath);
    // }
  }

  const user = await Student.create({
    email,
    username: username.toLowerCase(),
    password,
    avatar: profilePicRes?.secure_url.length || "",
    // coverImage: coverImageRes?.secure_url || "",
  });

  const createdUser = await Student.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong creating the user");
  }
  return res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  // console.log("Received login request:", email, username, password);

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await Student.findOne({
    $or: [{ username }, { email }],
  });

  // console.log("User found:", user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateRefreshTokenAndAccessToken(user._id, Student);

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Token generation failed");
  }

  user.refreshToken = refreshToken;
  await user.save();

  const loggedInUser = await Student.findById(user._id).select("-password -refreshToken");

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      success: true,
      message: "User logged in successfully",
      user: loggedInUser,
      accessToken,  // Make sure these are in the response body
      refreshToken,
    });
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "No user found in the session");
  }

  await Student.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  return res
    .status(200)
    .clearCookie("authToken", options)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current User"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  console.log(incomingRefreshToken);
  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }
  try {
    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await Student.findById(decodedRefreshToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired");
    }

    const { accessToken, newRefreshToken } = await generateRefreshTokenAndAccessToken(user._id);

    return res
      .status(200)
      .cookie("access_token", accessToken, options)
      .cookie("refresh_token", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "User access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   const user = await Student.findById(req.user?._id);
//   const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

//   if (!isPasswordCorrect) {
//     throw new ApiError(401, "Invalid old password");
//   }

//   user.password = newPassword;
//   await user.save({ validateBeforeSave: false });
//   return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
// });

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;
  const user = await Student.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, email, username: username.toLowerCase() },
    },
    { new: true }
  ).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload an avatar");
  }

  // Fetch the current user to get the previous avatar
  const currentUser = await Student.findById(req.user?._id).select("avatar");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Error uploading avatar to cloudinary");
  }
  if (avatar.url) {
    // Delete the previous avatar from Cloudinary
    if (currentUser.avatar) {
      const publicId = currentUser.avatar.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }
  }
  const user = await Student.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.secure_url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Please upload an cover image");
  }
  // Fetch the current user to get the previous cover image
  const currentUser = await Student.findById(req.user?._id).select("coverImage");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(500, "Error uploading cover image to cloudinary");
  }
  if (coverImage.url) {
    // Delete the previous avatar from Cloudinary
    if (currentUser.coverImage) {
      const publicId = currentUser.avatar.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }
  }
  const user = await Student.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: avatar.secure_url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
