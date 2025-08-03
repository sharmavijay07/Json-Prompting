// Reinforcement Learning Feedback System for PromptStruct
// Manages user feedback collection, preference learning, and adaptive improvements

class FeedbackManager {
    constructor() {
        this.feedbackData = [];
        this.userPreferences = {
            preferredStructures: {},
            namingConventions: {},
            complexityLevel: 'medium',
            detailLevel: 'standard',
            weights: {
                accuracy: 0.3,
                completeness: 0.25,
                structure: 0.25,
                relevance: 0.2
            }
        };
        this.loadFeedbackData();
    }

    // Load feedback data from Chrome storage
    async loadFeedbackData() {
        try {
            const result = await chrome.storage.local.get(['feedbackData', 'userPreferences']);
            if (result.feedbackData) {
                this.feedbackData = result.feedbackData;
            }
            if (result.userPreferences) {
                this.userPreferences = { ...this.userPreferences, ...result.userPreferences };
            }
        } catch (error) {
            console.error('Error loading feedback data:', error);
        }
    }

    // Save feedback data to Chrome storage
    async saveFeedbackData() {
        try {
            await chrome.storage.local.set({
                feedbackData: this.feedbackData,
                userPreferences: this.userPreferences
            });
        } catch (error) {
            console.error('Error saving feedback data:', error);
        }
    }

    // Collect user feedback for a generated output
    async collectFeedback(outputData, feedbackInput) {
        try {
            // Validate input data
            if (!outputData || !feedbackInput) {
                throw new Error('Missing required feedback data');
            }

            const feedback = {
                id: this.generateId(),
                timestamp: Date.now(),
                prompt: outputData.prompt || '',
                schema: outputData.schema || 'unknown',
                generatedJson: outputData.json || '',
                provider: outputData.provider || 'unknown',
                model: outputData.model || 'unknown',
                rating: feedbackInput.rating || 3, // 1-5 stars
                thumbsUp: feedbackInput.thumbsUp || false, // boolean
                aspects: {
                    accuracy: feedbackInput.accuracy || 3,
                    completeness: feedbackInput.completeness || 3,
                    structure: feedbackInput.structure || 3,
                    relevance: feedbackInput.relevance || 3
                },
                textFeedback: feedbackInput.textFeedback || '',
                isPreferred: feedbackInput.isPreferred || false,
                tags: this.extractTags(outputData.prompt || '', outputData.json || '', feedbackInput.textFeedback || '')
            };

            this.feedbackData.push(feedback);
            await this.saveFeedbackData();

            // Update user preferences based on feedback
            this.updatePreferences(feedback);

            return feedback;
        } catch (error) {
            console.error('Error collecting feedback:', error);
            throw error;
        }
    }

    // Extract tags from prompt and JSON for pattern recognition
    extractTags(prompt, json, textFeedback = '') {
        const tags = [];

        // Extract prompt keywords
        const promptWords = prompt.toLowerCase().match(/\b\w+\b/g) || [];
        const commonKeywords = ['function', 'api', 'user', 'data', 'validate', 'create', 'process', 'algorithm', 'code', 'implementation'];
        tags.push(...promptWords.filter(word => commonKeywords.includes(word)));

        // Extract programming language and algorithm keywords
        const programmingKeywords = ['java', 'python', 'javascript', 'c++', 'fibonacci', 'sorting', 'search', 'tree', 'graph'];
        tags.push(...promptWords.filter(word => programmingKeywords.includes(word)));

        // Extract suggestions from text feedback
        if (textFeedback) {
            const feedbackWords = textFeedback.toLowerCase().match(/\b\w+\b/g) || [];
            const suggestionKeywords = ['brute', 'force', 'optimal', 'efficient', 'complexity', 'time', 'space', 'approach', 'method', 'algorithm'];
            const suggestions = feedbackWords.filter(word => suggestionKeywords.includes(word));
            tags.push(...suggestions.map(word => `suggestion:${word}`));

            // Detect specific improvement suggestions
            if (textFeedback.includes('brute force') || textFeedback.includes('optimal')) {
                tags.push('suggestion:include-approaches');
            }
            if (textFeedback.includes('complexity')) {
                tags.push('suggestion:include-complexity');
            }
            if (textFeedback.includes('example') || textFeedback.includes('sample')) {
                tags.push('suggestion:include-examples');
            }
        }

        // Extract JSON structure patterns
        try {
            const parsed = JSON.parse(json);
            if (parsed.type) tags.push(`type:${parsed.type}`);
            if (parsed.properties) tags.push('has-properties');
            if (parsed.required) tags.push('has-required');
            if (parsed.parameters) tags.push('has-parameters');
        } catch (e) {
            // Ignore parsing errors
        }

        return [...new Set(tags)]; // Remove duplicates
    }

