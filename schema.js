const Joi = require("joi");
const review = require("./models/review");

const allowedCategories = [
  "Trending",
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Amazing Pools",
  "Campings",
  "Farms",
  "Arctic",
  "Domes",
  "Boats"
];

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
    about: Joi.string().max(2000).required(),
    category: Joi.string().required().valid(...allowedCategories) // category validation
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

// ✅ New Reservation Validator
module.exports.reservationSchema = Joi.object({
  checkin: Joi.date()
    .required()
    .messages({
      "any.required": "Please select a check-in date",
      "date.base": "Invalid check-in date",
    }),

  checkout: Joi.date()
    .greater(Joi.ref("checkin"))
    .required()
    .messages({
      "any.required": "Please select a checkout date",
      "date.base": "Invalid checkout date",
      "date.greater": "Checkout must be after check-in date",
    }),

  guests: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "Please select number of guests",
      "number.base": "Guests must be a number",
      "number.min": "At least one guest required",
    }),
});
