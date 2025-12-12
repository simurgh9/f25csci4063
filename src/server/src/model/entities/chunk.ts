import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, Unique } from "typeorm";
import { Episode } from "./episode";

@Entity()
@Unique(["episode", "index"])
export class Chunk extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    index!: number;

    @ManyToOne(() => Episode, (episode) => episode.chunks, { onDelete: "CASCADE" })
    episode!: Episode;

    @Column()
    text!: string;

    // IMPORTANT: Store vector as number[] so TypeORM + pgvector work
    @Column("vector", { length: 1536 })
    embedding!: number[];
}
