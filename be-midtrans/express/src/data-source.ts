import "reflect-metadata";
import { DataSource } from "typeorm";
// import { User } from "./entities/User"
// import { Question } from "./entities/Question"
// import { Avatar } from "./entities/Avatar"
// import { Diamond } from "./entities/Diamond"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "ep-fragrant-bush-09941286.us-east-2.aws.neon.tech",
  port: 5432,
  username: "taufik-hdyt",
  password: "QNp8YA2bSzse",
  database: "db-mikirapp-express",
  synchronize: true,
  ssl: true,
  logging: false,
  entities: ["src/database/entities/*.ts"],
  migrations: ["src/database/miragtions/*.ts"],
  subscribers: [],
});
