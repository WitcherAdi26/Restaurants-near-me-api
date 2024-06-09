import jwt from "jsonwebtoken";

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({msg:'Access denied'});
    }

    try {
        const isVerified = jwt.verify(token.replace("Bearer","").trim(), process.env.SECRET_KEY);
        req.user = isVerified;
        next();
    } catch (error) {
        res.status(400).json({message:'Invalid token'});
    }
};

export default authenticateJWT;