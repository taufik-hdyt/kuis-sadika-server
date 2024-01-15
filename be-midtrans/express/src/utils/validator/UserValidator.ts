import * as joi from "joi"

export const CreateUserSchema = joi.object({
  email: joi.string(),
  fullname: joi.string(),
  username: joi.string(),
  diamond: joi.number(),
  // avatars: joi.string(),


})

export const UpdateUserSchema = joi.object({
  email: joi.string(),
  fullname: joi.string(),
  username: joi.string(),
  diamond: joi.number(),
  // avatars: joi.string(),
})