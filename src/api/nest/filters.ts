import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch } from "@nestjs/common/decorators/core/catch.decorator";
import { Request, Response } from "express";
import { AlreadyExistError } from "../../domain/errors";
import { TypeboxValidationException } from "nestjs-typebox";

@Catch(AlreadyExistError)
export class AlreadyExistErrorFilter implements ExceptionFilter {
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

@Catch(TypeboxValidationException)
export class TypeboxValidationExceptionFilter implements ExceptionFilter {
	catch(exception: TypeboxValidationException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		response.status(422).json({
			statusCode: 422,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: exception.message,
		});
	}
}
