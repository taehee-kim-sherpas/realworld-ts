import { t } from "elysia";
import { IsoDate } from "./isoDate";

const Article = t.Object({
	title: t.String(),
	slug: t.String(),
	description: t.String(),
	body: t.String(),
	createdAt: IsoDate,
	updatedAt: IsoDate,
});

export const SingleArticleResponse = t.Object({
	article: Article,
});

export const CreateUpdateArticleRequestBody = t.Object({
	article: t.Pick(Article, ["title", "description", "body"]),
});

export const MultipleArticlesResponse = t.Object({
	articles: t.Array(Article),
});
