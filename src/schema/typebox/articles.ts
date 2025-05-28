import { t } from "elysia";
import { FormatRegistry } from "elysia/type-system";
import { IsDateTime } from "../format";

FormatRegistry.Set("date-time", (value) => IsDateTime(value));
const IsoDate = t
	.Transform(t.String({ format: "date-time" }))
	.Decode((value) => new Date(value))
	.Encode((value) => value.toISOString());

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
