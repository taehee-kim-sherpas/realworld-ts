import slugify from "cjk-slug";
import type { ArticleRepo, CommentRepo } from "../persistence/types";
import createFakeArticleRepo from "../persistence/FakeArticleRepo";
import type { DateContext } from "../domain/date";
import type { SlugifyContext } from "../domain/slug";
import createFakeCommentRepo from "../persistence/FakeCommentRepo";
import type { GeneateIdContext } from "../domain/id";

export interface AppContext extends DateContext, SlugifyContext, GeneateIdContext {
  repo: { article: ArticleRepo, comment: CommentRepo };
}

export interface TestContext extends AppContext {
  setup?: () => Promise<void>;
  setNow: (date: Date) => void;
  setNextId: (id: string) => void;
}

export function createFakeContext(override: Partial<TestContext>): TestContext {
  let now = new Date("2024-01-01");
  let nextId: string = crypto.randomUUID();
  return {
    getNow: () => now,
    setNow: (date: Date) => {
      now = date;
    },
    repo: {
      article: createFakeArticleRepo({}),
      comment: createFakeCommentRepo({})
    },
    slugify,
    setNextId: (id) => {
      nextId = id;
    },
    generateId() {
      return nextId;
    },
    ...override,
  };
}
