// generating the refresh token fro the admin user

import ApiError from "./ApiError.js";

export const generateRefreshTokenAndAccessToken = async (userId, userModel) => {
  console.log(userModel,userId,"assd")
  try {
    const user = await userModel.findById(userId);
    console.log(user);

    if (!user) {
      throw new ApiError(401, `${userModel.name} Not Found`);
    }

    // console.log(user.generateAccessToken())

    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();

    /// now push the new  refresh token to the admin user

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      401,
      `Access token and refresh token generation failed for : ${userModel}`,
      error
    );
  }
};

