import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId) => {
  // Generate a JWT token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expiration time
  });

  // Set the token in a cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie. Avoid XSS attacks
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production. Use https in production
    sameSite: "strict", // Prevents CSRF attacks by ensuring the cookie is sent only in a first-party context
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time (7 days in milliseconds)
  });

  return token;
};

export default generateTokenAndSetCookie;
