// diamond.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity(
  {
    name: 'diamonds'
  }
)
export class Diamond {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  diamond_image: string;

  @Column()
  diamond_category: string;

  @Column()
  diamond_quantity: number;

  @Column()
  diamond_price: number;
}
