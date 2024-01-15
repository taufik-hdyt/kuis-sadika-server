export default new class DiamondService {
  // private readonly repository: Repository<Payment> = AppDataSource.getRepository(Payment)

  async resWebhook(dataPayment: any): Promise<void> {
    try {
      const order_id = dataPayment.order_id
      const transaction_status = dataPayment.transaction_status
      const gross_amount = dataPayment.gross_amount
      const payment_type = dataPayment.payment_type

      console.log(
        `
        order_id: ${order_id} 
        transaction_status: ${transaction_status} 
        gross_amount: ${gross_amount} 
        payment_type: ${payment_type}
        `
      )
    } catch (error) {
      console.log("Error in addDiamond: ", error);
    }
  }
}