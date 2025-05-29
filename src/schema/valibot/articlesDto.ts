import * as v from "valibot";
import {
	CREATE_ARTICLE,
	CREATE_COMMENT,
	TEST_ARTICLE,
	TEST_COMMENT,
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
		examples: [TEST_ARTICLE],
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
		examples: [CREATE_ARTICLE, UPDATE_ANOTHER_ARTICLE],
	}),
);

export const updateNewArticleRequestDto = v.pipe(
	v.object({
		article: updateNewArticleDto,
	}),
	v.description("게시물 생성 혹은 수정 요청"),
	v.metadata({
		title: "UpdateNewArticle",
		examples: [
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
		examples: [
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
		examples: [
			{
				articles: [TEST_ARTICLE],
			},
		],
	}),
);

const commentDto = v.pipe(
	v.object({
		id: v.string(),
		body: v.string(),
		createdAt: v.pipe(v.string(), v.isoDateTime()),
		updatedAt: v.pipe(v.string(), v.isoDateTime()),
	}),
	v.description("게시물"),
	v.metadata({
		title: "Comment",
		examples: [TEST_COMMENT],
	}),
);


export const multipleCommentsResponseDto = v.pipe(
	v.object({
		comments: v.array(commentDto),
	}),
	v.description("여러 댓글 목록"),
	v.metadata({
		title: "MultipleCommensResponse",
		examples: [
			{
				comments: [TEST_COMMENT],
			},
		],
	}),
);

export const singleCommentResponseDto = v.pipe(
	v.object({
		comment: commentDto,
	}),
	v.description("댓글 하나나"),
	v.metadata({
		title: "SingleCommentResponse",
		examples: [
			{
				comment: TEST_COMMENT,
			},
		],
	}),
);

export const newCommentRequestDto = v.pipe(
	v.object({
		comment: v.object({
		body: v.string(),
	}),
	}),
	v.description("댓글 작성 요청"),
	v.metadata({
		title: "NewComment",
		examples: [
			{
				comment: CREATE_COMMENT,
			},
		],
	}),
);