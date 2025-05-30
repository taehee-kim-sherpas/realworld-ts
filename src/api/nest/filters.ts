import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch } from "@nestjs/common/decorators/core/catch.decorator";
import { Request, Response } from "express";
import { AlreadyExistError } from "../../domain/errors";

@Catch(AlreadyExistError)
export class DomainErrorFilter implements ExceptionFilter {
	catch(exception: AlreadyExistError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		response.status(409).json({
			statusCode: 409,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: exception.message,
		});
	}
}
