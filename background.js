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

        const systemPrompt = typeof SchemaTemplates !== 'undefined' ?
            SchemaTemplates.getSystemPrompt(schema) :
            getBasicSystemPrompt(schema);

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

        sendResponse({
            success: true,
            data: {
                json: generatedJson,
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


