import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type UserRole = "User" | "GameMaster";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ type: "varchar", default: "User" })
  role!: UserRole;
}
