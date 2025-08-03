// Background service worker for PromptStruct Chrome Extension

// Import schema templates
try {
    importScripts('schemas.js');
} catch (error) {
    console.error('Failed to import schemas.js:', error);
}

// Installation and update handlers
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('PromptStruct extension installed');
        
        // Set default settings
        chrome.storage.sync.set({
            theme: 'light',
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.3,
            saveHistory: true,
            schemaPreference: 'openai-function',
            enableComparison: false,
            batchProcessing: false
        });
    } else if (details.reason === 'update') {
        console.log('PromptStruct extension updated');
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Extension icon clicked');
});

// Message handling for communication between popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'convertPrompt':
            handlePromptConversion(request.data, sendResponse);
            return true; // Keep message channel open for async response
            
        case 'optimizePrompt':
            handlePromptOptimization(request.data, sendResponse);
            return true;

        case 'enhancePrompt':
            handlePromptEnhancement(request.data, sendResponse);
            return true;

        case 'saveToHistory':
            savePromptToHistory(request.data, sendResponse);
            return true;
            
        case 'getHistory':
            getPromptHistory(sendResponse);
            return true;

        case 'batchConvert':
            handleBatchConversion(request.data, sendResponse);
            return true;

        default:
            console.log('Unknown action:', request.action);
    }
});

