import * as akeneoRequest from "./akeneoRequest";
import {changeToList} from "./changeToList";
import {PaginationResponse} from "../types/paginationResponse";



export async function paginateResponse(url: string, token: any): Promise<PaginationResponse> {
	let akeneoItems: any[] = [];
	let response;
	let next = url;
	do {
		response = await akeneoRequest.GET({
			token: token.access_token,
			url: next,
		});

		if(response.error) {
			return {error: response.error.response.data};
		}
		if (response._links.next !== undefined) {
			next = response._links.next.href;
		}
		akeneoItems = akeneoItems.concat(response._embedded.items);
	}
	while (response._links.next !== undefined);

	return {data: changeToList(akeneoItems)};
}
