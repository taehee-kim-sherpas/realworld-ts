import type { AppContext } from "../context";
import { ORPCError, os } from "@orpc/server";
import * as t from "@sinclair/typebox";
import {
	MultipleCommentsResponse,
	SingleCommentResponse,
} from "../../schema/typebox/comments";
import { StandardEncodeSchema } from "../../schema/typebox/standard";
import { createComment } from "../../domain/articles/comments/Comment";

export const createCommentsRoutes = (ctx: AppContext) => ({
	list: os
		.route({ method: "GET", path: "/api/articles/{slug}/comments" })
		.input(StandardEncodeSchema(t.Object({ slug: t.String() })))
		.output(MultipleCommentsResponse)
		.handler(async (c) => {
			const comments = await ctx.repo.comment.listByArticleSlug(c.input.slug);
			return { comments };
		}),
	create: os
		.route({ method: "POST", path: "/api/articles/{slug}/comments" })
		.input(
			StandardEncodeSchema(
				t.Object({
					slug: t.String(),
					comment: t.Object({ body: t.String() }),
				}),
			),
		)
		.output(SingleCommentResponse)
		.handler(async (c) => {
			const comment = createComment(c.input.comment, ctx);

			await ctx.repo.comment.saveBySlugAndId(
				c.input.slug,
				comment.id,
				(_old) => comment,
			);

			return { comment };
		}),
	delete: os
		.route({
			method: "DELETE",
			path: "/api/articles/{slug}/comments/:id",
		})
		.input(StandardEncodeSchema(t.Object({ slug: t.String(), id: t.String() })))
		.handler(async (c) => {
			await ctx.repo.comment.deleteBySlugAndId(c.input.slug, c.input.id);
			return new Response("", { status: 204 });
		}),
});
