import { DataSource } from "typeorm"

require('dotenv').config({
    path: '../../.env'
})

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.PGHOST,
    // port: 5432,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    synchronize: true,
    logging: true,
    entities: [__dirname + "/entities/*.ts"],
    subscribers: [],
    migrations: [],
})