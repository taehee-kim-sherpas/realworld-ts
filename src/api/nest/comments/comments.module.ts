import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller.ts";
import { createFakeContext } from "../../context.ts";

@Module({
  controllers: [CommentsController],
  providers: [
    {
      provide: "APP_CONTEXT",
      useFactory: () => {
        return createFakeContext({});
      },
    },
  ],
})
export class CommentsModule {}
