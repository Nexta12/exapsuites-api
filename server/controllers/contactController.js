const { AdminMessageEmail, GuestGeneralEmail } = require("../../utils/emailCalls");
const { createNotification } = require("../../utils/NotifcationCalls");
const Contact = require("../models/Contact");

module.exports = {

    create: async (req, res) =>{
       try {

        const contactMesg = await Contact.create(req.body);
      // Send success response
      AdminMessageEmail(`A New Message, A new message from Exapsuites contact form: ${contactMesg.message} </br> sent By: ${contactMesg.fullName} `)
     
        res.status(201).json(contactMesg)
        
       } catch (error) {
        console.log(error);
        res.status(500).json("Internal Server Error");
       }

    },
  getAll: async (req, res) => {
    try {
     const contacts = await Contact.find({}).sort({
      createdAt: 'desc'});

      res.status(200).json(contacts );
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  getOne: async (req, res) => {
     const { id } = req.params
    try {
     const contact = await Contact.findById(id ).sort({createAt: 'desc'}).populate({path: 'repliedBy', select: 'firstName lastName role'});


     // update the isRead status
     await Contact.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true } // Return the updated document
    );

     res.status(200).json(contact );
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ID
      if (!id) {
        return res.status(400).json({ error: "Contact ID is required" });
      }
  
      // Update the Contact status
      const contact = await Contact.findByIdAndUpdate(
        id,
        { $set: { isRead: true } },
        { new: true } // Return the updated document
      );
  
      // Check if the Contact exists
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
  
      // Respond with the updated Contact
      res.status(200).json({ message: "Contact updated successfully", data: contact });
    } catch (error) {
      console.error("Error updating Contact:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  replyMessage: async (req, res) => {

    try {
      const { id } = req.params;
      const { reply, email, repliedBy } = req.body;
  
      // Validate ID
      if (!id) {
        return res.status(400).json("Contact ID is required");
      }
      if (!reply ) {
        return res.status(400).json("You cannot send an empty reply message");
      }
  
      // Update the Contact status
      await Contact.findByIdAndUpdate(
        id,
        { $set: { reply, repliedBy, replyDate: Date.now()} },
        { new: true } // Return the updated document
      );
  
      // Send Reply Email.
      
      await GuestGeneralEmail('Reply From Exapsuites', email, reply)
      // Respond with the updated Contact
      res.status(200).json('Reply Sent to user email');
    } catch (error) {
       console.log(error)
      res.status(500).json("Internal Server Error");
    }
  },
  
  delete: async (req, res) => {
    try {
      await Contact.findByIdAndDelete(req.params.id);

      res.status(200).json("Deleted");
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  },
};
