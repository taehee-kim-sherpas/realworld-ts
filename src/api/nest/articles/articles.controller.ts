import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Inject,
	NotFoundException,
	HttpCode,
} from "@nestjs/common";
import * as t from "@sinclair/typebox";
import {
	CreateUpdateArticleRequestBody,
	type MultipleArticlesResponse,
	type SingleArticleResponse,
} from "../../../schema/typebox/articles";
import {
	createArticle,
	updateArticle,
	type Article,
} from "../../../domain/articles/Article";
import type { AppContext } from "../../context";
import { Validate } from "nestjs-typebox";
import { AlreadyExistError } from "../../../domain/errors";

@Controller("api/articles")
export class ArticlesController {
	@Inject("APP_CONTEXT")
	private ctx!: AppContext;

	@Get()
	async findAll(): Promise<t.Static<typeof MultipleArticlesResponse>> {
		const articles = await this.ctx.repo.article.list();
		return { articles };
	}

	@Get(":slug")
	@Validate({
		request: [{ name: "slug", type: "param", schema: t.String() }],
	})
	async findOne(
		@Param("slug") slug: string,
	): Promise<t.Static<typeof SingleArticleResponse>> {
		const article = await this.ctx.repo.article.getBySlug(slug);
		if (!article) {
			throw new NotFoundException("NOT_FOUND");
		}
		return { article };
	}

	@Post()
	@Validate({
		request: [
			{ name: "body", type: "body", schema: CreateUpdateArticleRequestBody },
		],
	})
	async create(
		@Body() body: t.Static<typeof CreateUpdateArticleRequestBody>,
	): Promise<t.Static<typeof SingleArticleResponse>> {
		const article = createArticle(body.article, this.ctx);
		const result = await this.ctx.repo.article.saveBySlug(
			article.slug,
			(old) => {
				if (old) {
					throw new AlreadyExistError("");
				}

				return article;
			},
		);
		return { article: result as Article };
	}

	@Put(":slug")
	@Validate({
		request: [
			{ name: "slug", type: "param", schema: t.String() },
			{ name: "body", type: "body", schema: CreateUpdateArticleRequestBody },
		],
	})
	async update(
		@Param("slug")
		slug: string,
		@Body()
		body: t.Static<typeof CreateUpdateArticleRequestBody>,
	): Promise<t.Static<typeof SingleArticleResponse>> {
		const result = await this.ctx.repo.article.saveBySlug(
			slug,
			(oldArticle) => {
				if (!oldArticle) {
					throw new NotFoundException("NOT_FOUND");
				}

				return updateArticle(oldArticle, body.article, this.ctx);
			},
		);
		return { article: result as Article };
	}

	@Delete(":slug")
	@Validate({
		request: [{ name: "slug", type: "param", schema: t.String() }],
	})
	@HttpCode(204)
	async remove(@Param("slug") slug: string): Promise<void> {
		await this.ctx.repo.article.deleteBySlug(slug);
	}
}
