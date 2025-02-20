const { deleteFromCloudinary } = require("../middlewares/fileUploadManager");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { AdminMessageEmail } = require("../../utils/emailCalls");
const Booking = require('../models/Booking')

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
      
      const newUser = await User.create(req.body);

      // Send success response
      AdminMessageEmail(
        `A new admin user, ${req.body.firstName} ${req.body.lastName} with email: ${req.body.email} was created by ${req.user.firstName} ${req.user.lastName}, on Exapsuites website`
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
    const { q, role, bookingStatus } = req.query; // Extract filters from query params
  
    try {
      let filter = { email: { $ne: process.env.SUPER_EMAIL } };
  
      // Add role filtering
      if (role) {
        filter.role = role;
      }
  
      // Add bookings filtering if bookingStatus is provided
      if (bookingStatus) {
        filter.bookings = { $elemMatch: { status: bookingStatus } };
      }
  
      // If q is provided, attempt to parse and merge it into the filter
      if (q) {
        try {
          const queryObject = JSON.parse(q);
          filter = { ...filter, ...queryObject };
        } catch (error) {
          return res.status(400).json({ message: "Invalid query format" });
        }
      }
  
    
      // const users = await User.find(filter)
      // .lean()
      // .sort({ 
      //     role: 1,  
      //     createdAt: -1 // Then sort by creation date (newest first)
      // });

      const users = await User.find(filter).lean();

      // Define role priority
    const rolePriority = {
      Manager: 0, // Highest priority
      Admin: 1,   // Next priority
      Guest: 2,   // Lowest priority
    };
    const sortedUsers = users.sort((a, b) => {
      // Compare roles based on priority
      if (rolePriority[a.role] < rolePriority[b.role]) return -1;
      if (rolePriority[a.role] > rolePriority[b.role]) return 1;

      // If roles are the same, sort by createdAt (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
      

      res.status(200).json(sortedUsers);
     
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },


  getOne: async (req, res) => {
    try {
      // Step 1: Retrieve the user document
      const user = await User.findById(req.params.id).select('-password').exec();
  
      if (!user) {
        return res.status(404).json('User not found');
      }
  
      // Step 2: Sort the bookings array manually (e.g., by createdAt in descending order)
      user.bookings.sort((a, b) => b.createdAt - a.createdAt);
  
      // Step 3: Populate the bookingId field and its nested apartmentId field
      const populatedBookings = await Promise.all(
        user.bookings.map(async (booking) => {
          const populatedBooking = await Booking.findById(booking.bookingId)
            .populate('apartmentId') // Populate apartmentId inside bookingId
            .exec();
  
          return {
            ...booking.toObject(), // Convert Mongoose document to plain object
            bookingId: populatedBooking, // Replace bookingId with the populated booking
          };
        })
      );
  
      // Replace the original bookings array with the populated and sorted one
      user.bookings = populatedBookings;
  
      // Optionally, extract the latest booking
      const latestBooking = user.bookings.length > 0 ? user.bookings[0] : null;
  
      res.status(200).json({ user, latestBooking });
    } catch (error) {
      console.error(error);
      res.status(500).json( 'Internal Server Error');
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

      const { keepExistingImages } = req.body;

      if (keepExistingImages === 'true') {
       delete req.body.images; // Remove images from req.body if keepExistingImages is true
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
        "description",
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
  updateUserPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { existingPassword, newPassword } = req.body;
  
      // Validate the user ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user identifier" });
      }
  
      // Get the user from the database
      const userToUpdate = await User.findById(id);
  
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Authorization check
      if (
        req.user.id !== id &&
        !(req.user.role === "Admin" || req.user.role === "Super Admin")
      ) {
        return res.status(403).json({ error: "You are not authorized" });
      }
  
      // Verify the existing password
      const isPasswordValid = await bcrypt.compare(
        existingPassword,
        userToUpdate.password
      );
  
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Existing password is incorrect" });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password
      userToUpdate.password = hashedPassword;
      await userToUpdate.save(); // Save the updated user document
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error in updateUserPassword:", error);
      res.status(500).json({ error: "Internal Server Error" });
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
