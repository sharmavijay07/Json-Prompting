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

        // Validate that we got a response
        if (!generatedJson) {
            throw new Error('Empty response from AI API');
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
            throw new Error(`Invalid JSON response from AI. Raw response: ${generatedJson.substring(0, 200)}...`);
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
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            provider: data.provider,
            hasApiKey: !!data.apiKey,
            prompt: data.prompt?.substring(0, 100) + '...'
        });
        sendResponse({
            success: false,
            error: `Conversion failed: ${error.message}`
        });
    }
}

// Handle prompt enhancement
async function handlePromptEnhancement(data, sendResponse) {
    try {
        const { prompt, provider, apiKey, currentSite, creativeCategory } = data;

        if (!apiKey) {
            throw new Error('API key not configured');
        }

        // Detect if this is an artistic/creative prompt
        const isArtistic = detectArtisticPrompt(prompt, currentSite, creativeCategory);
        const enhancementPrompt = createEnhancementPrompt(prompt, isArtistic, currentSite, creativeCategory);

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
        const { prompt, schema, apiKey, provider, model, temperature, feedbackHistory } = data;

        if (!apiKey) {
            sendResponse({
                success: false,
                error: 'API key not configured.'
            });
            return;
        }

        // Analyze feedback history for learning insights
        const learningInsights = analyzeFeedbackPatterns(feedbackHistory);

        const optimizationPrompt = `You are an expert prompt engineer. Analyze the following prompt and provide specific, actionable suggestions to improve it for ${schema} schema generation.

Original prompt: "${prompt}"

Target schema: ${schema}

${learningInsights ? `
Based on user feedback patterns:
${learningInsights}
` : ''}

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

        // Clean and parse the suggestions
        const cleanedSuggestions = cleanJsonResponse(suggestions);
        let parsedSuggestions;

        try {
            parsedSuggestions = JSON.parse(cleanedSuggestions);
        } catch (parseError) {
            console.error('Failed to parse optimization suggestions:', parseError);
            // Fallback to a simple format
            parsedSuggestions = {
                suggestions: [{
                    title: 'Optimization Suggestion',
                    description: suggestions.substring(0, 200) + '...',
                    action: 'append',
                    addition: '\n\nOptimization notes: ' + suggestions.substring(0, 500)
                }]
            };
        }

        // Convert the parsed response to the expected format
        let formattedSuggestions = [];

        if (parsedSuggestions.improvements && Array.isArray(parsedSuggestions.improvements)) {
            formattedSuggestions = parsedSuggestions.improvements.map(imp => ({
                title: imp.category || 'Improvement',
                description: imp.suggestion || imp.issue || 'Optimization suggestion',
                action: 'append',
                addition: imp.suggestion ? `\n\n${imp.category || 'Improvement'}: ${imp.suggestion}` : '',
                newPrompt: parsedSuggestions.optimized_prompt || ''
            }));
        } else if (parsedSuggestions.suggestions && Array.isArray(parsedSuggestions.suggestions)) {
            formattedSuggestions = parsedSuggestions.suggestions;
        } else if (Array.isArray(parsedSuggestions)) {
            formattedSuggestions = parsedSuggestions;
        }

        sendResponse({
            success: true,
            data: {
                suggestions: formattedSuggestions,
                rawResponse: suggestions,
                provider: provider || 'openai',
                optimizedPrompt: parsedSuggestions.optimized_prompt,
                overallScore: parsedSuggestions.overall_score,
                strengths: parsedSuggestions.strengths
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

        // Artistic/Creative Schemas
        case 'text-to-image':
            return basePrompt + `Convert the user's prompt into a comprehensive text-to-image generation JSON with detailed visual descriptions, style parameters, technical settings, and artistic elements. Include fields like: prompt, negative_prompt, style, aspect_ratio, quality, artistic_style, lighting, composition, color_palette, mood, technical_details.`;
        case 'text-to-video':
            return basePrompt + `Convert the user's prompt into a detailed text-to-video generation JSON with scene descriptions, motion parameters, camera movements, and production settings. Include fields like: scene_description, duration, camera_movement, motion_type, style, quality, fps, aspect_ratio, transitions, audio_cues, visual_effects.`;
        case 'text-to-audio':
            return basePrompt + `Convert the user's prompt into a comprehensive text-to-audio/music generation JSON with audio characteristics, musical elements, and production parameters. Include fields like: description, genre, mood, tempo, key, instruments, vocals, duration, style, production_quality, audio_effects.`;
        case 'text-to-speech':
            return basePrompt + `Convert the user's prompt into a detailed text-to-speech generation JSON with voice characteristics, speech parameters, and audio settings. Include fields like: text, voice_type, gender, age, accent, emotion, speed, pitch, volume, pronunciation_style, audio_format.`;
        case 'creative-writing':
            return basePrompt + `Convert the user's prompt into a structured creative writing JSON with narrative elements, character details, and story parameters. Include fields like: genre, tone, style, characters, setting, plot_points, themes, target_audience, word_count, narrative_perspective.`;
        case 'artistic-design':
            return basePrompt + `Convert the user's prompt into a comprehensive artistic design JSON with visual elements, design principles, and creative specifications. Include fields like: design_type, color_scheme, typography, layout, style_reference, dimensions, target_medium, artistic_movement, visual_hierarchy.`;

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

// Detect if a prompt is artistic/creative in nature
function detectArtisticPrompt(prompt, currentSite, creativeCategory) {
    // If we're on an artistic site, it's likely artistic
    if (creativeCategory && creativeCategory !== 'general') {
        return true;
    }

    // Check for artistic keywords in the prompt
    const artisticKeywords = [
        // Visual art
        'image', 'picture', 'photo', 'artwork', 'painting', 'drawing', 'illustration', 'design', 'visual', 'graphic',
        'color', 'style', 'aesthetic', 'composition', 'lighting', 'mood', 'atmosphere', 'artistic',

        // Video/Animation
        'video', 'animation', 'movie', 'film', 'cinematic', 'scene', 'camera', 'motion', 'movement',
        'transition', 'effect', 'visual effects', 'cinematography',

        // Audio/Music
        'music', 'song', 'audio', 'sound', 'melody', 'rhythm', 'beat', 'voice', 'speech', 'narration',
        'instrumental', 'vocals', 'genre', 'tempo', 'harmony',

        // Creative writing
        'story', 'narrative', 'character', 'plot', 'dialogue', 'creative writing', 'fiction', 'poetry',
        'script', 'screenplay', 'novel', 'chapter'
    ];

    const promptLower = prompt.toLowerCase();
    return artisticKeywords.some(keyword => promptLower.includes(keyword));
}

// Create enhancement prompt based on artistic context
function createEnhancementPrompt(prompt, isArtistic, currentSite, creativeCategory) {
    if (!isArtistic) {
        // Standard enhancement for non-artistic prompts
        return `You are an expert prompt engineer. Your task is to enhance the following prompt to make it more effective, clear, and comprehensive while maintaining its original intent.

Original prompt: "${prompt}"

Please provide an enhanced version that:
1. Is more specific and detailed
2. Includes relevant context and constraints
3. Uses clear, actionable language
4. Follows best practices for AI prompting
5. Maintains the original intent but improves clarity and effectiveness

Return only the enhanced prompt, no explanations or additional text.`;
    }

    // Artistic enhancement based on category
    const categoryEnhancements = {
        'image': `You are an expert prompt engineer specializing in text-to-image generation. Enhance the following prompt for optimal image generation results.

Original prompt: "${prompt}"

Create an enhanced version that includes:
1. **Visual Details**: Specific descriptions of subjects, objects, and scenes
2. **Artistic Style**: Art movement, technique, or specific artist references
3. **Technical Parameters**: Camera settings, lighting conditions, composition rules
4. **Color & Mood**: Color palette, atmosphere, emotional tone
5. **Quality Modifiers**: Resolution, detail level, artistic quality descriptors
6. **Negative Space**: What should NOT be included (if relevant)

Example enhancements to consider:
- Lighting: "soft golden hour lighting", "dramatic chiaroscuro", "studio lighting"
- Style: "in the style of [artist]", "photorealistic", "oil painting", "digital art"
- Composition: "rule of thirds", "close-up portrait", "wide angle landscape"
- Quality: "highly detailed", "8K resolution", "masterpiece", "professional photography"

Return only the enhanced prompt with rich visual descriptions.`,

        'video': `You are an expert prompt engineer specializing in text-to-video generation. Enhance the following prompt for optimal video generation results.

Original prompt: "${prompt}"

Create an enhanced version that includes:
1. **Scene Description**: Detailed visual elements and setting
2. **Motion & Action**: Specific movements, camera work, transitions
3. **Cinematic Style**: Film genre, director style, cinematography techniques
4. **Technical Specs**: Duration, frame rate, aspect ratio preferences
5. **Audio Elements**: Background music, sound effects, dialogue cues
6. **Visual Effects**: Special effects, post-processing, color grading

Example enhancements to consider:
- Camera work: "smooth tracking shot", "drone aerial view", "handheld documentary style"
- Motion: "slow motion", "time-lapse", "smooth transitions", "dynamic movement"
- Style: "cinematic", "documentary style", "music video aesthetic"
- Effects: "particle effects", "color grading", "depth of field"

Return only the enhanced prompt with detailed scene and motion descriptions.`,

        'audio': `You are an expert prompt engineer specializing in text-to-audio and music generation. Enhance the following prompt for optimal audio generation results.

Original prompt: "${prompt}"

Create an enhanced version that includes:
1. **Musical Elements**: Genre, tempo, key, time signature
2. **Instrumentation**: Specific instruments, vocal styles, sound sources
3. **Production Style**: Recording quality, mixing style, effects
4. **Mood & Atmosphere**: Emotional tone, energy level, ambiance
5. **Structure**: Song sections, arrangement, dynamics
6. **Technical Details**: Duration, audio quality, format preferences

Example enhancements to consider:
- Genre: "ambient electronic", "jazz fusion", "orchestral cinematic"
- Tempo: "120 BPM", "slow ballad", "upbeat dance tempo"
- Instruments: "acoustic guitar", "synthesizer pads", "string quartet"
- Mood: "melancholic", "uplifting", "mysterious", "energetic"
- Production: "lo-fi aesthetic", "studio quality", "live recording feel"

Return only the enhanced prompt with detailed musical descriptions.`,

        'text': `You are an expert prompt engineer specializing in creative writing. Enhance the following prompt for optimal creative content generation.

Original prompt: "${prompt}"

Create an enhanced version that includes:
1. **Genre & Style**: Literary genre, writing style, narrative voice
2. **Character Details**: Protagonist traits, motivations, background
3. **Setting & World**: Time period, location, atmosphere, world-building
4. **Plot Elements**: Conflict, themes, story structure, pacing
5. **Tone & Mood**: Emotional atmosphere, reader experience
6. **Technical Specs**: Length, format, target audience

Example enhancements to consider:
- Genre: "science fiction thriller", "romantic comedy", "historical drama"
- Style: "first-person narrative", "stream of consciousness", "dialogue-heavy"
- Setting: "dystopian future", "Victorian London", "small rural town"
- Tone: "dark and gritty", "lighthearted and whimsical", "suspenseful"
- Structure: "three-act structure", "episodic format", "non-linear timeline"

Return only the enhanced prompt with rich narrative details.`
    };

    // Use category-specific enhancement or general artistic enhancement
    const specificEnhancement = categoryEnhancements[creativeCategory];
    if (specificEnhancement) {
        return specificEnhancement;
    }

    // General artistic enhancement
    return `You are an expert prompt engineer specializing in creative and artistic content generation. Enhance the following prompt for optimal creative AI results.

Original prompt: "${prompt}"

Create an enhanced version that includes:
1. **Creative Details**: Rich descriptive language and specific artistic elements
2. **Style & Aesthetic**: Artistic movement, technique, or reference points
3. **Technical Parameters**: Quality, resolution, format, or production values
4. **Mood & Atmosphere**: Emotional tone, ambiance, and sensory details
5. **Composition**: Structure, layout, or arrangement principles
6. **Professional Quality**: Industry-standard terminology and best practices

Consider the context of ${currentSite || 'creative AI generation'} and enhance accordingly.

Return only the enhanced prompt with professional creative terminology and rich details.`;
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

// Analyze feedback patterns to provide learning insights
function analyzeFeedbackPatterns(feedbackHistory) {
    if (!feedbackHistory || feedbackHistory.length === 0) {
        return null;
    }

    const patterns = {
        preferredSchemas: {},
        commonIssues: [],
        successPatterns: []
    };

    feedbackHistory.forEach(feedback => {
        // Track preferred schemas
        if (feedback.feedbackType === 'preferred' || feedback.feedbackType === 'positive') {
            patterns.preferredSchemas[feedback.schema] = (patterns.preferredSchemas[feedback.schema] || 0) + 1;
        }

        // Analyze prompt characteristics that led to good/bad feedback
        if (feedback.prompt) {
            const promptLength = feedback.prompt.length;
            const hasExamples = feedback.prompt.toLowerCase().includes('example');
            const hasConstraints = feedback.prompt.toLowerCase().includes('must') || feedback.prompt.toLowerCase().includes('should');

            if (feedback.feedbackType === 'positive' || feedback.feedbackType === 'preferred') {
                patterns.successPatterns.push({
                    length: promptLength,
                    hasExamples,
                    hasConstraints,
                    schema: feedback.schema
                });
            }
        }
    });

    // Generate insights
    let insights = "User preferences learned from feedback:\n";

    // Most preferred schema
    const topSchema = Object.keys(patterns.preferredSchemas).reduce((a, b) =>
        patterns.preferredSchemas[a] > patterns.preferredSchemas[b] ? a : b, null);

    if (topSchema) {
        insights += `- Prefers ${topSchema} schema format\n`;
    }

    // Success patterns
    if (patterns.successPatterns.length > 0) {
        const avgSuccessLength = patterns.successPatterns.reduce((sum, p) => sum + p.length, 0) / patterns.successPatterns.length;
        const exampleUsage = patterns.successPatterns.filter(p => p.hasExamples).length / patterns.successPatterns.length;
        const constraintUsage = patterns.successPatterns.filter(p => p.hasConstraints).length / patterns.successPatterns.length;

        if (avgSuccessLength > 100) {
            insights += `- Tends to prefer detailed prompts (avg ${Math.round(avgSuccessLength)} chars)\n`;
        }
        if (exampleUsage > 0.5) {
            insights += "- Responds well to prompts with examples\n";
        }
        if (constraintUsage > 0.5) {
            insights += "- Prefers prompts with clear constraints and requirements\n";
        }
    }

    return insights;
}


