// PromptStruct Popup JavaScript

class PromptStruct {
    constructor() {
        this.settings = {};
        this.currentTheme = 'light';
        this.feedbackManager = new FeedbackManager();
        this.currentOutputData = null;
        this.feedbackRatings = {
            overall: 0,
            accuracy: 3,
            completeness: 3,
            structure: 3,
            relevance: 3
        };
        this.init();
    }

    // Force text visibility fix
    forceTextVisibility() {
        // Force text color for all input elements
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.setProperty('color', '#1a202c', 'important');
            input.style.setProperty('-webkit-text-fill-color', '#1a202c', 'important');
            input.style.setProperty('opacity', '1', 'important');
        });

        // Specific fix for promptInput
        const promptInput = document.getElementById('promptInput');
        if (promptInput) {
            promptInput.style.setProperty('color', '#1a202c', 'important');
            promptInput.style.setProperty('-webkit-text-fill-color', '#1a202c', 'important');
            promptInput.style.setProperty('opacity', '1', 'important');
            promptInput.style.setProperty('font-weight', '500', 'important');
        }

        // Check for dark theme and adjust accordingly
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            inputs.forEach(input => {
                input.style.setProperty('color', '#f7fafc', 'important');
                input.style.setProperty('-webkit-text-fill-color', '#f7fafc', 'important');
            });
            if (promptInput) {
                promptInput.style.setProperty('color', '#f7fafc', 'important');
                promptInput.style.setProperty('-webkit-text-fill-color', '#f7fafc', 'important');
            }
        }
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
        this.loadSchemaPreference();
        this.updateUsageDisplay();
        this.initializeFeedbackSystem();
        await this.setupArtisticModeIndicator();

        // Force text visibility after everything is loaded
        setTimeout(() => {
            this.forceTextVisibility();
        }, 100);
    }

    // Get the current API key based on selected provider
    getCurrentApiKey() {
        switch (this.settings.provider) {
            case 'openai':
                return this.settings.openaiApiKey;
            case 'anthropic':
                return this.settings.anthropicApiKey;
            case 'groq':
                return this.settings.groqApiKey;
            default:
                return '';
        }
    }

    // Load settings from Chrome storage
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'openaiApiKey', 'anthropicApiKey', 'groqApiKey', 'provider', 'model', 'temperature', 'theme', 'saveHistory', 'schemaPreference'
            ]);

            this.settings = {
                openaiApiKey: result.openaiApiKey || '',
                anthropicApiKey: result.anthropicApiKey || '',
                groqApiKey: result.groqApiKey || '',
                provider: result.provider || 'openai',
                model: result.model || 'gpt-4',
                temperature: result.temperature || 0.3,
                theme: result.theme || 'light',
                saveHistory: result.saveHistory !== false,
                schemaPreference: result.schemaPreference || 'openai-function'
            };

            this.currentTheme = this.settings.theme;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Save settings to Chrome storage
    async saveSettings() {
        try {
            await chrome.storage.sync.set(this.settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // History modal
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.openHistory();
        });

        document.getElementById('closeHistory').addEventListener('click', () => {
            this.closeHistory();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // Comparison modal
        document.getElementById('closeComparison').addEventListener('click', () => {
            this.closeComparison();
        });

        // Batch modal
        document.getElementById('closeBatch').addEventListener('click', () => {
            this.closeBatch();
        });

        document.getElementById('processBatch').addEventListener('click', () => {
            this.processBatch();
        });

        // Templates modal
        document.getElementById('closeTemplates').addEventListener('click', () => {
            this.closeTemplates();
        });

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            console.log('Settings button clicked!');
            this.openSettings();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettingsFromModal();
        });

        // Provider change handler
        document.getElementById('provider').addEventListener('change', () => {
            this.updateModelOptions();
        });

        // Temperature slider handler
        document.getElementById('temperature').addEventListener('input', (e) => {
            document.getElementById('temperatureValue').textContent = e.target.value;
        });

        // Main functionality
        document.getElementById('convertBtn').addEventListener('click', () => {
            this.convertPrompt();
        });

        document.getElementById('compareBtn').addEventListener('click', () => {
            this.compareModels();
        });

        document.getElementById('optimizeBtn').addEventListener('click', () => {
            this.optimizePrompt();
        });

        document.getElementById('templatesBtn').addEventListener('click', () => {
            this.openTemplates();
        });

        document.getElementById('batchBtn').addEventListener('click', () => {
            this.openBatch();
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportJSON();
        });

        // Usage tracking
        document.getElementById('clearUsage').addEventListener('click', () => {
            this.clearUsageStats();
        });

        // Schema selector
        document.getElementById('schemaSelect').addEventListener('change', (e) => {
            this.settings.schemaPreference = e.target.value;
            this.saveSettings();
            this.showSchemaPreview(e.target.value);
        });

        // Close modal when clicking outside
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });

        // Enter key in prompt input
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.convertPrompt();
            }
        });

        // Enhance Prompt button
        document.getElementById('enhancePromptBtn').addEventListener('click', () => {
            this.openPromptEnhancement();
        });

        // Personalization Dashboard button
        document.getElementById('personalizationBtn').addEventListener('click', () => {
            this.openPersonalizationDashboard();
        });

        // Prompt Enhancement Modal
        document.getElementById('closeEnhancement').addEventListener('click', () => {
            this.closePromptEnhancement();
        });

        document.getElementById('acceptEnhancement').addEventListener('click', () => {
            this.acceptEnhancedPrompt();
        });

        document.getElementById('modifyEnhancement').addEventListener('click', () => {
            this.modifyEnhancedPrompt();
        });

        document.getElementById('rejectEnhancement').addEventListener('click', () => {
            this.closePromptEnhancement();
        });

        // Personalization Dashboard Modal
        document.getElementById('closePersonalization').addEventListener('click', () => {
            this.closePersonalizationDashboard();
        });
    }

    // Theme management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.settings.theme = this.currentTheme;
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';

        // Force text visibility after theme change
        setTimeout(() => {
            this.forceTextVisibility();
        }, 50);
    }

    // Initialize feedback system
    initializeFeedbackSystem() {
        // Feedback quick actions
        document.getElementById('thumbsUp').addEventListener('click', () => {
            this.handleQuickFeedback(true);
        });

        document.getElementById('thumbsDown').addEventListener('click', () => {
            this.handleQuickFeedback(false);
        });

        document.getElementById('markPreferred').addEventListener('click', () => {
            this.markAsPreferred();
        });

        // Detailed feedback toggle
        document.getElementById('toggleDetailedFeedback').addEventListener('click', () => {
            this.toggleDetailedFeedback();
        });

        // Star ratings
        this.initializeStarRatings();

        // Feedback submission
        document.getElementById('submitFeedback').addEventListener('click', () => {
            this.submitDetailedFeedback();
        });

        document.getElementById('cancelFeedback').addEventListener('click', () => {
            this.hideFeedbackSection();
        });
    }

    // Initialize star rating interactions
    initializeStarRatings() {
        const starRatings = document.querySelectorAll('.star-rating');

        starRatings.forEach(rating => {
            const stars = rating.querySelectorAll('.star');
            const aspect = rating.dataset.aspect || 'overall';

            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    this.setStarRating(aspect, index + 1);
                    this.updateStarDisplay(rating, index + 1);
                });

                star.addEventListener('mouseenter', () => {
                    this.highlightStars(rating, index + 1);
                });
            });

            rating.addEventListener('mouseleave', () => {
                const currentRating = this.feedbackRatings[aspect];
                this.updateStarDisplay(rating, currentRating);
            });
        });
    }

    // Set star rating for an aspect
    setStarRating(aspect, rating) {
        this.feedbackRatings[aspect] = rating;
    }

    // Update star display
    updateStarDisplay(ratingElement, rating) {
        const stars = ratingElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Highlight stars on hover
    highlightStars(ratingElement, rating) {
        const stars = ratingElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#fbbf24';
            } else {
                star.style.color = 'var(--border-color)';
            }
        });
    }

    // Handle quick feedback (thumbs up/down)
    handleQuickFeedback(isPositive) {
        if (!this.currentOutputData) return;

        const thumbsUpBtn = document.getElementById('thumbsUp');
        const thumbsDownBtn = document.getElementById('thumbsDown');

        // Reset button states
        thumbsUpBtn.classList.remove('active');
        thumbsDownBtn.classList.remove('active');

        // Set active state
        if (isPositive) {
            thumbsUpBtn.classList.add('active');
        } else {
            thumbsDownBtn.classList.add('active');
        }

        // Submit quick feedback
        const feedbackData = {
            rating: isPositive ? 4 : 2,
            thumbsUp: isPositive,
            accuracy: isPositive ? 4 : 2,
            completeness: isPositive ? 4 : 2,
            structure: isPositive ? 4 : 2,
            relevance: isPositive ? 4 : 2,
            textFeedback: '',
            isPreferred: false
        };

        this.submitFeedback(feedbackData);
        this.showNotification(isPositive ? 'Thanks for the positive feedback!' : 'Thanks for the feedback. We\'ll improve!', 'success');
    }

    // Mark output as preferred
    markAsPreferred() {
        if (!this.currentOutputData) return;

        const preferredBtn = document.getElementById('markPreferred');
        const isPreferred = !preferredBtn.classList.contains('active');

        if (isPreferred) {
            preferredBtn.classList.add('active');
        } else {
            preferredBtn.classList.remove('active');
        }

        const feedbackData = {
            rating: 5,
            thumbsUp: true,
            accuracy: 5,
            completeness: 5,
            structure: 5,
            relevance: 5,
            textFeedback: 'Marked as preferred example',
            isPreferred: isPreferred
        };

        this.submitFeedback(feedbackData);
        this.showNotification(isPreferred ? 'Marked as preferred example!' : 'Removed from preferred examples', 'success');
    }

    // Toggle detailed feedback section
    toggleDetailedFeedback() {
        const detailedSection = document.getElementById('feedbackDetailed');
        const toggleBtn = document.getElementById('toggleDetailedFeedback');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');

        if (detailedSection.style.display === 'none') {
            detailedSection.style.display = 'block';
            toggleBtn.classList.add('expanded');
            toggleIcon.textContent = '▲';
        } else {
            detailedSection.style.display = 'none';
            toggleBtn.classList.remove('expanded');
            toggleIcon.textContent = '▼';
        }
    }

    // Submit detailed feedback
    async submitDetailedFeedback() {
        if (!this.currentOutputData) return;

        const textFeedback = document.getElementById('feedbackComment').value;

        const feedbackData = {
            rating: this.feedbackRatings.overall,
            thumbsUp: this.feedbackRatings.overall >= 4,
            accuracy: this.feedbackRatings.accuracy,
            completeness: this.feedbackRatings.completeness,
            structure: this.feedbackRatings.structure,
            relevance: this.feedbackRatings.relevance,
            textFeedback: textFeedback,
            isPreferred: document.getElementById('markPreferred').classList.contains('active')
        };

        await this.submitFeedback(feedbackData);
        this.hideFeedbackSection();
        this.showNotification('Thank you for your detailed feedback!', 'success');
    }

    // Submit feedback to the feedback manager
    async submitFeedback(feedbackData) {
        try {
            await this.feedbackManager.collectFeedback(this.currentOutputData, feedbackData);

            // Update UI to reflect feedback submission
            this.updateFeedbackUI();

        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showNotification('Error submitting feedback', 'error');
        }
    }

    // Update feedback UI after submission
    updateFeedbackUI() {
        // Disable feedback buttons temporarily
        const feedbackSection = document.getElementById('feedbackSection');
        const buttons = feedbackSection.querySelectorAll('button');

        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });

        // Re-enable after 2 seconds
        setTimeout(() => {
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
        }, 2000);
    }

    // Show feedback section
    showFeedbackSection(outputData) {
        this.currentOutputData = outputData;
        const feedbackSection = document.getElementById('feedbackSection');
        feedbackSection.style.display = 'block';

        // Reset feedback state
        this.resetFeedbackState();
    }

    // Hide feedback section
    hideFeedbackSection() {
        const feedbackSection = document.getElementById('feedbackSection');
        feedbackSection.style.display = 'none';
        this.resetFeedbackState();
    }

    // Reset feedback state
    resetFeedbackState() {
        // Reset ratings
        this.feedbackRatings = {
            overall: 0,
            accuracy: 3,
            completeness: 3,
            structure: 3,
            relevance: 3
        };

        // Reset UI
        document.querySelectorAll('.feedback-thumb-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('markPreferred').classList.remove('active');
        document.getElementById('feedbackComment').value = '';
        document.getElementById('feedbackDetailed').style.display = 'none';

        // Reset star ratings
        document.querySelectorAll('.star-rating').forEach(rating => {
            const aspect = rating.dataset.aspect || 'overall';
            this.updateStarDisplay(rating, this.feedbackRatings[aspect]);
        });
    }

    // Prompt Enhancement functionality
    async openPromptEnhancement() {
        const promptInput = document.getElementById('promptInput');
        const currentPrompt = promptInput.value.trim();

        if (!currentPrompt) {
            this.showNotification('Please enter a prompt to enhance.', 'error');
            return;
        }

        const modal = document.getElementById('promptEnhancementModal');
        const originalDisplay = document.getElementById('originalPromptDisplay');
        const enhancedDisplay = document.getElementById('enhancedPromptDisplay');
        const loadingDiv = document.getElementById('enhancementLoading');
        const recommendationsDiv = document.getElementById('enhancementRecommendations');

        // Show modal and set original prompt
        modal.style.display = 'flex';
        originalDisplay.textContent = currentPrompt;
        enhancedDisplay.style.display = 'none';
        loadingDiv.style.display = 'block';

        // Add artistic mode styling if applicable
        const tabInfo = await this.getCurrentTabInfo();
        if (tabInfo.category !== 'general') {
            modal.classList.add('artistic-mode');
            modal.classList.add(`${tabInfo.category}-mode`);
        }

        try {
            // Get recommendations from feedback manager
            const schema = document.getElementById('schemaSelect').value;
            const recommendations = this.feedbackManager.getPromptRecommendations(currentPrompt, schema);

            // Generate enhanced prompt using AI
            const enhancedPrompt = await this.generateEnhancedPrompt(currentPrompt);

            // Display results
            loadingDiv.style.display = 'none';
            enhancedDisplay.style.display = 'block';
            enhancedDisplay.textContent = enhancedPrompt;

            // Show recommendations
            this.displayEnhancementRecommendations(recommendations, recommendationsDiv);

            // Store for later use
            this.enhancedPromptText = enhancedPrompt;

        } catch (error) {
            console.error('Error enhancing prompt:', error);
            loadingDiv.style.display = 'none';
            enhancedDisplay.style.display = 'block';
            enhancedDisplay.textContent = 'Error generating enhanced prompt. Please try again.';
            this.showNotification('Failed to enhance prompt', 'error');
        }
    }

    // Generate enhanced prompt using AI
    async generateEnhancedPrompt(originalPrompt) {
        const apiKey = this.getCurrentApiKey();
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        // Get current tab info for artistic context
        const tabInfo = await this.getCurrentTabInfo();

        // Call AI API to enhance the prompt
        const response = await chrome.runtime.sendMessage({
            action: 'enhancePrompt',
            data: {
                prompt: originalPrompt,
                apiKey: apiKey,
                provider: this.settings.provider,
                currentSite: tabInfo.site,
                creativeCategory: tabInfo.category
            }
        });

        if (response.success) {
            // Return the enhanced prompt directly
            return response.data.enhancedPrompt || originalPrompt;
        } else {
            throw new Error(response.error);
        }
    }

    // Setup artistic mode indicator
    async setupArtisticModeIndicator() {
        const tabInfo = await this.getCurrentTabInfo();
        const schemaSelector = document.querySelector('.schema-selector');

        if (tabInfo.category !== 'general' && tabInfo.site) {
            // Add artistic mode indicator
            const indicator = document.createElement('div');
            indicator.className = `artistic-mode-indicator ${tabInfo.category}-mode`;
            indicator.innerHTML = `
                <span>${this.getArtisticIcon(tabInfo.category)}</span>
                <span>${tabInfo.category.toUpperCase()} MODE</span>
            `;

            // Insert after schema selector
            if (schemaSelector) {
                schemaSelector.appendChild(indicator);
            }

            // Auto-select appropriate schema
            const schemaSelect = document.getElementById('schemaSelect');
            if (schemaSelect) {
                const schemaMap = {
                    'image': 'text-to-image',
                    'video': 'text-to-video',
                    'audio': 'text-to-audio',
                    'text': 'creative-writing'
                };

                const suggestedSchema = schemaMap[tabInfo.category];
                if (suggestedSchema) {
                    schemaSelect.value = suggestedSchema;
                }
            }
        }
    }

    // Get artistic icon for category
    getArtisticIcon(category) {
        const icons = {
            'image': '🖼️',
            'video': '🎬',
            'audio': '🎵',
            'text': '✍️',
            'general': '🎨'
        };
        return icons[category] || icons.general;
    }

    // Get current tab information for artistic context
    async getCurrentTabInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = new URL(tab.url);
            const hostname = url.hostname;
            const pathname = url.pathname;
            const fullUrl = hostname + pathname;

            // Check for specific URL patterns first (same as content script)
            const urlPatterns = {
                // Leonardo AI specific paths
                'app.leonardo.ai/image-generation': 'Leonardo AI',
                'app.leonardo.ai/ai-canvas': 'Leonardo AI',
                'app.leonardo.ai/finetuned-models': 'Leonardo AI',

                // Runway specific paths
                'app.runwayml.com/video-tools': 'Runway',
                'app.runwayml.com/ai-tools': 'Runway',

                // Suno AI specific paths
                'app.suno.ai/create': 'Suno AI',
                'suno.com/create': 'Suno AI',

                // ElevenLabs specific paths
                'elevenlabs.io/speech-synthesis': 'ElevenLabs',
                'beta.elevenlabs.io/speech-synthesis': 'ElevenLabs'
            };

            // Check URL patterns first
            for (const [pattern, site] of Object.entries(urlPatterns)) {
                if (fullUrl.includes(pattern)) {
                    const categoryMap = {
                        'Leonardo AI': 'image',
                        'Runway': 'video',
                        'Suno AI': 'audio',
                        'ElevenLabs': 'audio'
                    };
                    const category = categoryMap[site] || 'general';
                    return { site, category, hostname, fullUrl };
                }
            }

            // Fallback to hostname mapping
            const siteMap = {
                // Traditional AI Chat Sites
                'chatgpt.com': 'ChatGPT',
                'claude.ai': 'Claude',
                'gemini.google.com': 'Gemini',
                'grok.com': 'Grok',

                // Image Generation
                'midjourney.com': 'Midjourney',
                'www.midjourney.com': 'Midjourney',
                'firefly.adobe.com': 'Adobe Firefly',
                'leonardo.ai': 'Leonardo AI',
                'app.leonardo.ai': 'Leonardo AI',
                'playground.ai': 'Playground AI',
                'ideogram.ai': 'Ideogram',
                'flux1.ai': 'Flux AI',

                // Video Generation
                'synthesia.io': 'Synthesia',
                'runwayml.com': 'Runway',
                'app.runwayml.com': 'Runway',
                'pika.art': 'Pika Labs',
                'luma.ai': 'Luma AI',
                'haiper.ai': 'Haiper',

                // Audio Generation
                'suno.com': 'Suno AI',
                'app.suno.ai': 'Suno AI',
                'elevenlabs.io': 'ElevenLabs',
                'beta.elevenlabs.io': 'ElevenLabs',
                'mubert.com': 'Mubert',
                'soundraw.io': 'Soundraw'
            };

            const site = siteMap[hostname] || null;

            // Category mapping
            const categoryMap = {
                'Midjourney': 'image',
                'Adobe Firefly': 'image',
                'Leonardo AI': 'image',
                'Playground AI': 'image',
                'Ideogram': 'image',
                'Synthesia': 'video',
                'Runway': 'video',
                'Pika Labs': 'video',
                'Luma AI': 'video',
                'Suno AI': 'audio',
                'ElevenLabs': 'audio'
            };

            const category = categoryMap[site] || 'general';

            return { site, category, hostname };
        } catch (error) {
            console.error('Error getting tab info:', error);
            return { site: null, category: 'general', hostname: null };
        }
    }

    // Create enhancement prompt based on feedback and recommendations
    createEnhancementPrompt(originalPrompt, schema, recommendations) {
        let enhancementPrompt = `Please enhance the following prompt to generate better ${schema} schemas. `;

        if (recommendations.length > 0) {
            enhancementPrompt += `Based on user feedback and successful patterns:\n\n`;

            recommendations.forEach(rec => {
                enhancementPrompt += `- ${rec.message}\n`;
                if (rec.examples && rec.examples.length > 0) {
                    enhancementPrompt += `  Examples: ${rec.examples.slice(0, 2).join(', ')}\n`;
                }

                // Add specific guidance for different recommendation types
                switch (rec.type) {
                    case 'algorithm_approaches':
                    case 'algorithmic_approaches':
                        enhancementPrompt += `  → Add parameters to specify implementation approaches (brute force, optimal, or both)\n`;
                        break;
                    case 'complexity_analysis':
                        enhancementPrompt += `  → Include parameters for time and space complexity analysis\n`;
                        break;
                    case 'include_examples':
                        enhancementPrompt += `  → Add parameters for including example inputs and outputs\n`;
                        break;
                    case 'code_enhancement':
                        enhancementPrompt += `  → Include parameters for code style and complexity analysis\n`;
                        break;
                }
            });
        }

        // Add specific guidance for programming prompts
        if (this.isProgrammingPrompt(originalPrompt)) {
            enhancementPrompt += `\nFor programming/algorithm prompts, ensure the enhanced prompt includes:\n`;
            enhancementPrompt += `- Parameters for different implementation approaches\n`;
            enhancementPrompt += `- Options for complexity analysis\n`;
            enhancementPrompt += `- Parameters for including examples and explanations\n`;
        }

        enhancementPrompt += `\nOriginal prompt: "${originalPrompt}"\n\n`;
        enhancementPrompt += `Please provide an enhanced version that incorporates the above suggestions and is more specific, detailed, and likely to generate high-quality ${schema} schemas. `;
        enhancementPrompt += `The enhanced prompt should ask for the specific elements mentioned in the recommendations. `;
        enhancementPrompt += `Return only the enhanced prompt text, no additional formatting or explanation.`;

        return enhancementPrompt;
    }

    // Helper method to check if prompt is programming-related
    isProgrammingPrompt(prompt) {
        const programmingKeywords = [
            'code', 'function', 'algorithm', 'java', 'python', 'javascript',
            'c++', 'programming', 'implement', 'fibonacci', 'sorting', 'search'
        ];
        const promptLower = prompt.toLowerCase();
        return programmingKeywords.some(keyword => promptLower.includes(keyword));
    }

    // Display enhancement recommendations
    displayEnhancementRecommendations(recommendations, container) {
        if (recommendations.length === 0) {
            container.innerHTML = '<p>No specific recommendations available yet. Generate more outputs and provide feedback to improve suggestions.</p>';
            return;
        }

        let html = '<h4>💡 Enhancement Recommendations</h4><ul>';
        recommendations.forEach(rec => {
            html += `<li><strong>${rec.type.replace('_', ' ')}:</strong> ${rec.message}</li>`;
        });
        html += '</ul>';

        container.innerHTML = html;
    }

    // Accept enhanced prompt
    acceptEnhancedPrompt() {
        if (this.enhancedPromptText) {
            document.getElementById('promptInput').value = this.enhancedPromptText;
            this.closePromptEnhancement();
            this.showNotification('Enhanced prompt applied!', 'success');
        }
    }

    // Modify enhanced prompt
    modifyEnhancedPrompt() {
        if (this.enhancedPromptText) {
            // Create a textarea for editing
            const enhancedDisplay = document.getElementById('enhancedPromptDisplay');
            const currentText = this.enhancedPromptText;

            enhancedDisplay.innerHTML = `
                <textarea id="enhancedPromptEditor" style="width: 100%; height: 120px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit;">${currentText}</textarea>
                <div style="margin-top: 8px;">
                    <button onclick="app.saveModifiedPrompt()" style="background: var(--primary-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 8px;">Save</button>
                    <button onclick="app.cancelModifyPrompt()" style="background: none; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 4px;">Cancel</button>
                </div>
            `;
        }
    }

    // Save modified prompt
    saveModifiedPrompt() {
        const editor = document.getElementById('enhancedPromptEditor');
        if (editor) {
            this.enhancedPromptText = editor.value;
            document.getElementById('enhancedPromptDisplay').textContent = this.enhancedPromptText;
        }
    }

    // Cancel modify prompt
    cancelModifyPrompt() {
        document.getElementById('enhancedPromptDisplay').textContent = this.enhancedPromptText;
    }

    // Close prompt enhancement modal
    closePromptEnhancement() {
        document.getElementById('promptEnhancementModal').style.display = 'none';
        this.enhancedPromptText = null;
    }

    // Personalization Dashboard functionality
    openPersonalizationDashboard() {
        const modal = document.getElementById('personalizationModal');
        modal.style.display = 'flex';

        // Initialize dashboard
        this.initializeDashboardTabs();
        this.loadDashboardData();
    }

    // Initialize dashboard tabs
    initializeDashboardTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                // Update tab buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab + 'Tab') {
                        content.classList.add('active');
                    }
                });

                // Load specific tab data
                this.loadTabData(targetTab);
            });
        });
    }

    // Load dashboard data
    async loadDashboardData() {
        const stats = this.feedbackManager.getFeedbackStats();

        // Update statistics
        document.getElementById('totalFeedbackStat').textContent = stats.totalFeedback;
        document.getElementById('averageRatingStat').textContent = stats.averageRating.toFixed(1);
        document.getElementById('successRateStat').textContent = Math.round(stats.thumbsUpPercentage) + '%';

        // Find most used schema
        const schemaStats = {};
        this.feedbackManager.feedbackData.forEach(feedback => {
            schemaStats[feedback.schema] = (schemaStats[feedback.schema] || 0) + 1;
        });
        const preferredSchema = Object.keys(schemaStats).reduce((a, b) =>
            schemaStats[a] > schemaStats[b] ? a : b, '-'
        );
        document.getElementById('preferredSchemaStat').textContent = preferredSchema;

        // Load preferences
        this.loadPreferencesTab();
    }

    // Load specific tab data
    loadTabData(tabName) {
        switch (tabName) {
            case 'stats':
                this.loadStatsTab();
                break;
            case 'preferences':
                this.loadPreferencesTab();
                break;
            case 'patterns':
                this.loadPatternsTab();
                break;
            case 'export':
                this.loadExportTab();
                break;
        }
    }

    // Load statistics tab
    loadStatsTab() {
        const chartContainer = document.getElementById('feedbackChart');
        const stats = this.feedbackManager.getFeedbackStats();

        // Simple chart representation
        let chartHTML = '<div style="text-align: center; color: var(--text-secondary);">';

        if (stats.totalFeedback > 0) {
            chartHTML += '<h4>Aspect Ratings</h4>';
            Object.entries(stats.aspectAverages).forEach(([aspect, average]) => {
                const percentage = (average / 5) * 100;
                chartHTML += `
                    <div style="margin: 8px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>${aspect.charAt(0).toUpperCase() + aspect.slice(1)}</span>
                            <span>${average.toFixed(1)}/5</span>
                        </div>
                        <div style="background: var(--border-color); height: 8px; border-radius: 4px;">
                            <div style="background: var(--primary-color); height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
                        </div>
                    </div>
                `;
            });
        } else {
            chartHTML += '<p>No feedback data available yet.<br>Start using the extension and provide feedback to see statistics.</p>';
        }

        chartHTML += '</div>';
        chartContainer.innerHTML = chartHTML;
    }

    // Load preferences tab
    loadPreferencesTab() {
        const preferences = this.feedbackManager.userPreferences;

        // Set preference values
        document.getElementById('complexityPreference').value = preferences.complexityLevel;
        document.getElementById('detailPreference').value = preferences.detailLevel;

        // Set weight sliders
        Object.entries(preferences.weights).forEach(([aspect, weight]) => {
            const slider = document.getElementById(aspect + 'Slider');
            const display = document.getElementById(aspect + 'Weight');
            if (slider && display) {
                const percentage = Math.round(weight * 100);
                slider.value = percentage;
                display.textContent = percentage + '%';

                // Add event listener for real-time updates
                slider.addEventListener('input', (e) => {
                    const newValue = parseInt(e.target.value);
                    display.textContent = newValue + '%';
                    this.updatePreferenceWeight(aspect, newValue / 100);
                });
            }
        });

        // Add change listeners for dropdowns
        document.getElementById('complexityPreference').addEventListener('change', (e) => {
            this.updatePreference('complexityLevel', e.target.value);
        });

        document.getElementById('detailPreference').addEventListener('change', (e) => {
            this.updatePreference('detailLevel', e.target.value);
        });
    }

    // Update preference weight
    updatePreferenceWeight(aspect, weight) {
        this.feedbackManager.userPreferences.weights[aspect] = weight;
        this.feedbackManager.saveFeedbackData();
    }

    // Update preference
    updatePreference(key, value) {
        this.feedbackManager.userPreferences[key] = value;
        this.feedbackManager.saveFeedbackData();
    }

    // Load patterns tab
    loadPatternsTab() {
        const container = document.getElementById('patternsList');
        const patterns = this.feedbackManager.userPreferences.preferredStructures;

        let html = '';

        if (Object.keys(patterns).length === 0) {
            html = '<p style="text-align: center; color: var(--text-secondary);">No patterns learned yet. Provide more feedback to see learned patterns.</p>';
        } else {
            Object.entries(patterns).forEach(([key, pattern]) => {
                if (Array.isArray(pattern)) {
                    // Structure patterns
                    html += `
                        <div class="pattern-item">
                            <h4>${key.replace('_', ' ').toUpperCase()}</h4>
                            <p>Preferred structures based on your feedback:</p>
                            <ul>
                                ${pattern.slice(0, 3).map(p => `<li>Rating: ${p.rating}/5 - ${p.tags.join(', ')}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                } else {
                    // Aspect patterns
                    html += `
                        <div class="pattern-item">
                            <h4>${key.replace('_', ' ').toUpperCase()}</h4>
                            <p>Score: ${pattern.score.toFixed(2)} (${pattern.count} feedback entries)</p>
                            <p>Tags: ${pattern.tags ? pattern.tags.join(', ') : 'None'}</p>
                        </div>
                    `;
                }
            });
        }

        container.innerHTML = html;
    }

    // Load export tab
    loadExportTab() {
        // Add event listeners for export/import buttons
        document.getElementById('exportPersonalizationData').addEventListener('click', () => {
            this.exportPersonalizationData();
        });

        document.getElementById('importPersonalizationData').addEventListener('click', () => {
            this.importPersonalizationData();
        });

        document.getElementById('resetPersonalizationData').addEventListener('click', () => {
            this.resetPersonalizationData();
        });
    }

    // Export personalization data
    exportPersonalizationData() {
        const data = this.feedbackManager.exportFeedbackData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `promptstruct-personalization-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Personalization data exported!', 'success');
    }

    // Import personalization data
    importPersonalizationData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate data structure
                if (data.feedbackData && data.userPreferences) {
                    this.feedbackManager.feedbackData = data.feedbackData;
                    this.feedbackManager.userPreferences = data.userPreferences;
                    await this.feedbackManager.saveFeedbackData();

                    this.loadDashboardData();
                    this.showNotification('Personalization data imported successfully!', 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Failed to import data. Please check the file format.', 'error');
            }
        });

        input.click();
    }

    // Reset personalization data
    resetPersonalizationData() {
        if (confirm('Are you sure you want to reset all personalization data? This action cannot be undone.')) {
            this.feedbackManager.clearFeedbackData();
            this.loadDashboardData();
            this.showNotification('Personalization data reset successfully!', 'success');
        }
    }

    // Close personalization dashboard
    closePersonalizationDashboard() {
        document.getElementById('personalizationModal').style.display = 'none';
    }

    // Settings modal management
    openSettings() {
        try {
            // Populate modal with current settings
            document.getElementById('openaiApiKey').value = this.settings.openaiApiKey;
            document.getElementById('anthropicApiKey').value = this.settings.anthropicApiKey;
            document.getElementById('groqApiKey').value = this.settings.groqApiKey;
            document.getElementById('provider').value = this.settings.provider;
            document.getElementById('model').value = this.settings.model;
            document.getElementById('temperature').value = this.settings.temperature;
            document.getElementById('temperatureValue').textContent = this.settings.temperature;

            // Check if saveHistory checkbox exists before setting it
            const saveHistoryCheckbox = document.getElementById('saveHistory');
            if (saveHistoryCheckbox) {
                saveHistoryCheckbox.checked = this.settings.saveHistory;
            }

            this.updateModelOptions();
            document.getElementById('settingsModal').style.display = 'flex';
        } catch (error) {
            console.error('Error opening settings modal:', error);
        }
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    async saveSettingsFromModal() {
        // Get values from modal
        this.settings.openaiApiKey = document.getElementById('openaiApiKey').value.trim();
        this.settings.anthropicApiKey = document.getElementById('anthropicApiKey').value.trim();
        this.settings.groqApiKey = document.getElementById('groqApiKey').value.trim();
        this.settings.provider = document.getElementById('provider').value;
        this.settings.model = document.getElementById('model').value;
        this.settings.temperature = parseFloat(document.getElementById('temperature').value);
        this.settings.saveHistory = document.getElementById('saveHistory').checked;

        await this.saveSettings();
        this.closeSettings();
        this.showNotification('Settings saved successfully!', 'success');
    }

    updateModelOptions() {
        const provider = document.getElementById('provider').value;
        const modelSelect = document.getElementById('model');

        // Clear existing options
        modelSelect.innerHTML = '';

        if (provider === 'anthropic') {
            modelSelect.innerHTML = `
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            `;
        } else if (provider === 'groq') {
            modelSelect.innerHTML = `
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                <option value="gemma2-9b-it">Gemma 2 9B IT</option>
                <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 Distill Llama 70B</option>
                <option value="moonshotai/kimi-k2-instruct">Kimi K2 Instruct</option>
            `;
        } else {
            modelSelect.innerHTML = `
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            `;
        }

        // Set the current model if it exists in the new options
        if (this.settings.model) {
            const option = modelSelect.querySelector(`option[value="${this.settings.model}"]`);
            if (option) {
                modelSelect.value = this.settings.model;
            }
        }
    }

    loadSchemaPreference() {
        document.getElementById('schemaSelect').value = this.settings.schemaPreference;
        this.showSchemaPreview(this.settings.schemaPreference);
    }

    showSchemaPreview(schemaType) {
        // Update placeholder text with schema-specific example
        const promptInput = document.getElementById('promptInput');
        const baseExample = this.getExamplePromptForSchema(schemaType);
        promptInput.placeholder = `Enter your natural language prompt here...\n\n${baseExample}`;
    }

    getExamplePromptForSchema(schemaType) {
        switch (schemaType) {
            case 'openai-function':
                return `Example: "Create a function that takes a user's name and age, validates the age is between 18-100, and returns a greeting message with their details."`;
            case 'langchain':
                return `Example: "Create a tool that searches Wikipedia for information about a given topic and returns the summary and main facts."`;
            case 'agent-prompt':
                return `Example: "Create an agent that analyzes customer reviews, identifies sentiment, and provides actionable business insights."`;
            case 'anthropic-tool':
                return `Example: "Create a tool that processes text input and returns a summary with key points and sentiment analysis."`;
            case 'custom':
            default:
                return `Example: "Create a configuration for a task that processes user data and generates personalized recommendations."`;
        }
    }

    // Model comparison
    async compareModels() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            this.showNotification('Please enter a prompt to compare.', 'error');
            return;
        }

        // Check if at least one API key is configured
        if (!this.settings.openaiApiKey && !this.settings.anthropicApiKey && !this.settings.groqApiKey) {
            this.showNotification('Please configure at least one API key in settings.', 'error');
            this.openSettings();
            return;
        }

        this.openComparison();
        this.showComparisonLoading(true);

        const providers = ['openai', 'anthropic', 'groq'];
        const schema = document.getElementById('schemaSelect').value;
        const results = [];

        for (const provider of providers) {
            try {
                // Get the API key for this specific provider
                let apiKey;
                switch (provider) {
                    case 'openai':
                        apiKey = this.settings.openaiApiKey;
                        break;
                    case 'anthropic':
                        apiKey = this.settings.anthropicApiKey;
                        break;
                    case 'groq':
                        apiKey = this.settings.groqApiKey;
                        break;
                    default:
                        apiKey = '';
                }

                // Skip this provider if no API key is configured
                if (!apiKey) {
                    results.push({
                        provider,
                        model: 'N/A',
                        success: false,
                        error: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key not configured`
                    });
                    continue;
                }

                const model = this.getDefaultModelForProvider(provider);
                const response = await this.sendMessage({
                    action: 'convertPrompt',
                    data: {
                        prompt: prompt,
                        schema: schema,
                        apiKey: apiKey,
                        provider: provider,
                        model: model,
                        temperature: this.settings.temperature
                    }
                });

                results.push({
                    provider,
                    model,
                    success: response.success,
                    data: response.data,
                    error: response.error
                });
            } catch (error) {
                results.push({
                    provider,
                    model: 'unknown',
                    success: false,
                    error: error.message
                });
            }
        }

        this.displayComparisonResults(results);
        this.showComparisonLoading(false);
    }

    getDefaultModelForProvider(provider) {
        const defaults = {
            openai: 'gpt-4',
            anthropic: 'claude-3-sonnet-20240229',
            groq: 'llama-3.3-70b-versatile'
        };
        return defaults[provider];
    }

    openComparison() {
        document.getElementById('comparisonModal').style.display = 'flex';
    }

    closeComparison() {
        document.getElementById('comparisonModal').style.display = 'none';
    }

    showComparisonLoading(show) {
        const loadingDiv = document.querySelector('.comparison-loading');
        if (loadingDiv) {
            loadingDiv.style.display = show ? 'block' : 'none';
        }
    }

    displayComparisonResults(results) {
        const container = document.getElementById('comparisonResults');

        container.innerHTML = results.map((result, index) => `
            <div class="comparison-result ${result.success ? 'success' : 'error'}" data-index="${index}">
                <div class="comparison-header">
                    <h3>${result.provider.toUpperCase()}</h3>
                    <span class="comparison-model">${result.model}</span>
                    <span class="comparison-status ${result.success ? 'success' : 'error'}">
                        ${result.success ? '✅' : '❌'}
                    </span>
                </div>
                <div class="comparison-content">
                    ${result.success ?
                        `<pre><code>${this.escapeHtml(result.data.json)}</code></pre>
                         <div class="comparison-actions">
                            <button class="use-result-btn" data-index="${index}">
                                Use This Result
                            </button>
                         </div>` :
                        `<div class="comparison-error">Error: ${this.escapeHtml(result.error)}</div>`
                    }
                </div>
            </div>
        `).join('');

        // Add event listeners for comparison results
        this.setupComparisonEventListeners(results);
    }

    setupComparisonEventListeners(results) {
        document.querySelectorAll('.use-result-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const result = results[index];
                if (result.success) {
                    document.getElementById('jsonOutput').innerHTML = `<code>${this.escapeHtml(result.data.json)}</code>`;
                    document.getElementById('comparisonModal').style.display = 'none';

                    // Show feedback section for the selected result
                    const outputData = {
                        prompt: result.prompt || document.getElementById('promptInput').value,
                        json: result.data.json,
                        schema: document.getElementById('schemaSelect').value,
                        provider: result.provider,
                        model: result.model,
                        timestamp: Date.now()
                    };
                    this.showFeedbackSection(outputData);
                }
            });
        });
    }

    // Batch processing functionality
    openBatch() {
        document.getElementById('batchModal').style.display = 'flex';
        document.getElementById('batchResults').style.display = 'none';
    }

    closeBatch() {
        document.getElementById('batchModal').style.display = 'none';
    }

    async processBatch() {
        const batchTextarea = document.getElementById('batchPrompts');
        const promptsText = batchTextarea.value.trim();

        if (!promptsText) {
            this.showNotification('Please enter prompts to process.', 'error');
            return;
        }

        const currentApiKey = this.getCurrentApiKey();
        if (!currentApiKey) {
            const providerName = this.settings.provider === 'openai' ? 'OpenAI' :
                                this.settings.provider === 'anthropic' ? 'Anthropic' : 'Groq';
            this.showNotification(`Please configure your ${providerName} API key in settings.`, 'error');
            this.openSettings();
            return;
        }

        const prompts = promptsText.split('\n').filter(p => p.trim().length > 0);

        if (prompts.length === 0) {
            this.showNotification('No valid prompts found.', 'error');
            return;
        }

        if (prompts.length > 10) {
            if (!confirm(`You're about to process ${prompts.length} prompts. This may take a while and consume API credits. Continue?`)) {
                return;
            }
        }

        this.showLoading(true);
        document.getElementById('batchResults').style.display = 'block';
        document.getElementById('batchResults').innerHTML = '<div class="batch-processing">Processing prompts...</div>';

        try {
            const response = await this.sendMessage({
                action: 'batchConvert',
                data: {
                    prompts: prompts,
                    schema: document.getElementById('schemaSelect').value,
                    apiKey: currentApiKey,
                    provider: this.settings.provider,
                    model: this.settings.model,
                    temperature: this.settings.temperature
                }
            });

            if (response.success) {
                this.displayBatchResults(response.data);
                this.showNotification(`Batch processing complete! ${response.data.summary.successful}/${response.data.summary.total} successful.`, 'success');
            } else {
                this.showNotification(response.error, 'error');
            }
        } catch (error) {
            console.error('Batch processing error:', error);
            this.showNotification('Batch processing failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayBatchResults(data) {
        const container = document.getElementById('batchResults');
        const { results, summary } = data;

        container.innerHTML = `
            <div class="batch-summary">
                <h3>Batch Processing Results</h3>
                <div class="batch-stats">
                    <span class="batch-stat">Total: ${summary.total}</span>
                    <span class="batch-stat success">Successful: ${summary.successful}</span>
                    <span class="batch-stat error">Failed: ${summary.failed}</span>
                    <span class="batch-stat">Tokens: ${summary.usage.total_tokens}</span>
                </div>
            </div>
            <div class="batch-results-list">
                ${results.map((result, index) => `
                    <div class="batch-result-item ${result.success ? 'success' : 'error'}" data-index="${index}">
                        <div class="batch-result-header">
                            <span class="batch-result-index">#${index + 1}</span>
                            <span class="batch-result-status">${result.success ? '✅' : '❌'}</span>
                        </div>
                        <div class="batch-result-prompt">${this.escapeHtml(result.prompt.substring(0, 100))}${result.prompt.length > 100 ? '...' : ''}</div>
                        ${result.success ?
                            `<div class="batch-result-json">
                                <pre><code>${this.escapeHtml(result.json.substring(0, 200))}${result.json.length > 200 ? '...' : ''}</code></pre>
                                <button class="use-batch-result-btn" data-index="${index}">
                                    Use This Result
                                </button>
                            </div>` :
                            `<div class="batch-result-error">Error: ${this.escapeHtml(result.error)}</div>`
                        }
                    </div>
                `).join('')}
            </div>
            <div class="batch-actions">
                <button class="export-batch-btn">
                    Export All Results
                </button>
            </div>
        `;

        // Add event listeners for batch results
        this.setupBatchEventListeners(results);
    }

    setupBatchEventListeners(results) {
        // Use batch result buttons
        document.querySelectorAll('.use-batch-result-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const result = results[index];
                if (result.success) {
                    document.getElementById('jsonOutput').innerHTML = `<code>${this.escapeHtml(result.json)}</code>`;
                    document.getElementById('batchModal').style.display = 'none';

                    // Show feedback section for the selected batch result
                    const outputData = {
                        prompt: result.prompt,
                        json: result.json,
                        schema: document.getElementById('schemaSelect').value,
                        provider: this.settings.provider,
                        model: this.settings.model,
                        timestamp: Date.now()
                    };
                    this.showFeedbackSection(outputData);
                }
            });
        });

        // Export batch results button
        const exportBtn = document.querySelector('.export-batch-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportBatchResults(results);
            });
        }
    }

    exportBatchResults(results) {
        const exportData = {
            timestamp: new Date().toISOString(),
            schema: document.getElementById('schemaSelect').value,
            provider: this.settings.provider,
            model: this.settings.model,
            results: results
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Batch results exported successfully!', 'success');
    }

    // Template functionality
    openTemplates() {
        if (typeof PromptTemplateLibrary !== 'undefined') {
            this.displayTemplates();
            document.getElementById('templatesModal').style.display = 'flex';
        } else {
            this.showNotification('Template library not available.', 'error');
        }
    }

    closeTemplates() {
        document.getElementById('templatesModal').style.display = 'none';
    }

    displayTemplates() {
        const container = document.getElementById('templatesList');
        const templates = PromptTemplateLibrary.getTemplates();

        container.innerHTML = Object.entries(templates).map(([key, template]) => `
            <div class="template-item" data-template="${key}">
                <div class="template-header">
                    <h3>${template.name}</h3>
                </div>
                <div class="template-description">
                    ${template.description}
                </div>
                <div class="template-variables">
                    <strong>Variables:</strong> ${template.variables.join(', ')}
                </div>
                <div class="template-actions">
                    <button class="use-template-btn" data-template="${key}">
                        Use Template
                    </button>
                </div>
                <div class="template-form" style="display: none;">
                    ${template.variables.map(variable => `
                        <div class="template-input-group">
                            <label>${variable}:</label>
                            <input type="text" data-variable="${variable}" placeholder="Enter ${variable}">
                        </div>
                    `).join('')}
                    <button class="apply-template-btn" data-template="${key}">
                        Apply Template
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for template actions
        this.setupTemplateEventListeners();
    }

    setupTemplateEventListeners() {
        // Use template buttons (show/hide form)
        document.querySelectorAll('.use-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateItem = e.target.closest('.template-item');
                const templateForm = templateItem.querySelector('.template-form');
                templateForm.style.display = templateForm.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Apply template buttons
        document.querySelectorAll('.apply-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateKey = e.target.dataset.template;
                const templateItem = e.target.closest('.template-item');
                this.applyTemplate(templateKey, templateItem);
            });
        });
    }

    applyTemplate(templateKey, templateElement) {
        const template = PromptTemplateLibrary.getTemplate(templateKey);
        const values = {};

        templateElement.querySelectorAll('[data-variable]').forEach(input => {
            const variable = input.dataset.variable;
            values[variable] = input.value || `[${variable}]`;
        });

        const formattedPrompt = template.template.format(values);
        document.getElementById('promptInput').value = formattedPrompt;
        this.closeTemplates();
        this.showNotification('Template applied successfully!', 'success');
    }

    // Main functionality
    async convertPrompt() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            this.showNotification('Please enter a prompt to convert.', 'error');
            return;
        }

        const currentApiKey = this.getCurrentApiKey();
        if (!currentApiKey) {
            const providerName = this.settings.provider === 'openai' ? 'OpenAI' :
                                this.settings.provider === 'anthropic' ? 'Anthropic' : 'Groq';
            this.showNotification(`Please configure your ${providerName} API key in settings.`, 'error');
            this.openSettings();
            return;
        }

        this.showLoading(true);

        try {
            const response = await this.sendMessage({
                action: 'convertPrompt',
                data: {
                    prompt: prompt,
                    schema: document.getElementById('schemaSelect').value,
                    apiKey: currentApiKey,
                    provider: this.settings.provider,
                    model: this.settings.model,
                    temperature: this.settings.temperature,
                    userPreferences: this.feedbackManager.userPreferences
                }
            });

            if (response.success) {
                this.displayJSON(response.data.json);

                // Save to history if enabled
                if (this.settings.saveHistory) {
                    this.saveToHistory(prompt, response.data.json);
                }

                // Track usage
                if (response.data.usage) {
                    this.trackUsage(response.data.usage, this.settings.provider, this.settings.model);
                }

                // Show feedback section for the generated output
                const outputData = {
                    prompt: prompt,
                    json: response.data.json,
                    schema: document.getElementById('schemaSelect').value,
                    provider: this.settings.provider,
                    model: this.settings.model,
                    timestamp: Date.now()
                };
                this.showFeedbackSection(outputData);

                this.showNotification('Prompt converted successfully!', 'success');
            } else {
                this.showNotification(response.error, 'error');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.showNotification('Failed to convert prompt. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async optimizePrompt() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            this.showNotification('Please enter a prompt to optimize.', 'error');
            return;
        }

        const currentApiKey = this.getCurrentApiKey();
        if (!currentApiKey) {
            const providerName = this.settings.provider === 'openai' ? 'OpenAI' :
                                this.settings.provider === 'anthropic' ? 'Anthropic' : 'Groq';
            this.showNotification(`Please configure your ${providerName} API key in settings.`, 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await this.sendMessage({
                action: 'optimizePrompt',
                data: {
                    prompt: prompt,
                    schema: document.getElementById('schemaSelect').value,
                    apiKey: currentApiKey,
                    provider: this.settings.provider,
                    model: this.settings.model,
                    temperature: this.settings.temperature
                }
            });

            if (response.success) {
                this.displaySuggestions(response.data.suggestions);
                this.showNotification('Optimization suggestions generated!', 'success');
            } else {
                this.showNotification(response.error, 'error');
            }
        } catch (error) {
            console.error('Optimization error:', error);
            this.showNotification('Failed to generate suggestions. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Display functions
    displayJSON(jsonString) {
        const outputElement = document.getElementById('jsonOutput');
        
        try {
            // Try to parse and pretty-print the JSON
            const parsed = JSON.parse(jsonString);
            const formatted = JSON.stringify(parsed, null, 2);
            outputElement.innerHTML = `<code>${this.highlightJSON(formatted)}</code>`;
        } catch (error) {
            // If parsing fails, display as-is
            outputElement.innerHTML = `<code>${this.escapeHtml(jsonString)}</code>`;
        }
    }

    displaySuggestions(suggestions) {
        const suggestionsSection = document.getElementById('suggestionsSection');
        const suggestionsContent = document.getElementById('suggestions');

        try {
            // Try to parse as JSON first (new format)
            const parsed = JSON.parse(suggestions);
            suggestionsContent.innerHTML = this.formatStructuredSuggestions(parsed);
        } catch (error) {
            // Fall back to plain text formatting (legacy format)
            suggestionsContent.innerHTML = this.formatSuggestions(suggestions);
        }

        suggestionsSection.style.display = 'block';

        // Add event listeners for suggestion actions
        this.setupSuggestionEventListeners();
    }

    setupSuggestionEventListeners() {
        // Use optimized prompt buttons
        document.querySelectorAll('.use-optimized-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const textarea = e.target.previousElementSibling;
                if (textarea && textarea.tagName === 'TEXTAREA') {
                    document.getElementById('promptInput').value = textarea.value;
                }
            });
        });
    }

    formatStructuredSuggestions(data) {
        let html = `
            <div class="suggestion-header">
                <h3>Prompt Analysis</h3>
                <div class="score-badge">Score: ${data.overall_score}/10</div>
            </div>
        `;

        if (data.strengths && data.strengths.length > 0) {
            html += `
                <div class="suggestion-section">
                    <h4>✅ Strengths</h4>
                    <ul>
                        ${data.strengths.map(strength => `<li>${this.escapeHtml(strength)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (data.improvements && data.improvements.length > 0) {
            html += `
                <div class="suggestion-section">
                    <h4>💡 Improvements</h4>
                    ${data.improvements.map(improvement => `
                        <div class="improvement-item">
                            <div class="improvement-category">${improvement.category.toUpperCase()}</div>
                            <div class="improvement-issue">${this.escapeHtml(improvement.issue)}</div>
                            <div class="improvement-suggestion">${this.escapeHtml(improvement.suggestion)}</div>
                            ${improvement.example ? `<div class="improvement-example">Example: "${this.escapeHtml(improvement.example)}"</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (data.optimized_prompt) {
            html += `
                <div class="suggestion-section">
                    <h4>✨ Optimized Prompt</h4>
                    <div class="optimized-prompt">
                        <textarea readonly rows="4">${this.escapeHtml(data.optimized_prompt)}</textarea>
                        <button class="use-optimized-btn">
                            Use This Prompt
                        </button>
                    </div>
                </div>
            `;
        }

        if (data.explanation) {
            html += `
                <div class="suggestion-section">
                    <h4>📝 Explanation</h4>
                    <p>${this.escapeHtml(data.explanation)}</p>
                </div>
            `;
        }

        return html;
    }

    // Utility functions
    highlightJSON(json) {
        return json
            .replace(/(".*?")\s*:/g, '<span style="color: #0066cc;">$1</span>:')
            .replace(/:\s*(".*?")/g, ': <span style="color: #008000;">$1</span>')
            .replace(/:\s*(true|false|null)/g, ': <span style="color: #ff6600;">$1</span>')
            .replace(/:\s*(\d+)/g, ': <span style="color: #ff6600;">$1</span>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatSuggestions(suggestions) {
        return suggestions
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => `<p>${this.escapeHtml(line)}</p>`)
            .join('');
    }

    // Copy and export functions
    async copyToClipboard() {
        const outputElement = document.getElementById('jsonOutput');
        const text = outputElement.textContent;

        if (!text || text.includes('Your generated JSON will appear here')) {
            this.showNotification('No JSON to copy.', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('JSON copied to clipboard!', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.showNotification('Failed to copy to clipboard.', 'error');
        }
    }

    exportJSON() {
        const outputElement = document.getElementById('jsonOutput');
        const text = outputElement.textContent;

        if (!text || text.includes('Your generated JSON will appear here')) {
            this.showNotification('No JSON to export.', 'error');
            return;
        }

        // Show export options
        this.showExportOptions(text);
    }

    showExportOptions(jsonText) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Export Options</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="export-options">
                        <button class="export-option-btn" data-format="json">
                            <span class="btn-icon">📄</span>
                            Export as JSON
                        </button>
                        <button class="export-option-btn" data-format="js">
                            <span class="btn-icon">📜</span>
                            Export as JavaScript
                        </button>
                        <button class="export-option-btn" data-format="py">
                            <span class="btn-icon">🐍</span>
                            Export as Python Dict
                        </button>
                        <button class="export-option-btn" data-format="txt">
                            <span class="btn-icon">📝</span>
                            Export as Text
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add close button event listener
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });

        // Add event listeners for export options
        modal.querySelectorAll('.export-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                this.performExport(jsonText, format);
                modal.remove();
            });
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    performExport(jsonText, format) {
        let content, filename, mimeType;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

        try {
            const jsonObj = JSON.parse(jsonText);

            switch (format) {
                case 'json':
                    content = JSON.stringify(jsonObj, null, 2);
                    filename = `prompt-${timestamp}.json`;
                    mimeType = 'application/json';
                    break;

                case 'js':
                    content = `// Generated by PromptStruct\nconst promptSchema = ${JSON.stringify(jsonObj, null, 2)};`;
                    filename = `prompt-${timestamp}.js`;
                    mimeType = 'text/javascript';
                    break;

                case 'py':
                    content = `# Generated by PromptStruct\nprompt_schema = ${JSON.stringify(jsonObj, null, 2).replace(/"/g, "'")}`;
                    filename = `prompt-${timestamp}.py`;
                    mimeType = 'text/x-python';
                    break;

                case 'txt':
                    content = `PromptStruct Export\nGenerated: ${new Date().toISOString()}\n\n${JSON.stringify(jsonObj, null, 2)}`;
                    filename = `prompt-${timestamp}.txt`;
                    mimeType = 'text/plain';
                    break;

                default:
                    content = jsonText;
                    filename = `prompt-${timestamp}.json`;
                    mimeType = 'application/json';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification(`Exported as ${format.toUpperCase()} successfully!`, 'success');

        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export. Invalid JSON format.', 'error');
        }
    }

    // History management
    async saveToHistory(prompt, json) {
        try {
            await this.sendMessage({
                action: 'saveToHistory',
                data: {
                    prompt: prompt,
                    json: json,
                    schema: document.getElementById('schemaSelect').value,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Save to history error:', error);
        }
    }

    async openHistory() {
        try {
            const response = await this.sendMessage({ action: 'getHistory' });

            if (response.success) {
                this.displayHistory(response.data);
                document.getElementById('historyModal').style.display = 'flex';
            } else {
                this.showNotification('Failed to load history.', 'error');
            }
        } catch (error) {
            console.error('Open history error:', error);
            this.showNotification('Failed to load history.', 'error');
        }
    }

    closeHistory() {
        document.getElementById('historyModal').style.display = 'none';
    }

    async clearHistory() {
        if (confirm('Are you sure you want to clear all prompt history? This cannot be undone.')) {
            try {
                await chrome.storage.local.set({ promptHistory: [] });
                this.displayHistory([]);
                this.showNotification('History cleared successfully.', 'success');
            } catch (error) {
                console.error('Clear history error:', error);
                this.showNotification('Failed to clear history.', 'error');
            }
        }
    }

    displayHistory(history) {
        const historyList = document.getElementById('historyList');

        if (!history || history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No prompts in history yet.</div>';
            return;
        }

        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item" data-id="${item.id}" data-index="${index}">
                <div class="history-header">
                    <span class="history-schema">${item.schema}</span>
                    <span class="history-date">${new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="history-prompt">${this.escapeHtml(item.prompt.substring(0, 100))}${item.prompt.length > 100 ? '...' : ''}</div>
                <div class="history-actions">
                    <button class="history-action-btn view-json-btn" data-index="${index}">
                        View JSON
                    </button>
                    <button class="history-action-btn use-prompt-btn" data-index="${index}">
                        Use Prompt
                    </button>
                </div>
                <div class="history-json" style="display: none;">
                    <pre><code>${this.escapeHtml(item.json)}</code></pre>
                </div>
            </div>
        `).join('');

        // Add event listeners for history actions
        this.setupHistoryEventListeners(history);
    }

    setupHistoryEventListeners(history) {
        // View JSON buttons
        document.querySelectorAll('.view-json-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const historyItem = e.target.closest('.history-item');
                const jsonDiv = historyItem.querySelector('.history-json');
                jsonDiv.style.display = jsonDiv.style.display === 'none' ? 'block' : 'none';
            });
        });

        // Use Prompt buttons
        document.querySelectorAll('.use-prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const item = history[index];
                document.getElementById('promptInput').value = item.prompt;
                document.getElementById('schemaSelect').value = item.schema;
                document.getElementById('historyModal').style.display = 'none';
            });
        });
    }

    // UI helpers
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: type === 'success' ? '#10b981' : 
                           type === 'error' ? '#ef4444' : '#3b82f6'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Usage tracking
    async trackUsage(usage, provider, model) {
        try {
            const result = await chrome.storage.local.get(['usageStats']);
            const stats = result.usageStats || {
                totalRequests: 0,
                totalTokens: 0,
                totalCost: 0,
                byProvider: {},
                byModel: {},
                history: []
            };

            // Update totals
            stats.totalRequests += 1;
            stats.totalTokens += usage.total_tokens || 0;

            // Calculate cost using TokenCounter
            if (typeof TokenCounter !== 'undefined') {
                const cost = TokenCounter.estimateCost(usage.total_tokens || 0, provider, model);
                stats.totalCost += cost.totalCost;
            }

            // Update by provider
            if (!stats.byProvider[provider]) {
                stats.byProvider[provider] = { requests: 0, tokens: 0, cost: 0 };
            }
            stats.byProvider[provider].requests += 1;
            stats.byProvider[provider].tokens += usage.total_tokens || 0;

            // Update by model
            if (!stats.byModel[model]) {
                stats.byModel[model] = { requests: 0, tokens: 0, cost: 0 };
            }
            stats.byModel[model].requests += 1;
            stats.byModel[model].tokens += usage.total_tokens || 0;

            // Add to history (keep last 100 entries)
            stats.history.unshift({
                timestamp: new Date().toISOString(),
                provider,
                model,
                usage,
                cost: typeof TokenCounter !== 'undefined' ?
                    TokenCounter.estimateCost(usage.total_tokens || 0, provider, model).totalCost : 0
            });
            stats.history = stats.history.slice(0, 100);

            await chrome.storage.local.set({ usageStats: stats });
            this.updateUsageDisplay();

        } catch (error) {
            console.error('Usage tracking error:', error);
        }
    }

    async updateUsageDisplay() {
        try {
            const result = await chrome.storage.local.get(['usageStats']);
            const stats = result.usageStats;

            if (!stats || stats.totalRequests === 0) {
                document.getElementById('usageSection').style.display = 'none';
                return;
            }

            document.getElementById('usageSection').style.display = 'block';
            const container = document.getElementById('usageStats');

            container.innerHTML = `
                <div class="usage-summary">
                    <div class="usage-stat">
                        <span class="usage-label">Total Requests:</span>
                        <span class="usage-value">${stats.totalRequests}</span>
                    </div>
                    <div class="usage-stat">
                        <span class="usage-label">Total Tokens:</span>
                        <span class="usage-value">${stats.totalTokens.toLocaleString()}</span>
                    </div>
                    <div class="usage-stat">
                        <span class="usage-label">Estimated Cost:</span>
                        <span class="usage-value">$${stats.totalCost.toFixed(4)}</span>
                    </div>
                </div>
                <div class="usage-breakdown">
                    <h4>By Provider:</h4>
                    ${Object.entries(stats.byProvider).map(([provider, data]) => `
                        <div class="usage-provider">
                            <span class="provider-name">${provider.toUpperCase()}</span>
                            <span class="provider-stats">${data.requests} requests, ${data.tokens.toLocaleString()} tokens</span>
                        </div>
                    `).join('')}
                </div>
            `;

        } catch (error) {
            console.error('Usage display error:', error);
        }
    }

    async clearUsageStats() {
        if (confirm('Are you sure you want to clear all usage statistics? This cannot be undone.')) {
            try {
                await chrome.storage.local.set({ usageStats: null });
                document.getElementById('usageSection').style.display = 'none';
                this.showNotification('Usage statistics cleared.', 'success');
            } catch (error) {
                console.error('Clear usage error:', error);
                this.showNotification('Failed to clear usage statistics.', 'error');
            }
        }
    }

    // Message passing to background script
    sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
        });
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PromptStruct();
    window.app = app; // Make globally accessible for inline handlers
});
