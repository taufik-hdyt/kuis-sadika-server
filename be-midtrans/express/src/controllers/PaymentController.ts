import PaymentService from '../services/PaymentService';
import { Request, Response } from 'express';

export default new (class PaymentController {
  payment(req: Request, res: Response) {
    PaymentService.payment(req, res);
  }

  webhook(req: Request, res: Response) {
    PaymentService.webhook(req, res);
  }

  test(req: Request, res: Response) {
    PaymentService.test(req, res);
  }
})