import type { DataSource, Repository } from "typeorm";
import { CommentEntity } from "./CommentEntity";
import type { Comment } from "../../domain/articles/comments/Comment";
import type { CommentRepo } from "../types";

export class TypeormCommentRepo implements CommentRepo {
	private repo: Repository<CommentEntity>;

	constructor(dataSource: DataSource) {
		this.repo = dataSource.getRepository(CommentEntity);
	}

	async listByArticleSlug(articleSlug: string): Promise<Comment[]> {
		const entities = await this.repo.findBy({ articleSlug });
		return entities
			.map(this.toDomain)
			.filter((c): c is Comment => c !== undefined);
	}

	async saveBySlugAndId(
		slug: string,
		id: string,
		update: (comment: Comment | undefined) => Comment,
	): Promise<Comment> {
		const entity = await this.repo.findOneBy({ id });
		const comment = update(this.toDomain(entity));

		if (entity) {
			await this.repo.update(
				id,
				this.fromDomain({ ...comment, articleSlug: slug }),
			);
		} else {
			await this.repo.insert(
				this.fromDomain({ ...comment, articleSlug: slug }),
			);
		}
		return comment;
	}

	async deleteBySlugAndId(slug: string, id: string): Promise<undefined> {
		await this.repo.delete({ id, articleSlug: slug });
	}

	private toDomain(entity: CommentEntity | null): Comment | undefined {
		if (entity === null) return undefined;
		return {
			id: entity.id,
			body: entity.body,
			createdAt: new Date(entity.createdAt),
			updatedAt: new Date(entity.updatedAt),
		};
	}

	private fromDomain(
		comment: Comment & { articleSlug: string },
	): CommentEntity {
		return {
			id: comment.id,
			articleSlug: comment.articleSlug,
			body: comment.body,
			createdAt: comment.createdAt.getTime(),
			updatedAt: comment.updatedAt.getTime(),
		};
	}
}
