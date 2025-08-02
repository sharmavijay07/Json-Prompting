# PromptStruct Installation Guide

## Quick Start

### 1. Install the Extension

#### Option A: Load as Unpacked Extension (Development)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select the folder containing the extension files
5. The PromptStruct icon should appear in your extensions toolbar

#### Option B: Generate Icons First (Recommended)
1. Open `create-icons.html` in your browser
2. Click on each icon to download PNG versions
3. Save them in the `icons/` folder as `icon16.png`, `icon32.png`, etc.
4. Update `manifest.json` to use `.png` instead of `.svg` files
5. Follow Option A steps above

### 2. Configure API Access

1. Click the PromptStruct icon in your toolbar
2. Click the settings gear icon (⚙️)
3. Choose your AI provider:
   - **OpenAI**: Get API key from https://platform.openai.com/api-keys
   - **Anthropic**: Get API key from https://console.anthropic.com/
4. Enter your API key
5. Select your preferred model
6. Adjust temperature (creativity) setting if desired
7. Click "Save Settings"

### 3. First Test

1. Enter a test prompt: "Create a function that validates email addresses"
2. Select "OpenAI Function Calling" schema
3. Click "Convert to JSON"
4. Verify the generated JSON structure

## Detailed Configuration

### API Providers

#### OpenAI Setup
- **API Key**: Starts with `sk-`
- **Models Available**: 
  - GPT-4 (recommended for best quality)
  - GPT-4 Turbo (faster, good quality)
  - GPT-3.5 Turbo (fastest, lower cost)
- **Cost**: Pay per token used

#### Anthropic Setup
- **API Key**: Starts with `sk-ant-`
- **Models Available**:
  - Claude 3 Opus (highest quality)
  - Claude 3 Sonnet (balanced)
  - Claude 3 Haiku (fastest)
- **Cost**: Pay per token used

### Schema Types

1. **OpenAI Function Calling**
   - Perfect for GPT function calling
   - Includes parameters, types, and descriptions
   - Compatible with OpenAI's tools API

2. **LangChain Tool**
   - Works with LangChain framework
   - Includes input/output schemas
   - Provides usage examples

3. **Agent Prompt**
   - Structured prompts for AI agents
   - Includes instructions and constraints
   - Defines success criteria

4. **Anthropic Tool**
   - Compatible with Claude's tool use
   - Follows Anthropic's specifications
   - Optimized for Claude models

5. **Custom Schema**
   - Flexible JSON structure
   - Adapts to your specific needs
   - AI determines best format

## Features Overview

### Core Features
- ✅ Natural language to JSON conversion
- ✅ Multiple AI provider support (OpenAI, Anthropic)
- ✅ 5 different schema templates
- ✅ Dark/Light theme toggle
- ✅ AI-powered prompt optimization
- ✅ One-click copy to clipboard
- ✅ Multiple export formats (JSON, JS, Python, Text)
- ✅ Prompt history with search
- ✅ Configurable temperature/creativity
- ✅ Local storage for privacy

### Advanced Features
- ✅ Structured optimization suggestions
- ✅ Schema-specific examples
- ✅ Usage statistics tracking
- ✅ Error handling and validation
- ✅ Responsive design
- ✅ Keyboard shortcuts (Ctrl+Enter to convert)

## Troubleshooting

### Common Issues

#### Extension Won't Load
- Ensure all files are in the same directory
- Check that `manifest.json` is valid JSON
- Verify Chrome Developer Mode is enabled
- Try refreshing the extensions page

#### API Errors
- Verify API key is correct and active
- Check your API account has sufficient credits
- Ensure internet connection is stable
- Try switching to a different model

#### No JSON Output
- Check that your prompt is clear and specific
- Try a simpler prompt first
- Verify the selected schema type
- Check browser console for errors

#### Icons Not Showing
- Generate PNG icons using `create-icons.html`
- Update manifest.json to reference PNG files
- Reload the extension after changes

### Performance Tips

1. **Model Selection**
   - Use GPT-3.5 Turbo for speed
   - Use GPT-4 for quality
   - Use Claude Haiku for cost efficiency

2. **Prompt Writing**
   - Be specific about requirements
   - Include examples when helpful
   - Mention data types and constraints
   - Use the optimization feature

3. **Schema Selection**
   - Choose the most appropriate schema type
   - Use Custom for unique requirements
   - Try different schemas for comparison

## Privacy & Security

- **Local Storage**: All settings stored locally in Chrome
- **API Keys**: Never shared or transmitted except to chosen AI provider
- **History**: Stored locally, can be disabled or cleared
- **No Tracking**: Extension doesn't collect usage data
- **Open Source**: All code is visible and auditable

## Support

### Getting Help
1. Check this installation guide
2. Review the main README.md
3. Check browser console for error messages
4. Try with a fresh Chrome profile
5. Report issues with detailed steps to reproduce

### Reporting Bugs
Include the following information:
- Chrome version
- Extension version
- Steps to reproduce
- Error messages (if any)
- Expected vs actual behavior

---

**Ready to start?** Follow the Quick Start guide above and begin converting your prompts to structured JSON! 🚀
