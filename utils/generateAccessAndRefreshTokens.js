// generating the refresh token fro the admin user

export const generateRefreshTokenAndAccessToken = async (userId, userModel) => {
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      throw new ApiError(401, `${userModel.name} Not Found`);
    }

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
      "Access token and refresh token generation failed for :",
      userModel.name
    );
  }
};

