import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type {
	FastifyBaseLogger,
	FastifyInstance,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
} from "fastify";
import type { AppContext } from "../context";
import {
	CreateCommentRequestBody,
	MultipleCommentsResponse,
	SingleCommentResponse,
} from "../../schema/typebox/comments.ts";
import { t } from "elysia";
import { AlreadyExistError } from "../../domain/errors.ts";
import { createComment } from "../../domain/articles/comments/Comment.ts";

type FastifyTypebox = FastifyInstance<
	RawServerDefault,
	RawRequestDefaultExpression<RawServerDefault>,
	RawReplyDefaultExpression<RawServerDefault>,
	FastifyBaseLogger,
	TypeBoxTypeProvider
>;
export function registerComments(ctx: AppContext) {
	return (fastify: FastifyTypebox, _options: unknown, done: () => void) => {
		fastify
			.get(
				"/",
				{
					schema: {
						params: t.Object({
							slug: t.String(),
						}),
						response: {
							200: MultipleCommentsResponse,
						},
					},
				},
				async (request) => {
					const comments = await ctx.repo.comment.listByArticleSlug(
						request.params.slug,
					);
					return { comments };
				},
			)
			.post(
				"/",
				{
					schema: {
						params: t.Object({
							slug: t.String(),
						}),
						body: CreateCommentRequestBody,
						response: {
							201: SingleCommentResponse,
							409: t.String(),
						},
					},
				},
				async (request, reply) => {
					const comment = createComment(request.body.comment, ctx);

					await ctx.repo.comment.saveBySlugAndId(
						request.params.slug,
						comment.id,
						(old) => {
							if (old) {
								throw new AlreadyExistError("");
							}

							return comment;
						},
					);

					return { comment };
				},
			)
			.delete(
				"/:id",
				{
					schema: {
						params: t.Object({
							slug: t.String(),
							id: t.String(),
						}),
						response: {
							204: t.String(),
							404: t.String(),
						},
					},
				},
				async (request, reply) => {
					const { slug, id } = request.params;

					await ctx.repo.comment.deleteBySlug(slug, id);

					return "";
				},
			);

		done();
	};
}
