import { t } from "elysia";
import { IsoDate } from "./isoDate";
import { StandardSchema } from "./standard";

const Article = t.Object({
  title: t.String(),
  slug: t.String(),
  description: t.String(),
  body: t.String(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});

export const SingleArticleResponse = StandardSchema(
  t.Object({
    article: Article,
  })
);

export const CreateUpdateArticleRequestBody = StandardSchema(
  t.Object({
    article: t.Pick(Article, ["title", "description", "body"]),
  })
);

export const MultipleArticlesResponse = StandardSchema(
  t.Object({
    articles: t.Array(Article),
  })
);
