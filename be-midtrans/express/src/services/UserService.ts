import { Repository } from "typeorm"
import { User } from "../database/entities/User"
import { AppDataSource } from "../data-source"
import { Request, Response } from "express"
import { uploadToCloudinary } from "../utils/Cloudinary"
import { deleteFile } from "../utils/FileHelper"
import { CreateUserSchema } from "../utils/validator/UserValidator"


export default new class UserService {
  private readonly userRepository: Repository<User> = AppDataSource.getRepository(User)

  async get(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userRepository.find()
      return res
        .status(200)
        .json({
          code: 200,
          message: "Success find all users",
          users: users
        })
    }
    catch (error) {
      return res
        .status(500)
        .json({
          code: 500,
          message: "Internal Server Error",
          error: error
        })
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const user = await this.userRepository.findOneBy({
        id: Number(id)
      })

      return res
        .status(200)
        .json({
          code: 200,
          message: "Success find user by id",
          user: user
        })
    }
    catch (error) {
      return res
        .status(500)
        .json({
          code: 500,
          message: "Internal Server Error",
          error: error
        })
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body

      const { error } = CreateUserSchema.validate(data)

      if (error) {
        return res
          .status(400)
          .json({
            code: 400,
            message: "Bad Request",
            error: error
          })
      }

      const user = this.userRepository.create({
        email: data.email,
        fullname: data.fullname,
        username: data.username,
        diamond: data.diamond
      })

      const userCreated = await this.userRepository.save(user)

      return res
        .status(200)
        .json({
          code: 200,
          message: "Success create user",
          user: userCreated
        })
    }
    catch (error) {
      return res
        .status(500)
        .json({
          code: 500,
          message: "Internal Server Error",
          error: error
        })
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id
      const data = req.body

      const user = await this.userRepository.findOneBy({
        id: Number(id)
      })

      if (!user) {
        return res
          .status(404)
          .json({
            code: 404,
            message: "Not Found",
            error: "User not found"
          })
      }

      const { error } = CreateUserSchema.validate(data)
      if (error) {
        return res
          .status(400)
          .json({
            code: 400,
            message: "Bad Request",
            error: error
          })
      }

      if (req.body.email) user.email = data.email
      if (req.body.fullname) user.fullname = data.fullname
      if (req.body.username) user.username = data.username
      if (req.body.diamond) user.diamond = data.diamond
      // if (req.file?.filename) user.avatars = await uploadToCloudinary(req.file.filename)
      // deleteFile(req.file?.filename)

      const userUpdated = await this.userRepository.save(user)

      return res
        .status(200)
        .json({
          code: 200,
          message: "Success update user",
          user: userUpdated
        })
    }
    catch (error) {
      return res
        .status(500)
        .json({
          code: 500,
          message: "Internal Server Error",
          error: error
        })
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params)

      const user = await this.userRepository.findOneBy({
        id: id
      })

      if (!user) {
        return res
          .status(404)
          .json({
            code: 404,
            message: "Not Found",
            error: "User not found"
          })
      }

      const userDeleted = await this.userRepository.remove(user)

      return res
        .status(200)
        .json({
          code: 200,
          message: "Success delete user",
          user: userDeleted
        })
    }
    catch (error) {
      return res
        .status(500)
        .json({
          code: 500,
          message: "Internal Server Error",
          error: error
        })
    }
  }

  async addDiamond(req: Request, res: Response): Promise<Response> {
    try{
      const id = req.params.id
      const data = req.body

      const user = await this.userRepository.findOneBy({
        id: Number(id),
      })

      if(!user){
        return res
          .status(404)
          .json({
            code: 404,
            message: "Not Found",
            error: "User not found"
          })
      }

      user.diamond += data.diamond_quantity
      
      const userAddDiamond = await this.userRepository.save(user)

      return res
        .status(200)
        .json({
          code: 200,
          message: "Success add diamond",
          user: userAddDiamond
        })
    }
    catch(error){
      console.log(error)
      throw error
    }
  }
}