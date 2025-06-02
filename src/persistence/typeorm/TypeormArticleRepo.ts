import type { DataSource, Repository } from "typeorm";
import { ArticleEntity } from "./ArticleEntity";
import type { Article } from "../../domain/articles/Article";
import type { ArticleRepo } from "../types";

export class TypeormArticleRepo implements ArticleRepo {
	private repo: Repository<ArticleEntity>;

	constructor(dataSource: DataSource) {
		this.repo = dataSource.getRepository(ArticleEntity);
	}

	async list(): Promise<Article[]> {
		const entities = await this.repo.find();
		return entities
			.map(this.toDomain)
			.filter((a): a is Article => a !== undefined);
	}

	async getBySlug(slug: string): Promise<Article | undefined> {
		const entity = await this.repo.findOneBy({ slug });
		return entity ? this.toDomain(entity) : undefined;
	}

	async saveBySlug(
		slug: string,
		update: (article: Article | undefined) => Article,
	): Promise<Article> {
		const entity = await this.repo.findOneBy({ slug });
		const article = update(this.toDomain(entity));
		if (entity) {
			await this.repo.update(slug, this.fromDomain(article));
		} else {
			await this.repo.insert(this.fromDomain(article));
		}

		return article;
	}

	async deleteBySlug(slug: string): Promise<void> {
		await this.repo.delete({ slug });
	}

	private toDomain(entity: ArticleEntity | null): Article | undefined {
		if (entity === null) return undefined;
		return {
			slug: entity.slug,
			title: entity.title,
			description: entity.description,
			body: entity.body,
			createdAt: new Date(entity.createdAt),
			updatedAt: new Date(entity.updatedAt),
		};
	}

	private fromDomain(article: Article): ArticleEntity {
		return {
			slug: article.slug,
			title: article.title,
			description: article.description,
			body: article.body,
			createdAt: article.createdAt.getTime(),
			updatedAt: article.updatedAt.getTime(),
		};
	}
}
