import slugify from "cjk-slug";
import type { ArticleRepo } from "../persistence/types";
import createFakeArticleRepo from "../persistence/FakeArticleRepo";
import { articles } from "../persistence/drizzle/schema";

export interface AppContext {
	repo: { article: ArticleRepo };
	getNow: () => Date;
	slugify: (text: string) => string;
}

export interface TestContext extends AppContext {
	setNow: (date: Date) => void;
}

export function createFakeContext(override: Partial<TestContext>): TestContext {
	let now = new Date("2024-01-01");
	return {
		getNow: () => now,
		setNow: (date: Date) => {
			now = date;
		},
		repo: {
			article: createFakeArticleRepo({}),
		},
		slugify,
		...override,
	};
}
