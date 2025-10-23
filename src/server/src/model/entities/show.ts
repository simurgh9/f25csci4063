import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, BaseEntity } from "typeorm"
import { Episode } from "./episode"
import { User } from "./User"

@Entity()
export class Show extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string

    @OneToMany(() => Episode, (episode) => episode.show, { cascade: true })
    episodes!: Episode[] 

    @ManyToMany(() => User)
    user!: User[]
}
