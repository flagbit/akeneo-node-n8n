import { ICredentialDataDecryptedObject, IHttpRequestHelper } from 'n8n-workflow';
import { AkeneoAuthResponse } from '../types/AkeneoApi';

export const AKENEO_AUTH_GRACE_PERIOD: number = 5 * 60 * 1000; // 5 minutes
export const AKENEO_REFRESH_TOKEN_EXPIRY: number = 13 * 24 * 60 * 60 * 1000; // 13 Days
const AKENEO_AUTHENTICATION_ROUTE = '/api/oauth/v1/token';

export async function requestNewToken(
	http: IHttpRequestHelper,
	credentials: ICredentialDataDecryptedObject,
): Promise<AkeneoAuthResponse> {
	const basicAuthCredentials = getBasicAuthCredentials(credentials);
	const body = {
		grant_type: 'password',
		username: credentials.username,
		password: credentials.password,
	};

	const response = await http.helpers.httpRequest({
		url: getAuthenticationUrl(credentials),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${basicAuthCredentials}`,
		},
		body,
		json: true,
	});

	return {
		access_token: response.access_token,
		refresh_token: response.refresh_token,
		expires_in: response.expires_in,
	};
}

export async function refreshExistingToken(
	http: IHttpRequestHelper,
	credentials: ICredentialDataDecryptedObject,
): Promise<AkeneoAuthResponse> {
	const basicAuthCredentials = getBasicAuthCredentials(credentials);
	const body = {
		grant_type: 'refresh_token',
		refresh_token: credentials.refresh_token,
	};

	const response = await http.helpers.httpRequest({
		url: getAuthenticationUrl(credentials),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${basicAuthCredentials}`,
		},
		body,
		json: true,
	});

	return {
		access_token: response.access_token,
		refresh_token: response.refresh_token,
		expires_in: response.expires_in,
	};
}

export function updateCredentials(
	credentials: ICredentialDataDecryptedObject,
	authResponse: AkeneoAuthResponse,
): ICredentialDataDecryptedObject {
	const { access_token, refresh_token, expires_in } = authResponse;

	return Object.assign(credentials, {
		access_token,
		refresh_token,
		token_lifetime: expires_in,
		last_refresh: Date.now(),
		always_expired: '',
	});
}

function getAuthenticationUrl(credentials: ICredentialDataDecryptedObject): string {
	if (typeof credentials.akeneo_base_url !== 'string') {
		throw new Error(`Type ${typeof credentials.akeneo_base_url} is not a valid type for an URL`);
	}

	return credentials.akeneo_base_url.replace(/\/+$/, '') + AKENEO_AUTHENTICATION_ROUTE;
}

function getBasicAuthCredentials(credentials: ICredentialDataDecryptedObject): string {
	return Buffer.from(`${credentials.client_id}:${credentials.secret}`).toString('base64');
}
