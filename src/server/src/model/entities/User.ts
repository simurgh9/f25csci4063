import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, ManyToMany, JoinTable, PrimaryColumn } from "typeorm"
import { Post } from "./post";
import { Show } from "./show";
import { SubscriptionInfo } from "./subscriptionInfo";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    fireBaseId!: string;

    @Column({ unique: true})
    username!: string

    @OneToMany(() => Post, (post) => post.user, { cascade: true})
    posts!: Post[]

    @OneToMany(() => SubscriptionInfo, (sub) => sub.user)
    subscriptions!: SubscriptionInfo[]

    @ManyToMany(() => Show, (show) => show.user, { cascade: true})
    @JoinTable()
    shows!: Show[]
}   