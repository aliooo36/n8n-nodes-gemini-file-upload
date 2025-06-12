import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Google Gemini REST API – API-key style credentials.
 * The `name` string is what you reference inside your node code:
 * await this.getCredentials('geminiApi')
 */
export class GeminiApi implements ICredentialType {
	name = 'geminiApi';               // must be unique package-wide
	displayName = 'Google Gemini API';       // label shown in the credential UI
	documentationUrl = 'https://ai.google.dev/gemini-api/docs/quickstart';            // add a docs link if you have one
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Google Gemini API key. This credential uses query parameter authentication (?key=YOUR_API_KEY) as required by the Gemini API.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				key: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://generativelanguage.googleapis.com',
			url: '/v1beta/models',
			method: 'GET',
			qs: {
				key: '={{$credentials.apiKey}}',
			},
		},
	};
}