    // Update user preferences based on feedback
    updatePreferences(feedback) {
        const weight = this.calculateFeedbackWeight(feedback);
        
        // Update aspect preferences
        Object.keys(feedback.aspects).forEach(aspect => {
            const score = feedback.aspects[aspect];
            if (score >= 4) {
                // Positive feedback - reinforce patterns
                this.reinforcePattern(feedback, aspect, weight);
            } else if (score <= 2) {
                // Negative feedback - avoid patterns
                this.avoidPattern(feedback, aspect, weight);
            }
        });

        // Update preferred structures for high-rated outputs
        if (feedback.rating >= 4 || feedback.thumbsUp) {
            this.updatePreferredStructures(feedback);
        }
    }

    // Calculate weight for feedback based on recency and rating
    calculateFeedbackWeight(feedback) {
        const ageInDays = (Date.now() - feedback.timestamp) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.exp(-ageInDays / 30); // Exponential decay over 30 days
        const ratingWeight = feedback.rating / 5;
        return recencyWeight * ratingWeight;
    }

    // Reinforce successful patterns
    reinforcePattern(feedback, aspect, weight) {
        const key = `${feedback.schema}_${aspect}`;
        if (!this.userPreferences.preferredStructures[key]) {
            this.userPreferences.preferredStructures[key] = { score: 0, count: 0 };
        }
        
        this.userPreferences.preferredStructures[key].score += weight;
        this.userPreferences.preferredStructures[key].count += 1;
        this.userPreferences.preferredStructures[key].tags = feedback.tags;
    }

    // Mark patterns to avoid
    avoidPattern(feedback, aspect, weight) {
        const key = `${feedback.schema}_${aspect}_avoid`;
        if (!this.userPreferences.preferredStructures[key]) {
            this.userPreferences.preferredStructures[key] = { score: 0, count: 0 };
        }
        
        this.userPreferences.preferredStructures[key].score += weight;
        this.userPreferences.preferredStructures[key].count += 1;
        this.userPreferences.preferredStructures[key].tags = feedback.tags;
    }

