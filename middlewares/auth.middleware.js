import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const verifyJWT = (userModel, tokenType = "accessToken") =>
  asyncHandler(async (req, res, next) => {
    try {
      // Retrieve the token from the appropriate source based on the type

      const token = req.cookies?.[tokenType] || req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.json(
          new ApiResponse(400, null, "Token is missing or like the user is not in the session")
        );
      }

      // Determine the correct secret key to use based on the token type
      const secretKey =
        tokenType === "accessToken"
          ? process.env.ACCESS_TOKEN_SECRET
          : process.env.REFRESH_TOKEN_SECRET;
      // console.log(secretKey)

      // Verify the token and decode its payload
      const decodedToken = jwt.verify(token, secretKey);
      // console.log(decodedToken);

      // Find the user associated with the decoded token
      const user = await userModel
        .findById(decodedToken?._id || decodedToken?.id)
        .select("-password -refreshToken");

      if (!user) {
        throw new ApiError(401, "Invalid or expired token");
      }

      // Attach the user to the request object for downstream middleware or route handlers
      req.user = user;
      next();
    } catch (error) {
      next(new ApiError(401, error.message || "Invalid/Expired JWT token"));
    }
  });

export { verifyJWT };
