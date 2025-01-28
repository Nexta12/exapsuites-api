const Apartment = require("../../models/Apartment");

const mongoose = require("mongoose");

module.exports = {
  ApartmentValidator: async (req, res, next) => {
    try {
      const { title, price } = req.body;

      if (!title || title === "") {
        return res.status(422).send("Please provide Apartment Title");
      }

      req.body.title = title.toLowerCase().trim();

      // Check if creating or editing an apartment since this middleware is used in both routes
      if (!(req.params.id || mongoose.Types.ObjectId.isValid(req.params.id))) {
        const titleExists = await Apartment.findOne({
          title: title.toLowerCase(),
        });

        if (titleExists) {
          return res.status(422).send("This Title already exists");
        }
      }

      if (!price || price === "") {
        return res.status(422).send("Please provide Apartment price ");
      }

      next();
    } catch (error) {
      res.status(422).send(error.message);
    }
  },
};
