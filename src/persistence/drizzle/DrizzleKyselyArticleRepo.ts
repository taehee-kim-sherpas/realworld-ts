import type { ArticleRepo } from "../types";
import type * as schema from "./kyselySchema";
import { NotExistError } from "../../domain/errors";
import type { Kysely } from "kysely";
import type { Article } from "../../domain/articles/Article";

function toDomainModel(db: schema.Article | undefined): Article | undefined {
	if (!db) return undefined;
	return {
		...db,
		createdAt: new Date(db.createdAt as unknown as number),
		updatedAt: new Date(db.updatedAt as unknown as number),
	};
}

function toDbModel(article: Article): schema.NewArticle {
	if (!article) return article;
	return {
		...article,
		createdAt:
			article.createdAt instanceof Date
				? article.createdAt.getTime()
				: article.createdAt,
		updatedAt:
			article.updatedAt instanceof Date
				? article.updatedAt.getTime()
				: article.updatedAt,
	};
}

function createKyselyArticleRepo(db: Kysely<schema.Database>): ArticleRepo {
	return {
		async getBySlug(slug) {
			const dbArticle = await db
				.selectFrom("articles")
				.selectAll()
				.where("slug", "=", slug)
				.executeTakeFirst();
			return toDomainModel(dbArticle);
		},
		async list() {
			const dbArticles = await db.selectFrom("articles").selectAll().execute();
			return dbArticles.map(toDomainModel) as Article[];
		},
		async saveBySlug(slug, update) {
			const dbArticle = await db
				.selectFrom("articles")
				.selectAll()
				.where("slug", "=", slug)
				.executeTakeFirst();

			const domainArticle = toDomainModel(dbArticle);

			const updated = update(domainArticle);

			const dbModel = toDbModel(updated);
			if (!dbArticle) {
				await db
					.insertInto("articles")
					.values(dbModel as schema.NewArticle)
					.execute();
			} else {
				await db
					.updateTable("articles")
					.set(dbModel as schema.ArticleUpdate)
					.where("slug", "=", slug)
					.execute();
			}
			return updated;
		},
		async deleteBySlug(slug) {
			const dbArticle = await db
				.selectFrom("articles")
				.selectAll()
				.where("slug", "=", slug)
				.executeTakeFirst();
			if (dbArticle) {
				await db.deleteFrom("articles").where("slug", "=", slug).execute();
				return;
			}
			throw new NotExistError(`Article for slug=${slug}`);
		},
	};
}

export default createKyselyArticleRepo;
