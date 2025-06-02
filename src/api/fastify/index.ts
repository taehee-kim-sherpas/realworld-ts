import {
	Type as t,
	type TypeBoxTypeProvider,
	TypeBoxValidatorCompiler,
} from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import { registerArticles } from "./articles.ts";
import { registerComments } from "./comments.ts";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { createFakeContext, type AppContext } from "../context";
import { AlreadyExistError, NotExistError } from "../../domain/errors.ts";
import type { FastifySchemaValidationError } from "fastify/types/schema";

export function createFastify(ctx: AppContext) {
	return Fastify({
		logger: false,
	})
		.setValidatorCompiler(TypeBoxValidatorCompiler)
		.withTypeProvider<TypeBoxTypeProvider>()
		.register(registerArticles(ctx), { prefix: "/api/articles" })
		.register(registerComments(ctx), {
			prefix: "/api/articles/:slug/comments",
		})
		.setErrorHandler((error, request, reply) => {
			if (error.validation) {
				const structuredErrors: {
					keyword: string;
					schemaErrors: FastifySchemaValidationError[];
					message: string;
				}[] = [
					{
						keyword: "validation",
						schemaErrors: error.validation,
						message: error.message,
					},
				];

				return reply
					.code(422)
					.headers({ "content-type": "application/json" })
					.send(JSON.stringify(structuredErrors));
			}

			if (error instanceof AlreadyExistError) {
				return reply.code(409).send(error.message);
			}
			if (error instanceof NotExistError) {
				return reply.code(404).send(error.message);
			}
			return reply.code(500).send(String(error));
		});
}

const fakeRepoContext = createFakeContext({});

const fastify = createFastify(fakeRepoContext);

await fastify.register(swagger, {
	swagger: {
		info: {
			title: "Test swagger",
			description: "Testing theallocate Fastify swagger API",
			version: "0.1.0",
		},
		externalDocs: {
			url: "https://swagger.io",
			description: "Find more info here",
		},
		host: "localhost",
		schemes: ["http"],
		consumes: ["application/json"],
		produces: ["application/json"],
	},
});
await fastify.register(swaggerUi, {
	routePrefix: "/docs",
	uiConfig: {
		docExpansion: "full",
		deepLinking: false,
	},
	transformSpecificationClone: true,
});

// Declare a route
fastify.get(
	"/",
	{
		schema: {
			response: {
				200: t.Object(
					{
						hello: t.String({ examples: ["world"] }),
					},
					{
						examples: [{ hello: "world" }],
					},
				),
			},
		},
	},
	async (request, reply) => {
		return { hello: "test" };
	},
);

fastify.get("/redoc", async (request, reply) => {
	reply.header("content-type", "text/html");
	return Bun.file("./src/api/fastify/redoc.html").text();
});

// fastify.register(registerBatches, { prefix: "/batches" });

const start = async () => {
	try {
		await fastify.ready();
		fastify.swagger();
		const address = await fastify.listen({ port: 3000 });

		console.log(`Listening on ${address}`);
		console.log({ message: "Server is listening for requests." });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
