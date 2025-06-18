import { t } from "elysia";
import { IsoDate } from "./isoDate";
import { StandardSchema } from "./standard";

const Comment = t.Object({
  id: t.String(),
  body: t.String(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});

export const MultipleCommentsResponse = StandardSchema(
  t.Object({
    comments: t.Array(Comment),
  })
);

export const SingleCommentResponse = StandardSchema(
  t.Object({
    comment: Comment,
  })
);

export const CreateCommentRequestBody = StandardSchema(
  t.Object({
    comment: t.Pick(Comment, ["body"]),
  })
);
