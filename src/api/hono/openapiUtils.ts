import { describeRoute } from "hono-openapi";
import { type BaseIssue, type BaseSchema, getDescription } from "valibot";
import { resolver } from "hono-openapi/valibot";

export const simpleRoute = <
	SchemaT extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>({
	res: resSchema,
}: {
	res: SchemaT;
}) => {
	return describeRoute({
		responses: {
			200: {
				content: {
					"application/json": {
						schema: resolver(resSchema),
					},
				},
				description: getDescription(resSchema) ?? "",
			},
		},
		validateResponse: true,
	});
};