    // Update preferred structures based on positive feedback
    updatePreferredStructures(feedback) {
        try {
            // Safely parse JSON structure for analysis
            let parsed;
            try {
                parsed = JSON.parse(feedback.generatedJson);
            } catch (parseError) {
                console.warn('Could not parse JSON for structure analysis:', parseError);
                // Create a basic structure representation
                parsed = { raw: feedback.generatedJson };
            }

            const structure = this.analyzeStructure(parsed);

            const key = `${feedback.schema}_structure`;
            if (!this.userPreferences.preferredStructures[key]) {
                this.userPreferences.preferredStructures[key] = [];
            }

            this.userPreferences.preferredStructures[key].push({
                structure,
                rating: feedback.rating,
                timestamp: feedback.timestamp,
                tags: feedback.tags
            });

            // Keep only top 10 preferred structures
            this.userPreferences.preferredStructures[key] =
                this.userPreferences.preferredStructures[key]
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 10);

        } catch (error) {
            console.error('Error updating preferred structures:', error);
        }
    }

    // Analyze JSON structure for pattern recognition
    analyzeStructure(obj, depth = 0) {
        if (depth > 3) return 'deep-nested';

        // Handle null or undefined
        if (obj === null || obj === undefined) {
            return { type: 'null', keys: [], patterns: [] };
        }

        const structure = {
            type: typeof obj,
            keys: [],
            patterns: []
        };

        try {
            if (typeof obj === 'object' && obj !== null) {
                if (Array.isArray(obj)) {
                    structure.type = 'array';
                    structure.length = obj.length;
                    if (obj.length > 0) {
                        structure.itemType = typeof obj[0];
                    }
                } else {
                    structure.keys = Object.keys(obj);
                    structure.keyCount = structure.keys.length;

                    // Identify common patterns
                    if (structure.keys.includes('type')) structure.patterns.push('has-type');
                    if (structure.keys.includes('properties')) structure.patterns.push('has-properties');
                    if (structure.keys.includes('required')) structure.patterns.push('has-required');
                    if (structure.keys.includes('parameters')) structure.patterns.push('has-parameters');
                    if (structure.keys.includes('description')) structure.patterns.push('has-description');
                }
            }
        } catch (error) {
            console.warn('Error analyzing structure:', error);
            structure.type = 'unknown';
        }

        return structure;
    }

    // Generate unique ID for feedback entries
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get feedback statistics for dashboard
    getFeedbackStats() {
        const stats = {
            totalFeedback: this.feedbackData.length,
            averageRating: 0,
            thumbsUpPercentage: 0,
            aspectAverages: {
                accuracy: 0,
                completeness: 0,
                structure: 0,
                relevance: 0
            },
            topTags: {},
            recentTrends: []
        };

        if (this.feedbackData.length === 0) return stats;

        // Calculate averages
        const totalRating = this.feedbackData.reduce((sum, f) => sum + f.rating, 0);
        stats.averageRating = totalRating / this.feedbackData.length;

        const thumbsUpCount = this.feedbackData.filter(f => f.thumbsUp).length;
        stats.thumbsUpPercentage = (thumbsUpCount / this.feedbackData.length) * 100;

        // Calculate aspect averages
        Object.keys(stats.aspectAverages).forEach(aspect => {
            const total = this.feedbackData.reduce((sum, f) => sum + (f.aspects[aspect] || 3), 0);
            stats.aspectAverages[aspect] = total / this.feedbackData.length;
        });

        // Count tags
        this.feedbackData.forEach(feedback => {
            feedback.tags.forEach(tag => {
                stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
            });
        });

        // Recent trends (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentFeedback = this.feedbackData.filter(f => f.timestamp > thirtyDaysAgo);
        
        if (recentFeedback.length > 0) {
            const recentAverage = recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length;
            stats.recentTrends.push({
                period: 'last30days',
                averageRating: recentAverage,
                count: recentFeedback.length
            });
        }

        return stats;
    }

    // Get personalized recommendations for prompt enhancement
    getPromptRecommendations(currentPrompt, schema) {
        const recommendations = [];

        // Find similar successful prompts
        const similarFeedback = this.findSimilarPrompts(currentPrompt, schema);
        const highRatedFeedback = similarFeedback.filter(f => f.rating >= 4);

        if (highRatedFeedback.length > 0) {
            recommendations.push({
                type: 'similar_success',
                message: 'Based on similar high-rated prompts, consider adding more specific details',
                examples: highRatedFeedback.slice(0, 3).map(f => f.prompt)
            });
        }

        // Extract suggestions from user text feedback
        const textFeedbackSuggestions = this.extractTextFeedbackSuggestions(currentPrompt, schema);
        recommendations.push(...textFeedbackSuggestions);

        // Check for preferred patterns
        const preferredKey = `${schema}_structure`;
        if (this.userPreferences.preferredStructures[preferredKey]) {
            recommendations.push({
                type: 'preferred_structure',
                message: 'Your preferred structure patterns suggest including these elements',
                patterns: this.userPreferences.preferredStructures[preferredKey].slice(0, 3)
            });
        }

        // Add algorithm-specific recommendations for programming prompts
        if (this.isProgrammingPrompt(currentPrompt)) {
            recommendations.push(...this.getProgrammingRecommendations(currentPrompt, schema));
        }

        return recommendations;
    }

    // Find prompts similar to the current one
    findSimilarPrompts(currentPrompt, schema) {
        const currentWords = currentPrompt.toLowerCase().match(/\b\w+\b/g) || [];
        
        return this.feedbackData
            .filter(f => f.schema === schema)
            .map(feedback => {
                const feedbackWords = feedback.prompt.toLowerCase().match(/\b\w+\b/g) || [];
                const commonWords = currentWords.filter(word => feedbackWords.includes(word));
                const similarity = commonWords.length / Math.max(currentWords.length, feedbackWords.length);
                
                return { ...feedback, similarity };
            })
            .filter(f => f.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity);
    }

    // Export feedback data for analysis
    exportFeedbackData() {
        return {
            feedbackData: this.feedbackData,
            userPreferences: this.userPreferences,
            stats: this.getFeedbackStats(),
            exportDate: new Date().toISOString()
        };
    }

    // Clear all feedback data
    async clearFeedbackData() {
        this.feedbackData = [];
        this.userPreferences = {
            preferredStructures: {},
            namingConventions: {},
            complexityLevel: 'medium',
            detailLevel: 'standard',
            weights: {
                accuracy: 0.3,
                completeness: 0.25,
                structure: 0.25,
                relevance: 0.2
            }
        };
        await this.saveFeedbackData();
    }

    // Extract suggestions from user text feedback
    extractTextFeedbackSuggestions(currentPrompt, schema) {
        const suggestions = [];
        const relevantFeedback = this.feedbackData.filter(f =>
            f.schema === schema &&
            f.textFeedback &&
            f.textFeedback.trim().length > 0
        );

        // Group suggestions by common themes
        const suggestionThemes = {};

        relevantFeedback.forEach(feedback => {
            const tags = feedback.tags || [];
            const suggestionTags = tags.filter(tag => tag.startsWith('suggestion:'));

            suggestionTags.forEach(tag => {
                const suggestion = tag.replace('suggestion:', '');
                if (!suggestionThemes[suggestion]) {
                    suggestionThemes[suggestion] = {
                        count: 0,
                        examples: [],
                        feedbackTexts: []
                    };
                }
                suggestionThemes[suggestion].count++;
                suggestionThemes[suggestion].examples.push(feedback.prompt);
                suggestionThemes[suggestion].feedbackTexts.push(feedback.textFeedback);
            });
        });

        // Convert themes to recommendations
        Object.entries(suggestionThemes).forEach(([theme, data]) => {
            if (data.count >= 1) { // At least one suggestion
                let message = '';
                let type = 'user_suggestion';

                switch (theme) {
                    case 'include-approaches':
                        message = 'Consider asking for both brute force and optimal approaches in the function description';
                        type = 'algorithm_approaches';
                        break;
                    case 'include-complexity':
                        message = 'Include time and space complexity analysis in the function parameters';
                        type = 'complexity_analysis';
                        break;
                    case 'include-examples':
                        message = 'Add example inputs and outputs to make the function more comprehensive';
                        type = 'include_examples';
                        break;
                    case 'brute':
                    case 'force':
                    case 'optimal':
                        message = 'Based on your feedback, include parameters for different algorithmic approaches';
                        type = 'algorithmic_approaches';
                        break;
                    default:
                        message = `Based on your previous feedback: "${data.feedbackTexts[0]}"`;
                        break;
                }

                suggestions.push({
                    type: type,
                    message: message,
                    examples: data.examples.slice(0, 2),
                    count: data.count
                });
            }
        });

        return suggestions;
    }

    // Check if prompt is programming-related
    isProgrammingPrompt(prompt) {
        const programmingKeywords = [
            'code', 'function', 'algorithm', 'java', 'python', 'javascript',
            'c++', 'programming', 'implement', 'fibonacci', 'sorting', 'search'
        ];
        const promptLower = prompt.toLowerCase();
        return programmingKeywords.some(keyword => promptLower.includes(keyword));
    }

    // Get programming-specific recommendations
    getProgrammingRecommendations(currentPrompt, schema) {
        const recommendations = [];
        const promptLower = currentPrompt.toLowerCase();

        // Algorithm-specific recommendations
        if (promptLower.includes('fibonacci') || promptLower.includes('algorithm')) {
            recommendations.push({
                type: 'algorithm_enhancement',
                message: 'For algorithm problems, consider including parameters for implementation approach (brute force vs optimal)',
                examples: ['approach_type: "brute_force" | "optimal" | "both"']
            });
        }

        // Code generation recommendations
        if (promptLower.includes('code') || promptLower.includes('implement')) {
            recommendations.push({
                type: 'code_enhancement',
                message: 'For code generation, include parameters for complexity analysis and examples',
                examples: [
                    'include_complexity: boolean',
                    'include_examples: boolean',
                    'code_style: "verbose" | "concise"'
                ]
            });
        }

        return recommendations;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackManager;
}
