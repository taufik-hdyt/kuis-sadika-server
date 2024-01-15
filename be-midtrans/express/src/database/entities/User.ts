import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from "typeorm"
import { Avatar } from "./Avatar"

@Entity(
    {
        name: "users",
    }
)
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column({ nullable: true })
    fullname: string

    @Column()
    username: string

    @Column({ default: 0 })
    diamond: number

    @OneToMany(() => Avatar, avatar => avatar.user)
    avatars: Avatar[];
}
