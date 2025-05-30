import * as v from "valibot";
import { CREATE_COMMENT, TEST_COMMENT } from "../../domain/fixtures";

const commentDto = v.pipe(
	v.object({
		id: v.string(),
		body: v.string(),
		createdAt: v.pipe(v.string(), v.isoTimestamp()),
		updatedAt: v.pipe(v.string(), v.isoTimestamp()),
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
