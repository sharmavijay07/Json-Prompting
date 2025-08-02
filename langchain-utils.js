// LangChain utilities for PromptStruct Extension
// Simplified LangChain-inspired functionality without external dependencies

class PromptTemplate {
    constructor(template, inputVariables = []) {
        this.template = template;
        this.inputVariables = inputVariables;
    }

    format(values) {
        let formatted = this.template;
        for (const [key, value] of Object.entries(values)) {
            const regex = new RegExp(`{${key}}`, 'g');
            formatted = formatted.replace(regex, value);
        }
        return formatted;
    }

    static fromTemplate(template) {
        // Extract variables from template like {variable}
        const variables = [...template.matchAll(/{(\w+)}/g)].map(match => match[1]);
        return new PromptTemplate(template, variables);
    }
}

class FewShotPromptTemplate {
    constructor(examples, examplePrompt, prefix, suffix, inputVariables) {
        this.examples = examples;
        this.examplePrompt = examplePrompt;
        this.prefix = prefix;
        this.suffix = suffix;
        this.inputVariables = inputVariables;
    }

    format(values) {
        const exampleStrings = this.examples.map(example => 
            this.examplePrompt.format(example)
        );
        
        const exampleText = exampleStrings.join('\n\n');
        const fullTemplate = `${this.prefix}\n\n${exampleText}\n\n${this.suffix}`;
        
        let formatted = fullTemplate;
        for (const [key, value] of Object.entries(values)) {
            const regex = new RegExp(`{${key}}`, 'g');
            formatted = formatted.replace(regex, value);
        }
        
        return formatted;
    }
}

class OutputParser {
    parse(text) {
        throw new Error('parse method must be implemented');
    }
}

class JSONOutputParser extends OutputParser {
    parse(text) {
        try {
            // Try to extract JSON from text
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                             text.match(/```\n([\s\S]*?)\n```/) ||
                             text.match(/{[\s\S]*}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1] || jsonMatch[0]);
            }
            
            // Try to parse the entire text as JSON
            return JSON.parse(text);
        } catch (error) {
            // If parsing fails, try to clean the text and parse again
            const cleaned = this.cleanJsonText(text);
            try {
                return JSON.parse(cleaned);
            } catch (cleanError) {
                throw new Error(`Failed to parse JSON: ${error.message}`);
            }
        }
    }

    cleanJsonText(text) {
        // Remove common non-JSON prefixes and suffixes
        let cleaned = text.trim();
        
        // Remove markdown code blocks
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Remove common prefixes
        cleaned = cleaned.replace(/^(Here's the JSON|The JSON is|JSON:|Result:)\s*/i, '');
        
        // Find the first { and last }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        return cleaned;
    }
}

class PromptChain {
    constructor(steps = []) {
        this.steps = steps;
    }

    addStep(step) {
        this.steps.push(step);
        return this;
    }

    async run(input, apiCall) {
        let currentInput = input;
        const results = [];

        for (const step of this.steps) {
            try {
                const prompt = step.template.format({ input: currentInput, ...step.variables });
                const response = await apiCall(prompt, step.options);
                
                let parsed = response;
                if (step.parser) {
                    parsed = step.parser.parse(response);
                }
                
                results.push({
                    step: step.name,
                    prompt,
                    response,
                    parsed
                });
                
                currentInput = parsed;
            } catch (error) {
                throw new Error(`Chain failed at step "${step.name}": ${error.message}`);
            }
        }

        return {
            finalResult: currentInput,
            steps: results
        };
    }
}



// Token counting utilities
class TokenCounter {
    static estimateTokens(text) {
        // Rough estimation: ~4 characters per token for English text
        return Math.ceil(text.length / 4);
    }

    static estimateCost(tokens, provider, model) {
        const pricing = {
            openai: {
                'gpt-4': { input: 0.03, output: 0.06 },
                'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
                'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
            },
            anthropic: {
                'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
                'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
                'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
            },
            groq: {
                'llama3-8b-8192': { input: 0.0001, output: 0.0001 },
                'llama3-70b-8192': { input: 0.0008, output: 0.0008 },
                'mixtral-8x7b-32768': { input: 0.0006, output: 0.0006 },
                'gemma-7b-it': { input: 0.0001, output: 0.0001 },
                'gemma2-9b-it': { input: 0.0002, output: 0.0002 }
            }
        };

        const modelPricing = pricing[provider]?.[model];
        if (!modelPricing) {
            return { inputCost: 0, outputCost: 0, totalCost: 0 };
        }

        const inputCost = (tokens / 1000) * modelPricing.input;
        const outputCost = (tokens / 1000) * modelPricing.output;
        
        return {
            inputCost: inputCost,
            outputCost: outputCost,
            totalCost: inputCost + outputCost
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PromptTemplate,
        FewShotPromptTemplate,
        JSONOutputParser,
        PromptChain,
        TokenCounter
    };
}
