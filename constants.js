export const DB_NAME = "Test";

export const options = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict", // Prevent CSRF
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};
