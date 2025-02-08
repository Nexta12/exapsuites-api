const { validateEmail, getSnippet } = require("../../../utils/helpers");
module.exports = {
  ValidateCntactForm: async (req, res, next) => {
    try {

      const {  email, fullName, message  } = req.body;

      if(!fullName || fullName === ""){
        return res.status(422).send("Your Name is required");
      }
  
      if (!email || email.trim() === "") {
        return res.status(422).send("Please provide your email");
      }

      if (!validateEmail(email)) {
        return res.status(422).send("Email is Invalid");
      }

    
      if(!message|| message === ""){
        return res.status(422).send("Message cannot be empty");
      }

      next();
    } catch (error) {
      res.status(422).send(error.message);
    }
  }

};
