export type FetchClient = {
	get: (path: string) => Promise<unknown>;
	post: (path: string, data: unknown) => Promise<Response>;
	put: (path: string, data: unknown) => Promise<Response>;
	del: (path: string) => Promise<Response>;
};

export function createFetchClient(
	fetchImpl: (
		path: string,
		requestInit?: RequestInit,
	) => Promise<Response> | Response,
): FetchClient {
	async function get(path: string) {
		const res = await fetchImpl(path);

		if (res.ok) {
			if (res.headers.get("Content-Type") === "application/json") {
				return res.json();
			}

			return res.text();
		}

		throw res;
	}

	async function request(
		method: "POST" | "PUT" | "DELETE",
		path: string,
		data?: unknown,
	) {
		const res = await fetchImpl(path, {
			method,
			headers: data
				? {
						"Content-Type": "application/json",
					}
				: undefined,
			body: data ? JSON.stringify(data) : undefined,
		});

		if (res.ok) {
			return res;
		}

		throw res;
	}

	async function post(path: string, data: unknown) {
		return request("POST", path, data);
	}
	async function put(path: string, data: unknown) {
		return request("PUT", path, data);
	}

	async function del(path: string) {
		return request("DELETE", path);
	}
	return {
		get,
		post,
		put,
		del,
	};
}
