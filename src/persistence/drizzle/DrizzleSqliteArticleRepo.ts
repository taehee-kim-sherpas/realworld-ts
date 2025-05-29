import { eq } from "drizzle-orm/sql/expressions";
import { sql } from "drizzle-orm";
import type { ArticleRepo } from "../types.ts";
import * as schema from "./sqliteSchema.ts";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core/db";
import { NotExistError } from "../../domain/errors.ts";

function createDrizzleSqliteArticleRepo(
  db: BaseSQLiteDatabase<"sync" | "async", void, typeof schema>
): ArticleRepo {
  const preparedAll = db.query.articles.findMany({}).prepare();

  const preparedGet = db.query.articles
    .findFirst({
      where: eq(schema.articles.slug, sql.placeholder("targetSlug")),
    })
    .prepare();

  return {
    async getBySlug(slug) {
      return preparedGet.get({ targetSlug: slug });
    },
    async list() {
      return preparedAll.all();
    },
    async saveBySlug(slug, update) {
      const old = await preparedGet.get({ targetSlug: slug });

      const updated = update(old);

      if (typeof updated === "string") {
        return updated;
      }

      if (old === undefined) {
        await db
          .insert(schema.articles)
          .values({
            title: updated.title,
            slug: updated.slug,
            description: updated.description,
            body: updated.body,
            //   author: updated.//   author,
            //   tagList: updated.//   tagList,
            //   favorited: updated.//   favorited,
            //   favoritesCount: updated.//   favoritesCount,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          })
          .execute();
      } else {
        await db
          .update(schema.articles)
          .set({
            title: updated.title,
            slug: updated.slug,
            description: updated.description,
            body: updated.body,
            //   author: updated.//   author,
            //   tagList: updated.//   tagList,
            //   favorited: updated.//   favorited,
            //   favoritesCount: updated.//   favoritesCount,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          })
          .where(eq(schema.articles.slug, old.slug))
          .execute();
      }

      return updated;
    },
    async deleteBySlug(slug) {
      const old = await preparedGet.get({ targetSlug: slug });
      if (old) {
        await db
          .delete(schema.articles)
          .where(eq(schema.articles.slug, slug))
          .execute();
          return;
      }

      throw new NotExistError(`Article for slug=${slug}`);
    },
  } satisfies ArticleRepo;
}

export default createDrizzleSqliteArticleRepo;
