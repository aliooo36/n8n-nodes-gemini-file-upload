/**
 * src/nodes/GeminiFileUpload/GeminiFileUpload.node.ts
 * ---------------------------------------------------
 * Google Gemini “file upload chat” – starter node.
 * Replace the demo logic inside `execute()` with your real API call.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class GeminiFileUpload implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Gemini File Upload & Chat',
		name: 'geminiFileUpload', // ⚠️ internal name, keep kebab/ camel-case
		icon: 'file:GeminiFileUpload.node.svg',
		group: ['transform'],
		version: 1,
		description: 'Send a file to Google Gemini and get a chat response',
		// the label that appears under the node in the editor
		defaults: { name: 'Gemini File Upload' },

		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,

		properties: [
			/* ────────── YOUR NODE FIELDS ────────── */
			{
				displayName: 'My String',
				name: 'myString',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'Any string you want to pass through',
			},
			// add more options (file picker, credentials, etc.) here
		],
	};

	/**
	 * Main node logic.
	 * Replace the placeholder code with your Gemini API integration.
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		for (let i = 0; i < items.length; i++) {
			try {
				// 1. Read parameters
				const myString = this.getNodeParameter('myString', i, '') as string;

				// 2. TODO: Upload file + call Gemini API here
				//    Use this.helpers.requestWithAuthentication(...) if you add creds.

				// 3. Demo: just echo the input back
				items[i].json.myString = myString;
			} catch (error) {
				// Standard error handling template
				if (this.continueOnFail()) {
					items[i] = {
						json: { ...items[i].json },
						error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
						pairedItem: i,
					};
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
			}
		}

		return [items];
	}
}
