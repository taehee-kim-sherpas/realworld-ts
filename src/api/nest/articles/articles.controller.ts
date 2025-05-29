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
  ConflictException,
  HttpCode,
} from "@nestjs/common";
import type { Static } from "@sinclair/typebox";
import type {
  CreateUpdateArticleRequestBody,
  MultipleArticlesResponse,
  SingleArticleResponse,
} from "../../../schema/typebox/articles";
import {
  createArticle,
  updateArticle,
  type Article,
} from "../../../domain/articles/Article";
import type { AppContext } from "../../context";

@Controller("api/articles")
export class ArticlesController {
  @Inject("APP_CONTEXT")
  private ctx!: AppContext;

  @Get()
  async findAll(): Promise<Static<typeof MultipleArticlesResponse>> {
    const articles = await this.ctx.repo.article.list();
    return { articles };
  }

  @Get(":slug")
  async findOne(
    @Param("slug") slug: string
  ): Promise<Static<typeof SingleArticleResponse>> {
    const article = await this.ctx.repo.article.getBySlug(slug);
    if (!article) {
      throw new NotFoundException("NOT_FOUND");
    }
    return { article };
  }

  @Post()
  async create(
    @Body() body: Static<typeof CreateUpdateArticleRequestBody>
  ): Promise<Static<typeof SingleArticleResponse>> {
    console.log("create", body);
    const article = createArticle(body.article, this.ctx);
    const result = await this.ctx.repo.article.saveBySlug(
      article.slug,
      (old) => {
        if (old) return "already-exist";
        return article;
      }
    );
    if (result === "already-exist") {
      throw new ConflictException(
        `CONFLICT: slug ${this.ctx.slugify(body.article.title)}`
      );
    }
    return { article: result as Article };
  }

  @Put(":slug")
  async update(
    @Param("slug")
    slug: string,
    @Body()
    body: Static<typeof CreateUpdateArticleRequestBody>
  ): Promise<Static<typeof SingleArticleResponse>> {
    const result = await this.ctx.repo.article.saveBySlug(
      slug,
      (oldArticle) => {
        if (oldArticle === undefined) return "not-found";
        return updateArticle(oldArticle, body.article, this.ctx);
      }
    );
    if (result === "not-found") {
      throw new NotFoundException(`NOT_FOUND: slug ${slug}`);
    }
    return { article: result as Article };
  }

  @Delete(":slug")
  @HttpCode(204)
  async remove(@Param("slug") slug: string): Promise<void> {
    const result = await this.ctx.repo.article.deleteBySlug(slug);
    if (result === "not-found") {
      throw new NotFoundException(`NOT_FOUND: slug ${slug}`);
    }
  }
}
