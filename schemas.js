// Schema Templates for PromptStruct Extension

class SchemaTemplates {
    static getSystemPrompt(schemaType) {
        const basePrompt = "You are an expert at converting natural language prompts into structured JSON formats for AI systems. Always return valid JSON only, no additional text or explanations. ";
        
        switch (schemaType) {
            case 'openai-function':
                return basePrompt + this.getOpenAIFunctionPrompt();
            case 'langchain':
                return basePrompt + this.getLangChainPrompt();
            case 'agent-prompt':
                return basePrompt + this.getAgentPrompt();
            case 'anthropic-tool':
                return basePrompt + this.getAnthropicToolPrompt();
            case 'custom':
            default:
                return basePrompt + this.getCustomPrompt();
        }
    }

    static getOpenAIFunctionPrompt() {
        return `Convert the user's prompt into OpenAI Function Calling format. Return a valid JSON object with this exact structure:

{
  "name": "function_name_in_snake_case",
  "description": "Clear, concise description of what the function does",
  "parameters": {
    "type": "object",
    "properties": {
      "parameter_name": {
        "type": "string|number|boolean|array|object",
        "description": "Clear description of the parameter",
        "enum": ["optional", "array", "of", "allowed", "values"]
      }
    },
    "required": ["array", "of", "required", "parameter", "names"]
  }
}

Rules:
- Function name must be snake_case
- All parameters must have type and description
- Use enum for restricted values
- Include all necessary parameters
- Make required array contain only truly required parameters
- Ensure JSON is valid and follows OpenAI's function calling specification exactly`;
    }

    static getLangChainPrompt() {
        return `Convert the user's prompt into LangChain tool format. Return a valid JSON object with this structure:

{
  "name": "ToolName",
  "description": "Clear description of what this tool does and when to use it",
  "input_schema": {
    "type": "object",
    "properties": {
      "parameter_name": {
        "type": "string|number|boolean|array|object",
        "description": "Parameter description with usage context"
      }
    },
    "required": ["required_parameters"]
  },
  "return_schema": {
    "type": "object|string|number|boolean",
    "description": "Description of what the tool returns"
  },
  "examples": [
    {
      "input": {"example": "input"},
      "output": "expected output"
    }
  ]
}

Rules:
- Tool name should be PascalCase
- Include practical examples
- Specify clear return schema
- Focus on LangChain compatibility`;
    }

    static getAgentPrompt() {
        return `Convert the user's prompt into a structured agent prompt format. Return a JSON object with this structure:

{
  "role": "system|user|assistant",
  "task": "Clear, specific task description",
  "context": "Relevant background information and context",
  "instructions": [
    "Step-by-step instruction 1",
    "Step-by-step instruction 2",
    "Additional guidance as needed"
  ],
  "constraints": [
    "Important limitation or constraint",
    "Another constraint if applicable"
  ],
  "output_format": "Detailed description of expected output format",
  "examples": [
    {
      "scenario": "Example scenario description",
      "input": "Example input",
      "expected_output": "Example of expected output"
    }
  ],
  "success_criteria": [
    "Criterion 1 for successful completion",
    "Criterion 2 for successful completion"
  ]
}

Rules:
- Make instructions actionable and specific
- Include relevant constraints
- Provide clear success criteria
- Focus on agent-friendly structure`;
    }

    static getAnthropicToolPrompt() {
        return `Convert the user's prompt into Anthropic Claude tool format. Return a valid JSON object with this structure:

{
  "name": "tool_name",
  "description": "Clear description of the tool's purpose and functionality",
  "input_schema": {
    "type": "object",
    "properties": {
      "parameter_name": {
        "type": "string|number|boolean|array|object",
        "description": "Parameter description"
      }
    },
    "required": ["required_parameters"]
  }
}

Rules:
- Tool name should be snake_case
- Description should be comprehensive
- Follow Anthropic's tool specification
- Ensure compatibility with Claude's tool use`;
    }

