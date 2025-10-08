import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, Unique, OneToMany } from "typeorm"
import { Show } from "./show"
import { Chunk } from "./chunk"

@Entity()
@Unique(['show', 'season', 'episode'])
export class Episode extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Show, show => show.episodes, { onDelete: "CASCADE"})
    show!: Show

    @OneToMany(() => Chunk, chunk => chunk.episode, { cascade: true })
    chunks!: Chunk[]

    @Column()
    season!: number

    @Column()
    episode!: number

    @Column()
    title!: string
}