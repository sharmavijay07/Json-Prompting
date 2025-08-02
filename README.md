# PromptStruct - AI Prompt to JSON Converter

A comprehensive Chrome extension that converts natural language prompts into structured JSON formats for AI tools like OpenAI Function Calling, LangChain, and agent systems. Now with multi-provider support, advanced templating, and batch processing capabilities.

## 🚀 Features

### Core AI Integration
- 🤖 **Multi-Provider Support**: OpenAI, Anthropic Claude, and Groq integration
- 📋 **Advanced Schema Support**: OpenAI Function Calling, LangChain Tools, Agent Prompts, Anthropic Tools, and Custom formats
- 🔄 **Model Comparison**: Side-by-side comparison across different AI providers
- 💡 **AI-Powered Optimization**: Get structured suggestions to improve your prompts

### Advanced Functionality
- 📦 **Batch Processing**: Process multiple prompts simultaneously with progress tracking
- 📋 **Prompt Templates**: Pre-built templates for common use cases with variable substitution
- 🔗 **LangChain Integration**: Built-in prompt templating and chaining capabilities
- 📊 **Usage Tracking**: Token usage and cost estimation across all providers

### User Experience
- 🎨 **Dark/Light Mode**: Developer-friendly interface with theme switching
- 📋 **One-Click Copy**: Copy generated JSON to clipboard instantly
- 💾 **Multi-Format Export**: Save as JSON, JavaScript, Python, or Text files
- 📚 **Smart History**: Keep track of conversions with search and reuse capabilities
- ⚙️ **Comprehensive Settings**: Fine-tune temperature, models, and provider preferences

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The PromptStruct icon should appear in your extensions toolbar

### Configuration

1. Click the PromptStruct icon in your toolbar
2. Click the settings gear icon (⚙️)
3. Choose your AI provider:
   - **OpenAI**: Enter your API key from https://platform.openai.com/api-keys
   - **Anthropic**: Enter your API key from https://console.anthropic.com/
   - **Groq**: Enter your API key from https://console.groq.com/
4. Select your preferred model and adjust temperature settings
5. Configure other preferences as needed

## 📖 Usage

### Basic Conversion
1. **Enter Your Prompt**: Type your natural language prompt in the input area
2. **Select Schema**: Choose the output format (OpenAI Function, LangChain, etc.)
3. **Convert**: Click "Convert to JSON" to generate structured output
4. **Copy/Export**: Use the copy button or export in multiple formats

### Advanced Features
- **🔄 Compare Models**: Click "Compare" to see outputs from all providers side-by-side
- **💡 Optimize Prompts**: Get AI-powered suggestions to improve your prompts
- **📋 Use Templates**: Access pre-built templates for common use cases
- **📦 Batch Process**: Process multiple prompts simultaneously
- **📊 Track Usage**: Monitor token usage and costs across providers

### Example

**Input Prompt:**
```
Create a function that takes a user's name and age, validates the age is between 18-100, and returns a greeting message with their details.
```

**Generated OpenAI Function JSON:**
```json
{
  "name": "create_user_greeting",
  "description": "Creates a personalized greeting message after validating user age",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The user's full name"
      },
      "age": {
        "type": "number",
        "description": "The user's age in years",
        "minimum": 18,
        "maximum": 100
      }
    },
    "required": ["name", "age"]
  }
}
```

## 🔧 Supported Schemas

- **OpenAI Function Calling**: Perfect for GPT function calling and tools API
- **LangChain Tool**: Compatible with LangChain framework and agents
- **Agent Prompt**: Structured prompts for AI agents and assistants
- **Anthropic Tool**: Claude-compatible tool definitions
- **Custom Schema**: Flexible JSON structure for any use case

## 🤖 AI Provider Support

### OpenAI
- **Models**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Features**: Function calling, chat completions, usage tracking
- **Best For**: High-quality conversions, complex reasoning

### Anthropic Claude
- **Models**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Features**: Tool use, structured outputs, fast processing
- **Best For**: Balanced performance and cost

### Groq
- **Models**: Llama 3 8B/70B, Mixtral 8x7B, Gemma 7B/9B
- **Features**: Ultra-fast inference, cost-effective processing
- **Best For**: High-speed batch processing, development testing

## Privacy & Security

- Your API key is stored locally in Chrome's secure storage
- No data is sent to our servers - all processing happens via OpenAI's API
- Prompt history is stored locally and can be disabled

## Development

### Project Structure
```
├── manifest.json          # Extension manifest
├── popup.html             # Main popup interface
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── styles.css            # Styling and themes
├── icons/                # Extension icons
└── README.md             # This file
```

### Building

No build process required - this is a vanilla JavaScript extension.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] v1.1: Additional schema templates
- [ ] v1.2: Cloud sync for prompts
- [ ] v1.3: Team collaboration features
- [ ] v2.0: Integration with more AI providers

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues for solutions

---

**Made with ❤️ for the AI developer community**
