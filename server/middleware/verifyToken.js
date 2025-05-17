import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    // console.log("Unauthorized - no token provided");
    req.authCheck = false; // Set authCheck to false if no token is provided
    req.userId = null; // Set userId to null if no token is provided
    req.user = null; // Set user to null if no token is provided
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log("Unauthorized - invalid token");
      req.authCheck = false; // Set authCheck to false if no token is provided
      req.userId = null; // Set userId to null if no token is provided
      req.user = null; // Set user to null if no token is provided
      return next();
    }

    req.authCheck = true; // Token is valid
    req.userId = decoded.userId; // Attach the user ID to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log("Error in verifyToken ", error);
    req.authCheck = false; // Attach authCheck to the request
    req.userId = null; // No user ID since an error occurred
    req.user = null; // Set user to null if an error occurred
    next(); // Allow the request to proceed
  }
};
