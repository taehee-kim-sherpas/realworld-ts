/*--------------------------------------------------------------------------

@sinclair/typebox/format

The MIT License (MIT)

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

const TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;

/**
 * `[ajv-formats]` ISO8601 Time component
 * @example `20:20:39+00:00`
 */
export function IsTime(value: string, strictTimeZone?: boolean): boolean {
	const matches: string[] | null = TIME.exec(value);
	if (!matches) return false;
	const hr: number = +matches[1];
	const min: number = +matches[2];
	const sec: number = +matches[3];
	const tz: string | undefined = matches[4];
	const tzSign: number = matches[5] === "-" ? -1 : 1;
	const tzH: number = +(matches[6] || 0);
	const tzM: number = +(matches[7] || 0);
	if (tzH > 23 || tzM > 59 || (strictTimeZone && !tz)) return false;
	if (hr <= 23 && min <= 59 && sec < 60) return true;
	const utcMin = min - tzM * tzSign;
	const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
	return (
		(utcHr === 23 || utcHr === -1) &&
		(utcMin === 59 || utcMin === -1) &&
		sec < 61
	);
}

const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;

function IsLeapYear(year: number): boolean {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
/**
 * `[ajv-formats]` ISO8601 Date component
 * @example `2020-12-12`
 */
export function IsDate(value: string): boolean {
	const matches: string[] | null = DATE.exec(value);
	if (!matches) return false;
	const year: number = +matches[1];
	const month: number = +matches[2];
	const day: number = +matches[3];
	return (
		month >= 1 &&
		month <= 12 &&
		day >= 1 &&
		day <= (month === 2 && IsLeapYear(year) ? 29 : DAYS[month])
	);
}

const DATE_TIME_SEPARATOR = /t|\s/i;

/**
 * `[ajv-formats]` ISO8601 DateTime
 * @example `2020-12-12T20:20:40+00:00`
 */
export function IsDateTime(value: string, strictTimeZone?: boolean): boolean {
	const dateTime: string[] = value.split(DATE_TIME_SEPARATOR);
	return (
		dateTime.length === 2 &&
		IsDate(dateTime[0]) &&
		IsTime(dateTime[1], strictTimeZone)
	);
}
