import slugify from "cjk-slug";
import type { ArticleRepo } from "../persistence/types";
import FakeArticleRepo from "../persistence/FakeArticleRepo";

export interface AppContext {
	repo: { article: ArticleRepo };
	getNow: () => Date;
	slugify: (text: string) => string;
}

export interface TestContext extends AppContext {
	setNow: (date: Date) => void;
}

export function createFakeContext(): TestContext {
	let now = new Date("2024-01-01");
	const context = {
		getNow: () => now,
		setNow: (date: Date) => {
			now = date;
		},
		repo: {
			article: FakeArticleRepo({}),
		},
		slugify,
	};

	return context;
}
