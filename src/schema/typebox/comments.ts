import { t } from "elysia";
import { IsoDate } from "./isoDate";
import { StandardDecodeSchema, StandardEncodeSchema } from "./standard";

const Comment = t.Object({
	id: t.String(),
	body: t.String(),
	createdAt: IsoDate,
	updatedAt: IsoDate,
});

export const MultipleCommentsResponse = StandardEncodeSchema(
	t.Object({
		comments: t.Array(Comment),
	}),
);

export const SingleCommentResponse = StandardEncodeSchema(
	t.Object({
		comment: Comment,
	}),
);

export const CreateCommentRequestBody = StandardDecodeSchema(
	t.Object({
		comment: t.Pick(Comment, ["body"]),
	}),
);
