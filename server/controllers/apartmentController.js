const { deleteFromCloudinary } = require("../middlewares/fileUploadManager");
const Apartment = require("../models/Apartment");

module.exports = {
  createApartment: async (req, res) => {
    try {
  
      const newApartment = await Apartment.create(req.body);
   
      res.status(201).json(newApartment);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },
  getAllApartments: async (req, res) => {
    try {
      const apartments = await Apartment.find({});

      res.status(200).json(apartments);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },
  getOneApartment: async (req, res) => {
    try {
      const apartment = await Apartment.findById(req.params.id);

      res.status(200).json(apartment);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },

  updateApartment: async (req, res) => {
    const { id } = req.params;

    try {
       const { keepExistingImages } = req.body;

       if (keepExistingImages === 'true') {
        delete req.body.images; // Remove images from req.body if keepExistingImages is true
      }

      await Apartment.findByIdAndUpdate(id, { $set: req.body }, { new: true });

      res.status(201).json("updated");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },
  deleteApartment: async (req, res) => {
    const { id } = req.params;

    try {
     const apartmentToDelete = await Apartment.findByIdAndDelete(id);
     deleteFromCloudinary(apartmentToDelete.images);

      res.status(201).json("Deleted");
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  },
};
