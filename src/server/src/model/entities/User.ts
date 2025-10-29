import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, ManyToMany, JoinTable } from "typeorm"
import { Post } from "./post";
import { Show } from "./show";
import { SubscriptionInfo } from "./subscriptionInfo";

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

    @OneToMany(() => SubscriptionInfo, (sub) => sub.user)
    subscriptions!: SubscriptionInfo[]

    @ManyToMany(() => Show, (show) => show.user, { cascade: true})
    @JoinTable()
    shows!: Show[]
}   