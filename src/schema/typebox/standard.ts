/*--------------------------------------------------------------------------

@sinclair/typebox/standard-schema

The MIT License (MIT)

Copyright (c) 2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { AssertError, Value } from "@sinclair/typebox/value";
import {
	type TSchema,
	type StaticDecode,
	CloneType,
	type StaticEncode,
} from "@sinclair/typebox";
import type { StandardSchemaV1 } from "@standard-schema/spec";
// ------------------------------------------------------------------
// Issues
// ------------------------------------------------------------------
// prettier-ignore
function CreateIssues(error: unknown): StandardSchemaV1.Issue[] {
	const isAssertError = error instanceof AssertError ? error : undefined;
	return !isAssertError
		? [
				{
					message: "Unknown error",
					path: ["/"],
				},
			]
		: [...isAssertError.Errors()].map((error) => ({
				message: error.message,
				path: error.path.split(".").map((key) => ({ key })),
			}));
}
// ------------------------------------------------------------------
// Validate
// ------------------------------------------------------------------
// prettier-ignore
function CreateValidator<Type extends TSchema>(
	schema: Type,
	references: TSchema[],
): (
	value: unknown,
) =>
	| StandardSchemaV1.SuccessResult<StaticEncode<Type>>
	| StandardSchemaV1.FailureResult {
	return (
		value: unknown,
	):
		| StandardSchemaV1.SuccessResult<StaticEncode<Type>>
		| StandardSchemaV1.FailureResult => {
		try {
			return { value: Value.Encode(schema, references, value) };
		} catch (error) {
			return { issues: CreateIssues(error) };
		}
	};
}
export function StandardEncodeSchema<Type extends TSchema>(
	schema: Type,
	references: TSchema[] = [],
): Type & StandardSchemaV1<StaticDecode<Type>, StaticEncode<Type>> {
	const standard = {
		version: 1,
		vendor: "TypeBox",
		validate: CreateValidator(schema, references),
	};
	return Object.defineProperty(CloneType(schema), "~standard", {
		enumerable: false,
		value: standard,
	}) as never;
}

export function StandardDecodeSchema<Type extends TSchema>(
	schema: Type,
	references: TSchema[] = [],
): Type & StandardSchemaV1<StaticEncode<Type>, StaticDecode<Type>> {
	const standard = {
		version: 1,
		vendor: "TypeBox",
		validate: CreateValidator(schema, references),
	};
	return Object.defineProperty(CloneType(schema), "~standard", {
		enumerable: false,
		value: standard,
	}) as never;
}
