import * as akeneoRequest from './akeneoRequest';
import { changeToList } from './changeToList';
import { PaginationResponse } from '../types/paginationResponse';
import { IAllExecuteFunctions } from 'n8n-workflow';

export async function paginateResponse(
	nodeExecuteFunc: IAllExecuteFunctions,
	url: string,
): Promise<PaginationResponse> {
	let akeneoItems: {}[] = [];
	let response;
	let next = url;
	do {
		response = await akeneoRequest.GET(nodeExecuteFunc, {
			url: next,
		});

		if (response.error) {
			return { error: response.error.response.data };
		}
		if (response._links.next !== undefined) {
			next = response._links.next.href;
		}
		akeneoItems = akeneoItems.concat(response._embedded.items);
	} while (response._links.next !== undefined);

	return { data: changeToList(akeneoItems) };
}
