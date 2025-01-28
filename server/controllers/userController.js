const { deleteFromCloudinary } = require("../middlewares/fileUploadManager");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

module.exports = {
  createUser: async (req, res) => {
    try {

      if (!(req.user.role === "Admin" || req.user.role === "Super Admin")
      ) {
        return res.status(403).json({ error: "You are not authorized" }); 
      }

      if (req.body.images) {
        req.body.profilPic = req.body.images[0].url;
      }
      
      req.body.role = process.env.ADMINROLE
      // Create user
      const newUser = await User.create(req.body);

      // Send success response
      AdminMessageEmail(
        `A new admin user, ${req.body.firstName} ${req.body.lastName} with email: ${email} was created by ${req.user.firstName} ${req.user.lastName}, on Exapsuites website`
      );

      return res.status(201).json(newUser);
    } catch (error) {
      console.error(error); // Log the actual error for debugging
      res.status(500).json("Internal Server Error");
    }
  },

  createSuperAdmin: async (req, res) => {
    const superAdmin = {
      email: process.env.SUPER_EMAIL,
      firstName: process.env.FIRST_NAME,
      lastName: process.env.LAST_NAME,
      role: process.env.SUPERADMINROLE,
    };

    try {
      const superAdminExists = await User.findOne({
        email: superAdmin.email,
      });

      if (superAdminExists) {
        res.status(200).send("Work already in progress");
      } else {
        const bodyPassword = process.env.SUPER_PASSWORD;

        const hashedPassword = await bcrypt.hash(bodyPassword, 10);

        await User.create({
          password: hashedPassword,
          ...superAdmin,
        });
        res.status(200).send("Perfect Job just got done");
      }
    } catch (error) {
      console.log(error);
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({
        email: { $ne: process.env.SUPER_EMAIL },
      });

      res.status(200).send(users);
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  },
  getOne: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).send(user);
    } catch (error) {
      res.status(500).json("Internal Server Error");
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json("Invalid user identifier");
      }

      // get the user
      const userToUpdate = await User.findById(id);

      if (!userToUpdate) {
        return res.status(404).json("User not found");
      }

      if (
        req.user.id !== id &&
        !(req.user.role === "Admin" || req.user.role === "Super Admin")
      ) {
        return res.status(403).json({ error: "You are not authorized" }); // Use 403 for forbidden
      }

      const updateData = { ...req.body };

      // Hash the password if provided
      if (req.body.password && req.body.password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(req.body.password, salt);
      } else {
        // Remove the password field to prevent overwriting it with an empty value
        delete updateData.password;
      }

      if (req.body.images) {
        updateData.profilPic = req.body.images[0].url;
      }

      // Whitelist fields to update
      const allowedUpdates = [
        "firstName",
        "email",
        "lastName",
        "password",
        "role",
        "profilPic",
        "phone",
        "address",
      ];
      const updates = {};
      for (const key of allowedUpdates) {
        if (key in updateData) updates[key] = updateData[key];
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.status(200).send("Updated Successfully");
    } catch (error) {
      console.error(error); // Log the actual error for debugging
      res.status(500).json("Internal Server Error");
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json("Invalid user identifier");
      }

      // get the user
      const userToDelete = await User.findById(id);

      if (!userToDelete) {
        return res.status(404).json("User not found");
      }

      if (
        req.user.id !== id &&
        !(req.user.role === "Admin" || req.user.role === "Super Admin")
      ) {
        return res.status(403).json({ error: "You are not authorized" }); // Use 403 for forbidden
      }

      // Delete Profile Image froom Cloudinary.
      deleteFromCloudinary(userToDelete.profilPic);

      await User.findByIdAndDelete(id);

      res.status(200).send("Deleted Successfully");
    } catch (error) {
      console.error(error); // Log the actual error for debugging
      res.status(500).json("Internal Server Error");
    }
  },
};
