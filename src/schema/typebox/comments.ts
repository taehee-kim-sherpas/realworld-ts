import { t } from "elysia";
import { IsoDate } from "./isoDate";

const Comment = t.Object({
	id: t.String(),
	body: t.String(),
	createdAt: IsoDate,
	updatedAt: IsoDate,
});

export const MultipleCommentsResponse = t.Object({
	comments: t.Array(Comment),
});

export const SingleCommentResponse = t.Object({
	comment: Comment,
});

export const CreateCommentRequestBody = t.Object({
	comment: t.Pick(Comment, ["body"]),
});
