import { describeRoute } from "hono-openapi";
import { type BaseIssue, type BaseSchema, getDescription } from "valibot";
import { resolver } from "hono-openapi/valibot";

export const jsonBody = <
	SchemaT extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
	schema: SchemaT,
) => ({
	content: {
		"application/json": {
			schema: resolver(schema),
		},
	},
	description: getDescription(schema) ?? "",
});

export const simpleRoute = <
	SchemaT extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>({
	res: resSchema,
}: { res: SchemaT }) =>
	describeRoute({
		responses: {
			200: jsonBody(resSchema),
		},
	});
