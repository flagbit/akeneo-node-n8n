import axios from 'axios';
import {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

type AkeneoAuthResponse = {
	access_token: string,
	refresh_token: string,
	expires_in: number
};

export class AkeneoApi implements ICredentialType {
	displayName = 'Akeneo API';
	name = 'akeneoApi';
	documentationUrl = 'https://github.com/flagbit/akeneo-node-n8n';
	properties: INodeProperties[] = [
		{
			displayName: 'Akeneo Base URL',
			name: 'akeneo_base_url',
			type: 'string',
			default: process.env.ENV_SERVER_AKENEO,
			required: true
		},
		{
			displayName: 'Client ID',
			name: 'client_id',
			type: 'string',
			default: '',
			required: true
		},
		{
			displayName: 'Client Secret',
			name: 'secret',
			type: 'string',
			default: '',
			required: true
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
			required: true
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.akeneo_base_url}}',
			url: '',
			body: {
				api_key: '={{$credentials?.api_key}}',
				api_password: '={{$credentials?.api_password}}',
			},
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		},
	};

	private readonly akeneoAuthenticationRoute: string = '/api/oauth/v1/token';

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const authResult = await this.requestNewToken(credentials);

		return this.addTokenToRequestOptions(requestOptions, authResult.access_token);
	}

	private async requestNewToken(credentials: ICredentialDataDecryptedObject): Promise<AkeneoAuthResponse> {
		const basicAuthCredentials = this.getBasicAuthCredentials(credentials);
		const body = {
			grant_type: "password",
			username: credentials.username,
			password: credentials.password
		};

		const response = await axios.post(
			this.getAuthenticationUrl(credentials),
			body,
			{
				headers: {
					'Content-Type': "application/json",
					'Authorization': "Basic "+basicAuthCredentials,
				},
			}
		);

		return {
			access_token: response.data.access_token,
			refresh_token: response.data.refresh_token,
			expires_in: response.data.expires_in
		};
	}

	private addTokenToRequestOptions(requestOptions: IHttpRequestOptions, accessToken: string): IHttpRequestOptions {
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${accessToken}`,

		};

		return requestOptions;
	}

	private getAuthenticationUrl(credentials: ICredentialDataDecryptedObject): string {
		if (typeof credentials.akeneo_base_url !== 'string') {
			throw new Error('Type ' + typeof credentials.akeneo_base_url + ' is not a valid type for an URL');
		}

		return credentials.akeneo_base_url.replace(/\/+$/, "") + this.akeneoAuthenticationRoute;
	}

	private getBasicAuthCredentials(credentials: ICredentialDataDecryptedObject): string {
		return Buffer.from(`${credentials.client_id}:${credentials.secret}`).toString('base64');
	}
}
