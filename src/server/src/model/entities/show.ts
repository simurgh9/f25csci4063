import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from "typeorm"
import { Episode } from "./episode"

@Entity()
export class Show extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string

    @OneToMany(() => Episode, (episode) => episode.show, { cascade: true })
    episodes!: Episode[] 
}
