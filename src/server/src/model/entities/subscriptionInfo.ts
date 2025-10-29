import { Entity, PrimaryGeneratedColumn, ManyToOne, BaseEntity, UpdateDateColumn } from "typeorm"
import { Episode } from "./episode";
import { Show } from "./show"; 
import { User } from "./User";

@Entity()
export class SubscriptionInfo extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => Episode, { nullable: true })
    currentEpisode?: Episode | null; 

    @ManyToOne(() => Show, (show) => show.subscriptions, { cascade: true})
    show!: Show;

    @ManyToOne(() => User, (user) => user.subscriptions, { cascade: true})
    user!: User;
}