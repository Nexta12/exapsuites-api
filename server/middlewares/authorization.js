const jwt = require("jsonwebtoken");

module.exports = {
  // User Must be Logged In
  authenticateUser: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.status(403).json("You are not Logged In" );
    }
  },

  MustBeGuest: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      return res.status(403).json("You are not Logged In" );
    }
  },


  mustBeSuperAdmin: (req, res, next) => {
    if (req.user.role === "Super Admin") {
      next();
    } else {
      return res
        .status(401)
        .json("You don't have sufficient access to perform the task");
    }
  },
  mustBeSuperAdminOrAdmin: (req, res, next) => {
    if (req.user.role === "Super Admin" || req.user.role === "Admin" ) {
      next();
    } else {
      return res
        .status(401)
        .json("You don't have sufficient access to perform the task");
    }
   
  },

  generateAccessToken: (user, jwt) => {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.ACCESS_TOKEN_SECRETE,
      { expiresIn: "3h" },
    );
  },

 
  checkJwt: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .send({ message: "Authorization header not provided" });

    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE); // Ensure this matches your token secret
      req.jwtPayload = payload; // Add user info from the token
      next(); // Proceed if token is valid
    } catch (err) {
      return res.status(401).send({ message: "Unauthorized: Invalid token" });
    }
  },

  // Maintain case consistency
  emailToLowerCase: (req, res, next) => {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    next();
  },
};
