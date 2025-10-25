import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, BaseEntity } from "typeorm"
import { Episode } from "./episode"
import { User } from "./User"
import { SubscriptionInfo } from "./subscriptionInfo"

@Entity()
export class Show extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @OneToMany(() => Episode, (episode) => episode.show, { cascade: true })
    episodes!: Episode[];

    @OneToMany(() => SubscriptionInfo, (sub) => sub.show)
    subscriptions!: SubscriptionInfo[];

    @ManyToMany(() => User, (user) => user.shows)
    user!: User[];

}
