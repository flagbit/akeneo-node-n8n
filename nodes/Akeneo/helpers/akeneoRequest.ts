
import { IAllExecuteFunctions, ICredentialDataDecryptedObject, IHttpRequestHelper, RequestHelperFunctions } from "n8n-workflow";

type typeAkeneoRequest = {
	baseUrl?: string,
	url: string,
	body?: {},
	headers?: {},
};

const GET = async (nodeExecuteFunc: IAllExecuteFunctions, { url, headers }: typeAkeneoRequest) => {
	try {
		return nodeExecuteFunc.helpers.httpRequestWithAuthentication.call(
			nodeExecuteFunc,
			'akeneoApi', 
			{
				url: url,
				method: 'GET',
				headers: headers
			}
		);
	} catch (e) {
		return { error: e };
	}
};

const POST = async (nodeExecuteFunc: IAllExecuteFunctions, { url, body, headers }: typeAkeneoRequest) => {
	try {
		return nodeExecuteFunc.helpers.httpRequestWithAuthentication.call(
			nodeExecuteFunc,
			'akeneoApi', 
			{
				url: url,
				method: 'POST',
				headers: headers,
				body: body,
				json: true
			}
		);
	} catch (e) {
		return { error: e };
	}
};

const PATCH = async (nodeExecuteFunc: IAllExecuteFunctions, { url, body, headers }: typeAkeneoRequest) => {
	try {
		return nodeExecuteFunc.helpers.httpRequestWithAuthentication.call(
			nodeExecuteFunc,
			'akeneoApi', 
			{
				url: url,
				method: 'PATCH',
				headers: headers,
				body: body,
				json: true
			}
		);
	} catch (e) {
		return { error: e };
	}
};

const DELETE = async (nodeExecuteFunc: IAllExecuteFunctions, { url, body, headers }: typeAkeneoRequest) => {
	try {
		return nodeExecuteFunc.helpers.httpRequestWithAuthentication.call(
			nodeExecuteFunc,
			'akeneoApi', 
			{
				url: url,
				method: 'DELETE',
				headers: headers,
				body: body,
				json: true
			}
		);
	} catch (e) {
		return { error: e };
	}
};

export { GET, POST, DELETE, PATCH, typeAkeneoRequest };
