import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "comments" })
export class CommentEntity {
	@PrimaryColumn("text")
	id!: string;

	@Column("text")
	articleSlug!: string;

	@Column("text")
	body!: string;

	@Column("integer")
	createdAt!: number; // store as unix timestamp

	@Column("integer")
	updatedAt!: number; // store as unix timestamp
}
