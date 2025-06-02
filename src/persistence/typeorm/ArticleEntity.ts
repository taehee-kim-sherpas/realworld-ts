import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "articles" })
export class ArticleEntity {
	@PrimaryColumn("text")
	slug!: string;

	@Column("text")
	title!: string;

	@Column("text")
	description!: string;

	@Column("text")
	body!: string;

	@Column("integer")
	createdAt!: number; // store as unix timestamp

	@Column("integer")
	updatedAt!: number; // store as unix timestamp
}