    static getCustomPrompt() {
        return `Convert the user's prompt into a well-structured JSON format that best represents the intent and requirements. Analyze the prompt and create an appropriate JSON structure that could include:

- Clear naming and descriptions
- Proper data types
- Validation rules or constraints
- Examples where helpful
- Structured parameters or configuration
- Any relevant metadata

Create a JSON structure that would be most useful for the described use case. Be creative but practical, ensuring the output is valid JSON and serves the user's needs effectively.`;
    }

    static getSchemaExamples(schemaType) {
        switch (schemaType) {
            case 'openai-function':
                return {
                    title: "OpenAI Function Example",
                    example: {
                        "name": "get_weather",
                        "description": "Get current weather information for a specific location",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "location": {
                                    "type": "string",
                                    "description": "The city and state, e.g. San Francisco, CA"
                                },
                                "unit": {
                                    "type": "string",
                                    "enum": ["celsius", "fahrenheit"],
                                    "description": "Temperature unit"
                                }
                            },
                            "required": ["location"]
                        }
                    }
                };

            case 'langchain':
                return {
                    title: "LangChain Tool Example",
                    example: {
                        "name": "WebSearchTool",
                        "description": "Search the web for current information on any topic",
                        "input_schema": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "The search query to execute"
                                },
                                "num_results": {
                                    "type": "number",
                                    "description": "Number of results to return (default: 5)"
                                }
                            },
                            "required": ["query"]
                        },
                        "return_schema": {
                            "type": "array",
                            "description": "Array of search results with title, url, and snippet"
                        },
                        "examples": [
                            {
                                "input": {"query": "latest AI news", "num_results": 3},
                                "output": "Array of 3 search results about AI news"
                            }
                        ]
                    }
                };

            case 'agent-prompt':
                return {
                    title: "Agent Prompt Example",
                    example: {
                        "role": "system",
                        "task": "Analyze customer feedback and categorize sentiment",
                        "context": "You are analyzing customer reviews for an e-commerce platform",
                        "instructions": [
                            "Read the customer feedback carefully",
                            "Identify the overall sentiment (positive, negative, neutral)",
                            "Extract key themes and issues mentioned",
                            "Provide actionable insights for improvement"
                        ],
                        "constraints": [
                            "Only analyze the provided text, don't make assumptions",
                            "Be objective and avoid bias in sentiment analysis"
                        ],
                        "output_format": "JSON object with sentiment, themes, and recommendations",
                        "examples": [
                            {
                                "scenario": "Product review analysis",
                                "input": "Great product but shipping was slow",
                                "expected_output": "{\"sentiment\": \"mixed\", \"themes\": [\"product_quality\", \"shipping\"], \"recommendations\": [\"improve_shipping_speed\"]}"
                            }
                        ],
                        "success_criteria": [
                            "Accurate sentiment classification",
                            "Relevant theme extraction",
                            "Actionable recommendations provided"
                        ]
                    }
                };

            default:
                return {
                    title: "Custom Schema Example",
                    example: {
                        "type": "custom_structure",
                        "description": "Flexible JSON structure based on your specific needs",
                        "properties": {
                            "key": "value",
                            "nested": {
                                "data": "example"
                            }
                        }
                    }
                };
        }
    }

    static getAllSchemas() {
        return [
            {
                value: 'openai-function',
                label: 'OpenAI Function Calling',
                description: 'Perfect for GPT function calling and tool use'
            },
            {
                value: 'langchain',
                label: 'LangChain Tool',
                description: 'Compatible with LangChain tools and agents'
            },
            {
                value: 'agent-prompt',
                label: 'Agent Prompt',
                description: 'Structured prompts for AI agents and assistants'
            },
            {
                value: 'anthropic-tool',
                label: 'Anthropic Tool',
                description: 'Claude-compatible tool definitions'
            },
            {
                value: 'custom',
                label: 'Custom Schema',
                description: 'Flexible JSON structure for any use case'
            }
        ];
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchemaTemplates;
}
