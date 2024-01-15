import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity(
  {
    name: "questions"
  }
)
export class Question {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  question: string

  @Column()
  answer: string
}