// Handle prompt conversion using AI APIs
async function handlePromptConversion(data, sendResponse) {
    try {
        const { prompt, schema, apiKey, model, provider, temperature } = data;

        if (!apiKey) {
            sendResponse({
                success: false,
                error: 'API key not configured. Please set your API key in settings.'
            });
            return;
        }

        // Get base system prompt
        let systemPrompt = typeof SchemaTemplates !== 'undefined' ?
            SchemaTemplates.getSystemPrompt(schema) :
            getBasicSystemPrompt(schema);

        // Enhance system prompt with user preferences if available
        systemPrompt = await enhanceSystemPromptWithPreferences(systemPrompt, schema, data.userPreferences);

        let response, result, generatedJson;

        if (provider === 'anthropic') {
            // Anthropic Claude API
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model || 'claude-3-sonnet-20240229',
                    max_tokens: 2000,
                    temperature: temperature || 0.3,
                    messages: [
                        {
                            role: 'user',
                            content: `${systemPrompt}\n\nUser prompt: ${prompt}`
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Anthropic API request failed');
            }

            result = await response.json();
            generatedJson = result.content[0].text;

        } else if (provider === 'groq') {
            // Groq API
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: temperature || 0.3,
                    max_tokens: 2000,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Groq API request failed');
            }

            result = await response.json();
            generatedJson = result.choices[0].message.content;

        } else {
            // OpenAI API (default)
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || 'gpt-4',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: temperature || 0.3,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'OpenAI API request failed');
            }

            result = await response.json();
            generatedJson = result.choices[0].message.content;
        }

        // Clean and validate the JSON response
        const cleanedJson = cleanJsonResponse(generatedJson);

        // Validate that it's proper JSON
        try {
            JSON.parse(cleanedJson);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw response:', generatedJson);
            console.error('Cleaned response:', cleanedJson);
            throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
        }

        sendResponse({
            success: true,
            data: {
                json: cleanedJson,
                usage: result.usage || result.usage_metadata,
                provider: provider || 'openai'
            }
        });

    } catch (error) {
        console.error('Prompt conversion error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle prompt enhancement
async function handlePromptEnhancement(data, sendResponse) {
    try {
        const { prompt, provider, apiKey } = data;

        if (!apiKey) {
            throw new Error('API key not configured');
        }

        const enhancementPrompt = `You are an expert prompt engineer. Your task is to enhance the following prompt to make it more effective, clear, and comprehensive while maintaining its original intent.

Original prompt: "${prompt}"

Please provide an enhanced version that:
1. Is more specific and detailed
2. Includes relevant context and constraints
3. Uses clear, actionable language
4. Follows best practices for AI prompting
5. Maintains the original intent but improves clarity and effectiveness

Return only the enhanced prompt, no explanations or additional text.`;

        let response, result, enhancedPrompt;

        if (provider === 'groq') {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'user', content: enhancementPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Groq API request failed');
            }

            result = await response.json();
            enhancedPrompt = result.choices[0].message.content;

        } else if (provider === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1000,
                    messages: [
                        { role: 'user', content: enhancementPrompt }
                    ],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Anthropic API request failed');
            }

            result = await response.json();
            enhancedPrompt = result.content[0].text;

        } else {
            // OpenAI API (default)
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'user', content: enhancementPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'OpenAI API request failed');
            }

            result = await response.json();
            enhancedPrompt = result.choices[0].message.content;
        }

        sendResponse({
            success: true,
            data: {
                enhancedPrompt: enhancedPrompt.trim(),
                originalPrompt: prompt,
                provider: provider
            }
        });

    } catch (error) {
        console.error('Prompt enhancement error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Handle prompt optimization
async function handlePromptOptimization(data, sendResponse) {
    try {
        const { prompt, schema, apiKey, provider, model, temperature } = data;

        if (!apiKey) {
            sendResponse({
                success: false,
                error: 'API key not configured.'
            });
            return;
        }

        const optimizationPrompt = `You are an expert prompt engineer. Analyze the following prompt and provide specific, actionable suggestions to improve it for ${schema} schema generation.

Original prompt: "${prompt}"

Target schema: ${schema}

Provide your analysis in the following JSON format:
{
  "overall_score": "1-10 rating of current prompt quality",
  "strengths": ["list of what works well"],
  "improvements": [
    {
      "category": "clarity|specificity|structure|context|parameters",
      "issue": "description of the issue",
      "suggestion": "specific improvement recommendation",
      "example": "example of improved wording if applicable"
    }
  ],
  "optimized_prompt": "your improved version of the prompt",
  "explanation": "brief explanation of key changes made"
}

Focus on making the prompt more effective for generating high-quality ${schema} JSON structures.`;

        let response, result, suggestions;

        if (provider === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model || 'claude-3-haiku-20240307',
                    max_tokens: 1000,
                    temperature: temperature || 0.7,
                    messages: [
                        {
                            role: 'user',
                            content: optimizationPrompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Anthropic optimization request failed');
            }

            result = await response.json();
            suggestions = result.content[0].text;

        } else if (provider === 'groq') {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'user', content: optimizationPrompt }
                    ],
                    temperature: temperature || 0.7,
                    max_tokens: 1000,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error('Groq optimization request failed');
            }

            result = await response.json();
            suggestions = result.choices[0].message.content;

        } else {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'user', content: optimizationPrompt }
                    ],
                    temperature: temperature || 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error('OpenAI optimization request failed');
            }

            result = await response.json();
            suggestions = result.choices[0].message.content;
        }

        sendResponse({
            success: true,
            data: {
                suggestions,
                provider: provider || 'openai'
            }
        });

    } catch (error) {
        console.error('Prompt optimization error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Save prompt to history
async function savePromptToHistory(data, sendResponse) {
    try {
        const { prompt, json, schema, timestamp } = data;
        
        // Get existing history
        const result = await chrome.storage.local.get(['promptHistory']);
        const history = result.promptHistory || [];
        
        // Add new entry
        const newEntry = {
            id: Date.now().toString(),
            prompt,
            json,
            schema,
            timestamp: timestamp || new Date().toISOString()
        };
        
        history.unshift(newEntry);
        
        // Keep only last 50 entries
        const trimmedHistory = history.slice(0, 50);
        
        await chrome.storage.local.set({ promptHistory: trimmedHistory });
        
        sendResponse({ success: true });
        
    } catch (error) {
        console.error('Save to history error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Get prompt history
async function getPromptHistory(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['promptHistory']);
        sendResponse({
            success: true,
            data: result.promptHistory || []
        });
    } catch (error) {
        console.error('Get history error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle batch prompt conversion
async function handleBatchConversion(data, sendResponse) {
    try {
        const { prompts, schema, apiKey, provider, model, temperature } = data;

        if (!apiKey) {
            sendResponse({
                success: false,
                error: 'API key not configured.'
            });
            return;
        }

        if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
            sendResponse({
                success: false,
                error: 'No prompts provided for batch processing.'
            });
            return;
        }

        const results = [];
        const systemPrompt = SchemaTemplates.getSystemPrompt(schema);

        // Process prompts in batches to avoid overwhelming the API
        const batchSize = 3;
        for (let i = 0; i < prompts.length; i += batchSize) {
            const batch = prompts.slice(i, i + batchSize);
            const batchPromises = batch.map(async (prompt, index) => {
                try {
                    const actualIndex = i + index;
                    let response, result, generatedJson;

                    if (provider === 'anthropic') {
                        response = await fetch('https://api.anthropic.com/v1/messages', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': apiKey,
                                'anthropic-version': '2023-06-01'
                            },
                            body: JSON.stringify({
                                model: model || 'claude-3-sonnet-20240229',
                                max_tokens: 2000,
                                temperature: temperature || 0.3,
                                messages: [
                                    {
                                        role: 'user',
                                        content: `${systemPrompt}\n\nUser prompt: ${prompt}`
                                    }
                                ]
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Anthropic API request failed');
                        }

                        result = await response.json();
                        generatedJson = result.content[0].text;

                    } else if (provider === 'groq') {
                        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            body: JSON.stringify({
                                model: model || 'llama-3.3-70b-versatile',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: prompt }
                                ],
                                temperature: temperature || 0.3,
                                max_tokens: 2000,
                                stream: false
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Groq API request failed');
                        }

                        result = await response.json();
                        generatedJson = result.choices[0].message.content;

                    } else {
                        // OpenAI API (default)
                        response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            body: JSON.stringify({
                                model: model || 'gpt-4',
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: prompt }
                                ],
                                temperature: temperature || 0.3,
                                max_tokens: 2000
                            })
                        });

                        if (!response.ok) {
                            throw new Error('OpenAI API request failed');
                        }

                        result = await response.json();
                        generatedJson = result.choices[0].message.content;
                    }

                    return {
                        index: actualIndex,
                        prompt: prompt,
                        success: true,
                        json: generatedJson,
                        usage: result.usage || result.usage_metadata
                    };

                } catch (error) {
                    return {
                        index: actualIndex,
                        prompt: prompt,
                        success: false,
                        error: error.message
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Add a small delay between batches to be respectful to APIs
            if (i + batchSize < prompts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Sort results by original index
        results.sort((a, b) => a.index - b.index);

        const successCount = results.filter(r => r.success).length;
        const totalUsage = results.reduce((acc, r) => {
            if (r.usage) {
                acc.prompt_tokens += r.usage.prompt_tokens || 0;
                acc.completion_tokens += r.usage.completion_tokens || 0;
                acc.total_tokens += r.usage.total_tokens || 0;
            }
            return acc;
        }, { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });

        sendResponse({
            success: true,
            data: {
                results: results,
                summary: {
                    total: prompts.length,
                    successful: successCount,
                    failed: prompts.length - successCount,
                    usage: totalUsage
                }
            }
        });

    } catch (error) {
        console.error('Batch conversion error:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

// Fallback system prompt function
function getBasicSystemPrompt(schema) {
    const basePrompt = "You are an expert at converting natural language prompts into structured JSON formats for AI systems. Always return valid JSON only, no additional text or explanations. ";

    switch (schema) {
        case 'openai-function':
            return basePrompt + `Convert the user's prompt into OpenAI Function Calling format. Return a valid JSON object with name, description, and parameters fields.`;
        case 'langchain':
            return basePrompt + `Convert the user's prompt into LangChain tool format. Return a valid JSON object with name, description, and input_schema fields.`;
        case 'agent-prompt':
            return basePrompt + `Convert the user's prompt into a structured agent prompt format with role, task, instructions, and constraints.`;
        case 'anthropic-tool':
            return basePrompt + `Convert the user's prompt into Anthropic Claude tool format with name, description, and input_schema.`;
        default:
            return basePrompt + `Convert the user's prompt into a well-structured JSON format that best represents the intent and requirements.`;
    }
}

// Clean and extract JSON from AI response
function cleanJsonResponse(response) {
    if (!response) return '{}';

    // Remove common prefixes and suffixes
    let cleaned = response.trim();

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');

    // Remove common AI response prefixes
    cleaned = cleaned.replace(/^(here's|here is|the json|json:|response:)\s*/gi, '');

    // Find JSON content between braces or brackets
    const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }

    // Remove any trailing text after the JSON
    const lines = cleaned.split('\n');
    let jsonLines = [];
    let braceCount = 0;
    let bracketCount = 0;
    let inJson = false;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Start tracking when we see opening brace/bracket
        if (!inJson && (trimmedLine.startsWith('{') || trimmedLine.startsWith('['))) {
            inJson = true;
        }

        if (inJson) {
            jsonLines.push(line);

            // Count braces and brackets
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
                if (char === '[') bracketCount++;
                if (char === ']') bracketCount--;
            }

            // Stop when we've closed all braces/brackets
            if (braceCount === 0 && bracketCount === 0) {
                break;
            }
        }
    }

    return jsonLines.length > 0 ? jsonLines.join('\n').trim() : cleaned;
}

// Enhance system prompt with user preferences and feedback data
async function enhanceSystemPromptWithPreferences(basePrompt, schema, userPreferences) {
    if (!userPreferences) {
        return basePrompt;
    }

    let enhancedPrompt = basePrompt;

    // Add complexity level guidance
    if (userPreferences.complexityLevel) {
        const complexityGuidance = {
            'simple': 'Keep the schema simple and straightforward with minimal nesting.',
            'medium': 'Create a moderately detailed schema with appropriate structure.',
            'complex': 'Generate a comprehensive and detailed schema with rich structure and validation.'
        };
        enhancedPrompt += ` ${complexityGuidance[userPreferences.complexityLevel]}`;
    }

    // Add detail level guidance
    if (userPreferences.detailLevel) {
        const detailGuidance = {
            'minimal': 'Include only essential fields and basic descriptions.',
            'standard': 'Provide good descriptions and reasonable field coverage.',
            'detailed': 'Include comprehensive descriptions, examples, and extensive field coverage.'
        };
        enhancedPrompt += ` ${detailGuidance[userPreferences.detailLevel]}`;
    }

    // Add preferred structure patterns if available
    if (userPreferences.preferredStructures) {
        const schemaPatterns = userPreferences.preferredStructures[`${schema}_structure`];
        if (schemaPatterns && schemaPatterns.length > 0) {
            const topPattern = schemaPatterns[0];
            if (topPattern.structure && topPattern.structure.patterns) {
                const patterns = topPattern.structure.patterns;
                if (patterns.length > 0) {
                    enhancedPrompt += ` Based on user preferences, ensure the schema includes: ${patterns.join(', ')}.`;
                }
            }
        }

        // Add user feedback suggestions
        const suggestionKeys = Object.keys(userPreferences.preferredStructures).filter(key =>
            key.includes('suggestion') || key.includes('algorithm') || key.includes('complexity')
        );

        if (suggestionKeys.length > 0) {
            enhancedPrompt += ` Based on user feedback suggestions:`;

            // Check for algorithm approach suggestions
            if (suggestionKeys.some(key => key.includes('algorithm') || key.includes('approach'))) {
                enhancedPrompt += ` Include parameters for different implementation approaches (brute force, optimal, etc.).`;
            }

            // Check for complexity analysis suggestions
            if (suggestionKeys.some(key => key.includes('complexity'))) {
                enhancedPrompt += ` Include parameters for time and space complexity analysis.`;
            }

            // Check for example suggestions
            if (suggestionKeys.some(key => key.includes('example'))) {
                enhancedPrompt += ` Include parameters for providing examples and explanations.`;
            }
        }
    }

    // Add aspect weight guidance
    if (userPreferences.weights) {
        const weights = userPreferences.weights;
        const priorityAspects = Object.entries(weights)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([aspect]) => aspect);

        if (priorityAspects.length > 0) {
            const aspectGuidance = {
                'accuracy': 'Prioritize technical accuracy and correctness of the schema.',
                'completeness': 'Ensure comprehensive coverage of all necessary fields and properties.',
                'structure': 'Focus on clean, well-organized schema structure and hierarchy.',
                'relevance': 'Maintain strong relevance to the original prompt requirements.'
            };

            const guidance = priorityAspects
                .map(aspect => aspectGuidance[aspect])
                .filter(Boolean)
                .join(' ');

            if (guidance) {
                enhancedPrompt += ` ${guidance}`;
            }
        }
    }

    return enhancedPrompt;
}


