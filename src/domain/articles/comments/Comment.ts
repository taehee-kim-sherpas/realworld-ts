import { DateContext } from "../../date";
import { GeneateIdContext } from "../../id";
import { Profile } from "../../profiles/Profile";

export type Comment = {
	id: string;
	body: string;
	// author: Profile
	createdAt: Date;
	updatedAt: Date;
};

export function createComment(
	dto: Pick<Comment, "body">,
	context: DateContext & GeneateIdContext,
): Comment {
	return {
		...dto,
		id: context.generateId(),
		createdAt: context.getNow(),
		updatedAt: context.getNow(),
	};
}
