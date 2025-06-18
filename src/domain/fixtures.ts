import type { Article } from "./articles/Article.ts";
import type { Comment } from "./articles/comments/Comment.ts";

export const TEST_ARTICLE: Article = {
	title: "TDD, 테스트 주도 개발",
	slug: "tdd-테스트-주도-개발",
	description: "테스트 주도 개발이 무엇인지 배워보자.",
	body: "레드 그린 리팩토링",
	createdAt: new Date("2024-01-01"),
	updatedAt: new Date("2024-01-01"),
};

export const CREATE_ARTICLE: Pick<Article, "title" | "description" | "body"> = {
	title: TEST_ARTICLE.title,
	description: TEST_ARTICLE.description,
	body: TEST_ARTICLE.body,
};

export const ANOTHER_ARTICLE: Article = {
	title: "TDD, Test Driven Development",
	slug: "tdd-test-driven-development",
	description: "What is TDD?",
	body: "Red Green Refactor",
	createdAt: new Date("2024-01-01"),
	updatedAt: new Date("2024-02-01"),
};

export const UPDATE_ANOTHER_ARTICLE: Pick<
	Article,
	"title" | "description" | "body"
> = {
	title: ANOTHER_ARTICLE.title,
	description: ANOTHER_ARTICLE.description,
	body: ANOTHER_ARTICLE.body,
};

export const TEST_COMMENT: Comment = {
	id: "a70bb61d-240a-48de-999a-1eda641ff953",
	body: "와 테스트를 배우는데 큰 도움이 되는 글이네요요",
	createdAt: new Date("2024-02-01"),
	updatedAt: new Date("2024-02-01"),
	// author: {
	// 	username: "",
	// 	bio: "",
	// 	image: ""
	// }
};

export const CREATE_COMMENT: Pick<Comment, "body"> = {
	body: TEST_COMMENT.body,
};
