import { t } from "elysia";
import { IsoDate } from "./isoDate";
import { StandardDecodeSchema, StandardEncodeSchema } from "./standard";

export const Article = t.Object({
	title: t.String(),
	slug: t.String(),
	description: t.String(),
	body: t.String(),
	createdAt: IsoDate,
	updatedAt: IsoDate,
});

export const SingleArticleResponse = StandardEncodeSchema(
	t.Object({
		article: Article,
	}),
);

export const CreateUpdateArticleRequestBody = StandardDecodeSchema(
	t.Object({
		article: t.Pick(Article, ["title", "description", "body"]),
	}),
);

export const MultipleArticlesResponse = StandardEncodeSchema(
	t.Object({
		articles: t.Array(Article),
	}),
);
