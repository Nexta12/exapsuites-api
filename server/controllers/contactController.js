const Contact = require("../models/Contact");

module.exports = {

    create: async (req, res) =>{
       try {

        const contactMesg = await Contact.create(req.body);

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
     const contact = await Contact.findById(id ).sort({createAt: 'desc'});


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
