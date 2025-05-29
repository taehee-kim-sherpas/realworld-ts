import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller.ts";
import { createFakeContext } from "../../context.ts";

@Module({
  controllers: [ArticlesController],
  providers: [
    {
      provide: "APP_CONTEXT",
      useFactory: () => {
        return createFakeContext({});
      },
    },
  ],
})
export class ArticlesModule {}
