import * as dotenv from "dotenv"
dotenv.config()
const midtransClient = require("midtrans-client")
import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { Repository } from "typeorm"
import { User } from "../database/entities/User"
import { Transaction } from "../database/entities/Transaction"
import { AppDataSource } from "../data-source"

export default new class PaymentService {
  private readonly userRepository: Repository<User> = AppDataSource.getRepository(User)
  private readonly transactionRepository: Repository<Transaction> = AppDataSource.getRepository(Transaction)

  async payment(req: Request, res: Response): Promise<Response> {
    try {
      const snap = new midtransClient.Snap({
        isProduction: false,
        clientKey: process.env.EXPRESS_MIDTRANS_CLIENT_KEY,
        serverKey: process.env.EXPRESS_MIDTRANS_SERVER_KEY
      })

      const parameter = {
        transaction_details: {
          order_id: uuidv4(),
          gross_amount: req.body.diamond_price,
        },
        item_details: {
          name: "diamond",
          quantity: 1,
          price: req.body.diamond_price,
          quantities: req.body.diamond_quantity
        },
        customer_details: {
          first_name: req.body.name,
          email: req.body.email,
        }
      }
      console.log("ini parameter", parameter);


      const payment = await snap.createTransaction(parameter)

      await this.transactionRepository.save({
        order_id: parameter.transaction_details.order_id,
        transaction_status: "pending",
        gross_amount: parameter.transaction_details.gross_amount,
        diamond_quantity: parameter.item_details.quantities,
        email: parameter.customer_details.email
      })

      return res
        .status(200)
        .json({
          code: 200,
          message: "Success",
          payment_url: payment.redirect_url,
        })
    }
    catch (error) {
      return res.json({
        code: 500,
        message: "Internal Server Error",
        data: {
          error: error
        }
      })
    }
  }


  async webhook(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body
      // console.log(body);

      if (body.status_code == "200") {
        const transaction = await this.transactionRepository.findOneBy({
          order_id: body.order_id
        })
        if (!transaction) {
          return res.status(404).json({
            code: 404,
            message: "Not Found",
            error: "Transaction not found"
          })
        }
        
        console.log("ini transaction", transaction);
        transaction.transaction_status = body.transaction_status
        await this.transactionRepository.save(transaction)

        const user = await this.userRepository.findOneBy({
          email: transaction.email
        })
        if (!user) {
          return res.status(404).json({
            code: 404,
            message: "Not Found",
            error: "User not found"
          })
        }
        console.log("ini user", user);
        user.diamond = user.diamond + transaction.diamond_quantity
        await this.userRepository.save(user)
      }

      return res.status(200).json({
        code: 200,
        message: "Success",
        body: body
      })
    }
    catch (error) {
      return res.json({
        code: 500,
        message: "Internal Server Error [const snap]",
        data: {
          error: error
        }
      })
    }
  }


  async test(req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({
        code: 200,
        message: "Success",
        data: {
          message: "Test"
        }
      })
    }
    catch (error) {
      return res.json({
        code: 500,
        message: "Internal Server Error",
        data: {
          error: error
        }
      })
    }
  }
}