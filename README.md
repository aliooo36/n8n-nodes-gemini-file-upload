![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-gemini-file-upload

This is an n8n community node. It lets you use **Google Gemini File Upload & Chat** in your n8n workflows.

Google Gemini is Google's advanced AI model that can analyze and understand various file types including images, audio, video, PDFs, and documents, providing intelligent responses and insights about uploaded content.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following operations:

- **File Upload & Chat**: Upload files (images, audio, video, PDFs, documents) to Google Gemini and receive AI-generated responses based on your prompts

## Credentials

To use this node, you need to authenticate with Google Gemini API:

### Prerequisites
1. Sign up for a [Google AI Studio account](https://aistudio.google.com/)
2. Generate a Google Gemini API key

### Authentication Method
- **API Key Authentication**: Uses query parameter authentication (`?key=YOUR_API_KEY`) as required by the Gemini API
- The credential automatically handles the proper authentication format

### Setup
1. In n8n, create a new **Google Gemini API** credential
2. Enter your Google Gemini API key
3. Test the connection to verify authentication

## Compatibility

- **Tested against**: n8n v1.0+
- **Node.js requirement**: >= 20.15

## Usage

### Basic Workflow
1. **Input**: Connect a file source (e.g., "Read Binary File" node)
2. **Configure**: Set the binary property name (usually "data")
3. **Prompt**: Add your question or instruction about the file
4. **Model**: Choose from available Gemini models:
   - Gemini 2.5 Pro (Preview 06-05) - *Default, most capable*
   - Gemini 2.5 Flash (Preview 05-20) - Fast and efficient
   - Gemini 2.0 Flash - Previous generation
   - Gemini 1.5 Flash/Pro - Earlier versions

### Output Modes
- **Simple**: Returns essential information (model, response, token count, filename, filesize)
- **Full**: Returns complete response with all metadata and API details

### Advanced Configuration
The node includes comprehensive **Generation Config** options:
- **Temperature** (0-2): Control creativity vs. focus
- **Top P/K**: Fine-tune response diversity
- **Max Output Tokens**: Limit response length
- **Stop Sequences**: Define custom stopping points
- **JSON Mode**: Get structured responses with schema validation
- **Penalty Settings**: Control repetition and topic focus

### Supported File Types
- **Documents**: PDF, TXT, HTML, CSS, JavaScript, TypeScript, Python, and more

### Example Use Cases
- **Image Analysis**: "Describe what you see in this image"
- **Document Summarization**: "Summarize the key points in this PDF"
- **Code Review**: "Review this code file for potential improvements"

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Google Gemini API documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [File Upload API Reference](https://ai.google.dev/api/files)
- [Content Generation API Reference](https://ai.google.dev/api/generate-content)

## Version History

### ALPHA-1 (Current)
- **Initial Release**: Full file upload and chat functionality
- **Multi-Modal Support**: Images, audio, video, PDFs, and documents
- **Advanced Generation Config**: Complete parameter control
- **Dual Output Modes**: Simple and full response formats
- **Latest Models**: Support for Gemini 2.5 Pro/Flash preview versions
- **Query Authentication**: Proper Gemini API authentication method

### Features Included
- Resumable file upload protocol
- Comprehensive error handling
- Token usage tracking
- Binary data integration
- Structured JSON output support
- Safety settings and content filtering
- Preview model support with version identifiers

---

**Author**: Cole Ali  
**Repository**: [GitHub](https://github.com/aliooo36/n8n-nodes-gemini-file-upload)  
**License**: MIT

![image](https://github.com/user-attachments/assets/b323afb9-e28c-4785-bec8-b73c654cef0f)

