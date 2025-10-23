import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, ManyToMany, JoinTable } from "typeorm"
import { Post } from "./post";
import { Show } from "./show";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true})
    username!: string

    @Column()
    password!: string

    @OneToMany(() => Post, (post) => post.user, { cascade: true})
    posts!: Post[]

    @ManyToMany(() => Show)
    @JoinTable()
    shows!: Show[]
}   