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
import * as t from "@sinclair/typebox";
import { CreateCommentRequestBody, MultipleCommentsResponse, SingleCommentResponse } from "../../../schema/typebox/comments";
import {
  createComment
} from "../../../domain/articles/comments/Comment";
import type { AppContext } from "../../context";
import { Validate } from 'nestjs-typebox';
import { AlreadyExistError } from "../../../domain/errors";

@Controller("api/articles/:slug/comments/")
export class CommentsController {
  @Inject("APP_CONTEXT")
  private ctx!: AppContext;

  @Get()
  @Validate({
    request: [
      { name: 'slug', type: 'param', schema: t.String() },
    ],
  })
  async findAll(
    @Param("slug") slug: string,
  ): Promise<t.Static<typeof MultipleCommentsResponse>> {
    const comments = await this.ctx.repo.comment.listByArticleSlug(slug);
    return { comments };
  }

  @Post()
  @Validate({
    request: [
      { name: 'slug', type: 'param', schema: t.String() },
      { name: 'body', type: 'body', schema: CreateCommentRequestBody },
    ],
  })
  async create(
    @Param("slug") slug: string,
    @Body() body: t.Static<typeof CreateCommentRequestBody>
  ): Promise<t.Static<typeof SingleCommentResponse>> {
    const comment = createComment(body.comment, this.ctx);
    await this.ctx.repo.comment.saveBySlugAndId(
      slug,
      comment.id,
      (old) => {
        if(old){
          throw new AlreadyExistError("")
        }
        return comment;
      }
    );

    return { comment };
  }

  @Delete(":id")
  @Validate({
    request: [
      { name: 'slug', type: 'param', schema: t.String() },
      { name: 'id', type: 'param', schema: t.String() },
    ],
  })
  @HttpCode(204)
  async remove(
    @Param("slug") slug: string,
    @Param("id") id: string
): Promise<void> {
    await this.ctx.repo.comment.deleteBySlug(slug, id);
  }
}
