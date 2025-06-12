import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Google Gemini REST API – API-key style credentials.
 * The `name` string is what you reference inside your node code:
 * await this.getCredentials('geminiApi')
 */
export class GeminiApi implements ICredentialType {
	name = 'geminiApi';               // must be unique package-wide
	displayName = 'Gemini API';       // label shown in the credential UI
	documentationUrl = '';            // add a docs link if you have one
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			placeholder: 'ai-xxxxx',
			description: 'Your Gemini service API key',
		},
	];
}
