export type Article = {
	title: string;
	slug: string;
	description: string;
	body: string;
	//   author: string;
	//   tagList: string;
	//   favorited: string;
	//   favoritesCount: string;
	createdAt: Date;
	updatedAt: Date;
};

export function createArticle(
	dto: {
		title: string;
		description: string;
		body: string;
	},
	context: { getNow: () => Date; slugify: (text: string) => string },
): Article {
	return {
		...dto,
		slug: context.slugify(dto.title),
		createdAt: context.getNow(),
		updatedAt: context.getNow(),
	};
}

export function updateArticle(
	article: Article,
	dto: {
		title: string;
		description: string;
		body: string;
	},
	context: { getNow: () => Date; slugify: (text: string) => string },
): Article {
	return {
		...article,
		...dto,
		slug: context.slugify(dto.title ?? article.title),
		updatedAt: context.getNow(),
	};
}
