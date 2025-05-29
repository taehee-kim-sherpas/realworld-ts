import { DateContext } from "../date";
import { SlugifyContext } from "../slug";

export type Article = {
	title: string;
	slug: string;
	description: string;
	body: string;
	//   author: Profile;
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
	context: DateContext & SlugifyContext,
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
	context: DateContext & SlugifyContext,
): Article {
	return {
		...article,
		...dto,
		slug: dto.title ? context.slugify(dto.title) : article.slug,
		updatedAt: context.getNow(),
	};
}
