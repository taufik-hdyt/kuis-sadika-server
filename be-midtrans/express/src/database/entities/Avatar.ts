import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity(
  {
    name: 'avatars'
  }
)
export class Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  avatar_url: string;

  @Column()
  avatar_name: string;

  @Column()
  avatar_price: number;

  @ManyToOne(() => User, user => user.avatars)
  user: User;
}
