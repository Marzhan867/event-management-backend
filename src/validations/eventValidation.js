const Joi = require("joi");

exports.createEventSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string().valid("concert", "conference", "party", "workshop", "meetup", "event").required(),
  date: Joi.date().greater("now").required(),

  location: Joi.object({
    city: Joi.string().required(),
    address: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required()
  }).required(),

  price: Joi.number().min(0).required(),
  capacity: Joi.number().min(1).required()
});
