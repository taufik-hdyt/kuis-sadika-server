import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity(
  {
    name: "transactions"
  }
)
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column(
    {
      nullable: true
    }
  )
  order_id: string

  @Column(
    {
      nullable: true
    }
  )
  transaction_status: string

  @Column()
  gross_amount: number

  @Column()
  diamond_quantity: number

  @Column()
  email: string
}