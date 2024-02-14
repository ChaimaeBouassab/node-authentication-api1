import { verify } from "jsonwebtoken";


function verifyToken(req, res, next) {
  const token = req.header("Authorization");// to extract the JWT token from the 'Authorization' header of the incoming HTTP request. 

  //Implementing middleware to protect routes that require authentication.&& to verify JWT tokens

  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export default verifyToken;
