import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class Show extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string
}