import axios from 'axios';
import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';
import {
	AKENEO_AUTH_GRACE_PERIOD,
	AKENEO_REFRESH_TOKEN_EXPIRY,
	refreshExistingToken,
	requestNewToken,
	updateCredentials,
} from './utilities/AkeneoApiAuthentication';

export class AkeneoApi implements ICredentialType {
	displayName = 'Akeneo API';
	name = 'akeneoApi';
	documentationUrl = 'https://github.com/pixelinfinito/akeneo-node-n8n';
	properties: INodeProperties[] = [
		{
			displayName: 'Akeneo Base URL',
			name: 'akeneo_base_url',
			type: 'string',
			default: process.env.ENV_SERVER_AKENEO,
			required: true,
		},
		{
			displayName: 'Client ID',
			name: 'client_id',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'secret',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Access Token (Clear to re-authenticate)',
			name: 'access_token',
			type: 'string',
			default: '',
			required: false,
		},
		{
			displayName: 'Refresh Token (Filled automatically)',
			name: 'refresh_token',
			type: 'hidden',
			default: '',
			required: false,
		},
		{
			displayName: 'Initial acquisition (Filled automatically)',
			name: 'initial_aquisition',
			type: 'hidden',
			default: 0,
			required: false,
		},
		{
			displayName: 'Last Refresh (Filled automatically)',
			name: 'last_refresh',
			type: 'hidden',
			default: 0,
			required: false,
		},
		{
			displayName: 'Token Lifetime (Filled automatically)',
			name: 'token_lifetime',
			type: 'hidden',
			default: '',
			required: false,
		},
		{
			// This is a workaround!
			// By using an expirable field which never gets a value,
			// we can ensure the login is checked everytime. The preAuthentication
			// method only updates data if this property is empty.
			// In n8n >1.0.5 <=1.7.1 this is a working solution, see here:
			// https://github.com/n8n-io/n8n/blob/ebce6fe1b022fd259c00f7e1544a9e97e5f108e8/packages/cli/src/CredentialsHelper.ts#L203
			displayName: 'Always expired trigger',
			name: 'always_expired',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
		},
	];

	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<IDataObject> {
		const accessToken = credentials.access_token;
		const refreshToken = credentials.refresh_token;
		const initialAquisition = credentials.initial_aquisition;
		const lastRefresh = credentials.last_refresh;
		const tokenLifetime = credentials.token_lifetime;

		if (
			typeof accessToken !== 'string' ||
			accessToken === '' ||
			typeof refreshToken !== 'string' ||
			refreshToken === '' ||
			typeof initialAquisition !== 'number' ||
			typeof tokenLifetime !== 'number' ||
			typeof initialAquisition !== 'number' ||
			Date.now() - initialAquisition >= AKENEO_REFRESH_TOKEN_EXPIRY * 1000
		) {
			const authResult = await requestNewToken(this, credentials);
			credentials.initial_aquisition = Date.now();

			// This has side-effects and updates credentials.
			updateCredentials(credentials, authResult);

			return credentials;
		}

		if (
			typeof lastRefresh !== 'number' ||
			Date.now() - lastRefresh + AKENEO_AUTH_GRACE_PERIOD >= tokenLifetime * 1000
		) {
			const authResult = await refreshExistingToken(this, credentials);

			// This has side-effects and updates credentials.
			updateCredentials(credentials, authResult);

			return credentials;
		}

		return credentials;
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.access_token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.akeneo_base_url}}',
			// Unfortunately, Akeneo has no quick endpoint to check the authentication
			// Because of this, we request the locales, as this endpoint has a small amount of data
			// and requests should be fairly quick. Also we can just request "en_US" to limit out
			// to a single locale.
			url: '/api/rest/v1/locales/en_US',
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'GET',
		},
	};
}
