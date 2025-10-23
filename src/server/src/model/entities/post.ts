import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, ManyToMany, ManyToOne } from "typeorm"
import { Show } from "./show"
import { User } from "./User"

@Entity() 
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Show)
    show!: Show

    @Column()
    content!: string

    @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE"})
    user!: User
}