import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, Index } from "typeorm"
import { Post } from "./post"
import { Chunk } from "./chunk"

@Entity()
@Index(["post"]) // Index on post for quick lookups
@Index(["post", "similarity"]) // Index for ordering by similarity
export class PostChunk extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => Post, { onDelete: "CASCADE" })
    @Index()
    post!: Post

    @ManyToOne(() => Chunk, { onDelete: "CASCADE" })
    chunk!: Chunk

    @Column("float")
    similarity!: number // Cosine similarity score (0-1)
}
