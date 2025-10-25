import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn } from "typeorm"
import { Show } from "./show"
import { User } from "./User"

@Entity() 
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    content!: string
    
    @CreateDateColumn()
    createdAt!: Date; 

    @ManyToOne(() => Show)
    show!: Show

    @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE"})
    user!: User
}