/**
 * src/nodes/GeminiFileUpload/GeminiFileUpload.node.ts
 * ---------------------------------------------------
 * Google Gemini file upload and chat node for n8n.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ICredentialDataDecryptedObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class GeminiFileUpload implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Gemini File Upload & Chat',
		name: 'geminiFileUpload',
		icon: 'file:GeminiFileUpload.node.svg',
		group: ['transform'],
		version: 1,
		description: 'Upload a file to Google Gemini and get a chat response',
		defaults: { name: 'Gemini File Upload & Chat' },

		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,

		credentials: [
			{
				name: 'geminiApi',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'Input Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Name of the binary property that contains the file to upload',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: 'Describe this file',
				required: true,
				description: 'The prompt/question you want to ask about the uploaded file',
			},
			// ------- UPDATED: Dynamic Model Dropdown -------
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				default: '',
				description: 'The Gemini model to use for content generation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				required: true,
			},
			// ------------------------------------------------
			{
				displayName: 'Output Mode',
				name: 'outputMode',
				type: 'options',
				options: [
					{
						name: 'Simple',
						value: 'simple',
						description: 'Returns only essential information (model, response, token count, filename, filesize)',
					},
					{
						name: 'Full',
						value: 'full',
						description: 'Returns complete response with all metadata',
					},
				],
				default: 'simple',
				description: 'Choose the output format for the response',
			},
			{
				displayName: 'File Processing Timeout',
				name: 'fileProcessingTimeout',
				type: 'number',
				default: 30,
				typeOptions: {
					minValue: 5,
					maxValue: 300,
					numberStepSize: 5,
				},
				description: 'Maximum time (in seconds) to wait for file processing before timing out. Video files may require longer processing times.',
			},
			{
				displayName: 'Generation Config',
				name: 'generationConfig',
				type: 'collection',
				placeholder: 'Add Generation Config',
				default: {},
				description: 'Configuration options for model generation and outputs',
				options: [
					{
						displayName: 'Candidate Count',
						name: 'candidateCount',
						type: 'number',
						default: 1,
						typeOptions: {
							minValue: 1,
							maxValue: 8,
						},
						description: 'Number of response candidates to generate (1-8). Only one candidate is returned, but generating multiple can improve quality through internal selection.',
					},
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: -2,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						description: 'Penalizes tokens based on how frequently they appear in the text (-2 to 2). Positive values reduce repetition, negative values increase repetition.',
					},
					{
						displayName: 'Max Output Tokens',
						name: 'maxOutputTokens',
						type: 'number',
						default: 8192,
						typeOptions: {
							minValue: 1,
							maxValue: 100000,
						},
						description: 'Maximum number of tokens to generate in the response (1-100,000). Controls the length of the generated content. Actual output may be shorter if natural stopping point is reached.',
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: -2,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						description: 'Penalizes tokens based on whether they appear in the text so far (-2 to 2). Positive values encourage discussing new topics, negative values encourage staying on topic.',
					},
					{
						displayName: 'Response MIME Type',
						name: 'responseMimeType',
						type: 'options',
						options: [
							{
								name: 'Text/Plain',
								value: 'text/plain',
							},
							{
								name: 'Application/JSON',
								value: 'application/json',
							},
						],
						default: 'text/plain',
						description: 'Output format for the generated response. Use "application/JSON" for structured JSON output with schema validation.',
					},
					{
						displayName: 'Response Schema',
						name: 'responseSchema',
						type: 'json',
						default: '{}',
						description: 'JSON schema defining the structure of the expected JSON response. Only used when Response MIME Type is "application/JSON". Helps ensure consistent structured output.',
						displayOptions: {
							show: {
								responseMimeType: ['application/json'],
							},
						},
					},
					{
						displayName: 'Stop Sequences',
						name: 'stopSequences',
						type: 'fixedCollection',
						placeholder: 'Add Stop Sequence',
						default: { sequences: [] },
						description: 'Text sequences that will cause the model to stop generating. Up to 5 sequences supported. Model will stop when it encounters any of these sequences.',
						options: [
							{
								name: 'sequences',
								displayName: 'Sequences',
								values: [
									{
										displayName: 'Stop Sequence',
										name: 'sequence',
										type: 'string',
										default: '',
										description: 'A text sequence that will stop generation (e.g., "END", "\\n\\n", "###")',
									},
								],
							},
						],
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.9,
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						description: 'Controls randomness in output generation (0-2). Higher values (e.g., 1.8) make output more random and creative, while lower values (e.g., 0.2) make it more focused and deterministic. Use 0 for deterministic output.',
					},
					{
						displayName: 'Top K',
						name: 'topK',
						type: 'number',
						default: 40,
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						description: 'Limits token selection to the top K most probable tokens (1-100). Lower values make output more predictable, higher values allow more variety. Set to 1 for deterministic output.',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						type: 'number',
						default: 0.95,
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberStepSize: 0.01,
						},
						description: 'Nucleus sampling parameter (0-1). Consider only tokens with cumulative probability up to this value. Lower values (e.g., 0.1) make output more focused, higher values (e.g., 0.95) allow more diversity.',
					},
				],
			},
		],
	};

	// ----------- DYNAMIC OPTIONS METHOD FOR MODELS -----------
	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('geminiApi') as ICredentialDataDecryptedObject;
				const apiKey = credentials.apiKey as string;

				if (!apiKey) {
					throw new NodeOperationError(this.getNode(), 'Missing Google Gemini API key');
				}

				const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
				let response;
				try {
					response = await this.helpers.request({
						method: 'GET',
						url: endpoint,
						json: true,
					});
				} catch (error) {
					throw new NodeOperationError(this.getNode(), 'Failed to fetch Gemini models: ' + (error as Error).message);
				}

				if (!response.models) {
					throw new NodeOperationError(this.getNode(), 'No models found in API response');
				}

				return response.models.map((model: any) => ({
					name: model.displayName || model.name,
					value: model.name.replace('models/', ''),
					description: model.description || '',
				}));
			},
		},
	};
	// ----------------------------------------------------------

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('geminiApi') as ICredentialDataDecryptedObject;
		const apiKey = credentials.apiKey as string;

		if (!apiKey) {
			throw new NodeOperationError(this.getNode(), 'Missing Google Gemini API key');
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const outputMode = this.getNodeParameter('outputMode', i, 'simple') as string;
				const generationConfig = this.getNodeParameter('generationConfig', i, {}) as any;
				const fileProcessingTimeout = this.getNodeParameter('fileProcessingTimeout', i, 30) as number;

				const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
				const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
				const mimeType = binaryData.mimeType || 'application/octet-stream';
				const numBytes = fileBuffer.length;

				const uploadInitResponse = await this.helpers.request({
					method: 'POST',
					url: `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
					headers: {
						'X-Goog-Upload-Protocol': 'resumable',
						'X-Goog-Upload-Command': 'start',
						'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
						'X-Goog-Upload-Header-Content-Type': mimeType,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						file: {
							display_name: `Uploaded file ${i + 1}`,
						},
					}),
					resolveWithFullResponse: true,
				});

				const uploadUrl = uploadInitResponse.headers['x-goog-upload-url'];
				if (!uploadUrl) {
					throw new NodeOperationError(this.getNode(), 'Failed to get upload URL from Gemini API');
				}

				const uploadResponse = await this.helpers.request({
					method: 'POST',
					url: uploadUrl,
					headers: {
						'Content-Length': numBytes.toString(),
						'X-Goog-Upload-Offset': '0',
						'X-Goog-Upload-Command': 'upload, finalize',
						'Content-Type': mimeType,
					},
					body: fileBuffer,
					json: true,
				});

				const fileUri = uploadResponse.file?.uri;
				if (!fileUri) {
					throw new NodeOperationError(this.getNode(), 'Failed to upload file to Gemini API');
				}

				// Step 3: Poll for ACTIVE state (especially important for video files)
				const fileId = fileUri.split('/').pop();
				let fileActive = false;
				const maxAttempts = fileProcessingTimeout; // Use configurable timeout
				const waitMs = 1000; // 1 second between checks
				let attempts = 0;
				let lastState = '';

				while (!fileActive && attempts < maxAttempts) {
					const fileStatusResponse = await this.helpers.request({
						method: 'GET',
						url: `https://generativelanguage.googleapis.com/v1beta/files/${fileId}?key=${apiKey}`,
						json: true,
					});

					lastState = fileStatusResponse.state;
					if (lastState === 'ACTIVE') {
						fileActive = true;
					} else if (lastState === 'FAILED') {
						throw new NodeOperationError(this.getNode(), `Gemini API failed to process file: ${fileStatusResponse.error?.message || 'unknown error'}`);
					} else {
						// Wait before next check
						await new Promise(resolve => setTimeout(resolve, waitMs));
						attempts++;
					}
				}

				if (!fileActive) {
					throw new NodeOperationError(this.getNode(), `Timeout waiting for file to be processed. Last state: ${lastState}. Video files may take longer to process.`);
				}

				// Process generation config
				const processedConfig: any = {};

				if (generationConfig.temperature !== undefined) processedConfig.temperature = generationConfig.temperature;
				if (generationConfig.topP !== undefined) processedConfig.topP = generationConfig.topP;
				if (generationConfig.topK !== undefined) processedConfig.topK = generationConfig.topK;
				if (generationConfig.maxOutputTokens !== undefined) processedConfig.maxOutputTokens = generationConfig.maxOutputTokens;
				if (generationConfig.candidateCount !== undefined) processedConfig.candidateCount = generationConfig.candidateCount;
				if (generationConfig.presencePenalty !== undefined) processedConfig.presencePenalty = generationConfig.presencePenalty;
				if (generationConfig.frequencyPenalty !== undefined) processedConfig.frequencyPenalty = generationConfig.frequencyPenalty;
				if (generationConfig.responseMimeType !== undefined) processedConfig.responseMimeType = generationConfig.responseMimeType;

				if (generationConfig.stopSequences?.sequences?.length > 0) {
					processedConfig.stopSequences = generationConfig.stopSequences.sequences.map((seq: any) => seq.sequence).filter((seq: string) => seq);
				}

				if (generationConfig.responseSchema && generationConfig.responseMimeType === 'application/json') {
					try {
						processedConfig.responseSchema = typeof generationConfig.responseSchema === 'string' ?
							JSON.parse(generationConfig.responseSchema) : generationConfig.responseSchema;
					} catch (error) {
						// Ignore schema parsing error
					}
				}

				const requestBody: any = {
					contents: [
						{
							parts: [
								{ text: prompt },
								{
									file_data: {
										mime_type: mimeType,
										file_uri: fileUri,
									},
								},
							],
						},
					],
				};

				if (Object.keys(processedConfig).length > 0) {
					requestBody.generationConfig = processedConfig;
				}

				// NOTE: We add 'models/' prefix back to the model if user-facing value is stripped
				const modelEndpoint = model.startsWith('models/') ? model : `models/${model}`;

				const generateResponse = await this.helpers.request({
					method: 'POST',
					url: `https://generativelanguage.googleapis.com/v1beta/${modelEndpoint}:generateContent?key=${apiKey}`,
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestBody),
					json: true,
				});

				const generatedText = generateResponse.candidates?.[0]?.content?.parts?.[0]?.text;
				if (!generatedText) {
					throw new NodeOperationError(this.getNode(), 'No response generated from Gemini API');
				}

				const tokenCount = generateResponse.usageMetadata?.totalTokenCount || 0;

				let outputData: any;

				if (outputMode === 'simple') {
					outputData = {
						model,
						response: generatedText,
						tokenCount,
						fileName: binaryData.fileName || 'uploaded-file',
						fileSize: numBytes,
					};
				} else {
					outputData = {
						...items[i].json,
						fileUri,
						fileName: binaryData.fileName || 'uploaded-file',
						mimeType,
						fileSize: numBytes,
						prompt,
						model,
						tokenCount,
						generationConfig: processedConfig,
						response: generatedText,
						fullResponse: generateResponse,
					};
				}

				returnData.push({
					json: outputData,
					pairedItem: i,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { ...items[i].json },
						error: new NodeOperationError(this.getNode(), error as Error, { itemIndex: i }),
						pairedItem: i,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}
