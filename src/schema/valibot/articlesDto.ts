import * as v from "valibot";
import {
	CREATE_ARTICLE,
	TEST_ARTICLE,
	UPDATE_ANOTHER_ARTICLE,
} from "../../domain/fixtures";

const articleDto = v.pipe(
	v.object({
		title: v.string(),
		slug: v.string(),
		description: v.string(),
		body: v.string(),
		createdAt: v.pipe(v.string(), v.isoDateTime()),
		updatedAt: v.pipe(v.string(), v.isoDateTime()),
	}),
	v.description("게시물"),
	v.metadata({
		title: "Article",
		exmaples: [TEST_ARTICLE],
	}),
);

export const updateNewArticleDto = v.pipe(
	v.object({
		title: v.string(),
		description: v.string(),
		body: v.string(),
	}),
	v.description("게시물 생성 혹은 수정"),
	v.metadata({
		title: "UpdateNewArticle",
		exmaples: [CREATE_ARTICLE, UPDATE_ANOTHER_ARTICLE],
	}),
);

export const updateNewArticleRequestDto = v.pipe(
	v.object({
		article: updateNewArticleDto,
	}),
	v.description("게시물 생성 혹은 수정 요청"),
	v.metadata({
		title: "UpdateNewArticle",
		exmaples: [
			{
				articles: CREATE_ARTICLE,
			},
			{
				articles: UPDATE_ANOTHER_ARTICLE,
			},
		],
	}),
);

export const singleArticleResponseDto = v.pipe(
	v.object({
		article: articleDto,
	}),
	v.description("게시물 하나"),
	v.metadata({
		title: "SingleArticleResponse",
		exmaples: [
			{
				articles: TEST_ARTICLE,
			},
		],
	}),
);

export const multipleArticlesResponseDto = v.pipe(
	v.object({
		articles: v.array(articleDto),
	}),
	v.description("여러 게시물 목록"),
	v.metadata({
		title: "MultipleArticlesResponse",
		exmaples: [
			{
				articles: [TEST_ARTICLE],
			},
		],
	}),
);
