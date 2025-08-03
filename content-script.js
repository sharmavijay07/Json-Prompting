// PromptStruct Content Script - AI Website Integration
class PromptStructIntegration {
    constructor() {
        this.isActive = false;
        this.currentSite = this.detectAISite();
        this.promptSelectors = this.getPromptSelectors();
        this.sphere = null;
        this.panel = null;
        this.currentJSON = null;
        
        this.init();
    }

    init() {
        console.log(`PromptStruct: Initializing on ${window.location.hostname}`);
        console.log(`PromptStruct: Current site detected as: ${this.currentSite}`);

        // Only activate on supported AI sites
        if (!this.currentSite) {
            console.log('PromptStruct: Site not supported, exiting');
            return;
        }

        console.log(`PromptStruct: Activating for ${this.currentSite}`);

        try {
            this.injectStyles();
            this.createFloatingSphere();
            this.createFloatingPanel();
            this.setupEventListeners();
            this.observePromptChanges();

            // Setup auto-enhancement after a delay to ensure page is fully loaded
            setTimeout(() => {
                this.setupAutoEnhancement();
            }, 2000);

            console.log('PromptStruct: Successfully initialized');
        } catch (error) {
            console.error('PromptStruct: Error during initialization:', error);
        }
    }

    injectStyles() {
        if (document.querySelector('#promptstruct-styles')) return;

        const style = document.createElement('style');
        style.id = 'promptstruct-styles';
        style.textContent = `
            /* PromptStruct Floating Sphere */
            .promptstruct-sphere {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                animation: promptstructPulse 2s infinite;
                border: 2px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
            }

            .promptstruct-sphere:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
            }

            .promptstruct-sphere.active {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                box-shadow: 0 8px 32px rgba(34, 197, 94, 0.4);
            }

            @keyframes promptstructPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            /* PromptStruct Panel */
            .promptstruct-panel {
                position: fixed;
                top: 90px;
                right: 20px;
                width: 420px;
                max-height: 80vh;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.3);
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .promptstruct-panel.visible {
                opacity: 1;
                transform: translateX(0);
            }

            .promptstruct-panel-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .promptstruct-panel-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .promptstruct-header-controls {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .promptstruct-enhance-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 8px;
                padding: 8px;
                color: white;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s ease;
            }

            .promptstruct-enhance-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .promptstruct-panel-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                color: white;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .promptstruct-panel-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }

            .promptstruct-panel-content {
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }

            .promptstruct-input-group {
                margin-bottom: 16px;
                position: relative;
            }

            .promptstruct-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #374151;
                font-size: 14px;
            }

            .promptstruct-textarea {
                width: 100%;
                min-height: 100px;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                resize: vertical;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
            }

            .promptstruct-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .promptstruct-select {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                cursor: pointer;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
            }

            .promptstruct-select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .promptstruct-autofill-btn {
                position: absolute;
                top: 32px;
                right: 8px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .promptstruct-autofill-btn:hover {
                background: #5a67d8;
                transform: scale(1.05);
            }

            .promptstruct-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }

            .promptstruct-button, .promptstruct-optimize-btn {
                flex: 1;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 16px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .promptstruct-button:hover, .promptstruct-optimize-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }

            .promptstruct-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .promptstruct-optimize-btn {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }

            .promptstruct-optimize-btn:hover {
                box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
            }

            .promptstruct-output-section {
                margin-top: 16px;
            }

            .promptstruct-output-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .promptstruct-output-controls {
                display: flex;
                gap: 8px;
            }

            .promptstruct-copy-btn, .promptstruct-export-btn {
                background: #10b981;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .promptstruct-copy-btn:hover, .promptstruct-export-btn:hover {
                background: #059669;
                transform: scale(1.05);
            }

            .promptstruct-export-btn {
                background: #3b82f6;
            }

            .promptstruct-export-btn:hover {
                background: #2563eb;
            }

            .promptstruct-output {
                background: #1f2937;
                color: #e5e7eb;
                padding: 16px;
                border-radius: 8px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 12px;
                line-height: 1.5;
                overflow-x: auto;
                white-space: pre-wrap;
                word-break: break-word;
                max-height: 300px;
                overflow-y: auto;
            }

            .promptstruct-feedback {
                margin-top: 12px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .promptstruct-feedback-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .promptstruct-feedback-quick {
                display: flex;
                gap: 8px;
            }

            .promptstruct-thumb-btn, .promptstruct-star-btn {
                background: white;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                padding: 6px 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            }

            .promptstruct-thumb-btn:hover, .promptstruct-star-btn:hover {
                border-color: #667eea;
                background: #f0f4ff;
                transform: scale(1.05);
            }

            .promptstruct-inject-section {
                margin-top: 16px;
                display: flex;
                gap: 8px;
            }

            .promptstruct-inject-button, .promptstruct-inject-direct-button {
                flex: 1;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 16px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .promptstruct-inject-button:hover, .promptstruct-inject-direct-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
            }

            .promptstruct-inject-direct-button {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            }

            .promptstruct-inject-direct-button:hover {
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
            }

            .promptstruct-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: promptstructSpin 1s linear infinite;
                display: inline-block;
                margin-right: 8px;
            }

            @keyframes promptstructSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .promptstruct-panel {
                    background: rgba(31, 41, 55, 0.95);
                    border: 1px solid rgba(75, 85, 99, 0.3);
                }

                .promptstruct-label {
                    color: #d1d5db;
                }

                .promptstruct-textarea, .promptstruct-select {
                    background: #374151;
                    border-color: #4b5563;
                    color: #f9fafb;
                }

                .promptstruct-feedback {
                    background: #374151;
                    border-color: #4b5563;
                }

                .promptstruct-thumb-btn, .promptstruct-star-btn {
                    background: #4b5563;
                    border-color: #6b7280;
                    color: #f9fafb;
                }
            }

            /* Responsive design */
            @media (max-width: 480px) {
                .promptstruct-panel {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }

                .promptstruct-sphere {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    detectAISite() {
        const hostname = window.location.hostname;
        const siteMap = {
            'chatgpt.com': 'ChatGPT',
            'claude.ai': 'Claude',
            'gemini.google.com': 'Gemini',
            'grok.com': 'Grok',
            'poe.com': 'Poe',
            'perplexity.ai': 'Perplexity',
            'you.com': 'You.com',
            'copilot.microsoft.com': 'Copilot'
        };

        return siteMap[hostname] || null;
    }

    getPromptSelectors() {
        // Selectors for different AI platforms
        const selectors = {
            'ChatGPT': {
                input: 'textarea[placeholder*="Message"], #prompt-textarea, textarea[data-id="root"]',
                submit: 'button[data-testid="send-button"], button[aria-label="Send prompt"]'
            },
            'Claude': {
                input: 'div[contenteditable="true"], textarea[placeholder*="Talk to Claude"]',
                submit: 'button[aria-label="Send Message"], button[type="submit"]'
            },
            'Gemini': {
                input: 'textarea[aria-label*="Enter a prompt"], div[contenteditable="true"]',
                submit: 'button[aria-label="Send message"]'
            },
            'Grok': {
                input: 'textarea[placeholder*="Ask Grok"], div[contenteditable="true"]',
                submit: 'button[type="submit"]'
            },
            'Poe': {
                input: 'textarea[placeholder*="Talk to"], div[contenteditable="true"]',
                submit: 'button[class*="send"]'
            },
            'Perplexity': {
                input: 'textarea[placeholder*="Ask anything"], div[contenteditable="true"]',
                submit: 'button[aria-label="Submit"]'
            },
            'You.com': {
                input: 'textarea[placeholder*="Ask"], div[contenteditable="true"]',
                submit: 'button[type="submit"]'
            },
            'Copilot': {
                input: 'textarea[placeholder*="Ask me anything"], div[contenteditable="true"]',
                submit: 'button[aria-label="Submit"]'
            }
        };
        
        return selectors[this.currentSite] || { input: 'textarea', submit: 'button[type="submit"]' };
    }

    createFloatingSphere() {
        try {
            console.log('PromptStruct: Creating floating sphere');

            this.sphere = document.createElement('div');
            this.sphere.className = 'promptstruct-sphere';
            this.sphere.innerHTML = '🚀';
            this.sphere.title = `PromptStruct - Enhance prompts for ${this.currentSite}`;

            // Ensure body exists
            if (!document.body) {
                console.error('PromptStruct: Document body not found');
                return;
            }

            document.body.appendChild(this.sphere);
            console.log('PromptStruct: Sphere created and added to DOM');
        } catch (error) {
            console.error('PromptStruct: Error creating sphere:', error);
        }
    }

    createFloatingPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'promptstruct-panel';
        this.panel.innerHTML = `
            <div class="promptstruct-panel-header">
                <h3 class="promptstruct-panel-title">🔧 PromptStruct</h3>
                <div class="promptstruct-header-controls">
                    <button class="promptstruct-enhance-btn" id="promptstruct-enhance" title="AI-powered prompt enhancement">
                        🚀
                    </button>
                    <button class="promptstruct-panel-close">×</button>
                </div>
            </div>
            <div class="promptstruct-panel-content">
                <div class="promptstruct-input-group">
                    <label class="promptstruct-label">Natural Language Prompt:</label>
                    <textarea class="promptstruct-textarea" id="promptstruct-input"
                              placeholder="Enter your prompt here or click to auto-fill from ${this.currentSite}..."></textarea>
                    <button class="promptstruct-autofill-btn" id="promptstruct-autofill" title="Auto-fill from current input">
                        📝 Auto-fill
                    </button>
                </div>

                <div class="promptstruct-input-group">
                    <label class="promptstruct-label">Output Schema:</label>
                    <select class="promptstruct-select" id="promptstruct-schema">
                        <option value="openai-function">OpenAI Function Calling</option>
                        <option value="langchain">LangChain Tool</option>
                        <option value="agent-prompt">Agent Prompt</option>
                        <option value="anthropic-tool">Anthropic Tool</option>
                        <option value="custom">Custom Schema</option>
                    </select>
                </div>

                <div class="promptstruct-controls">
                    <button class="promptstruct-button" id="promptstruct-convert">
                        ✨ Convert to JSON
                    </button>
                    <button class="promptstruct-optimize-btn" id="promptstruct-optimize" title="Get AI suggestions">
                        💡 Optimize
                    </button>
                </div>

                <div class="promptstruct-output-section" id="promptstruct-output-section" style="display: none;">
                    <div class="promptstruct-output-header">
                        <label class="promptstruct-label">Generated JSON:</label>
                        <div class="promptstruct-output-controls">
                            <button class="promptstruct-copy-btn" id="promptstruct-copy" title="Copy to clipboard">
                                📋 Copy
                            </button>
                            <button class="promptstruct-export-btn" id="promptstruct-export" title="Export as file">
                                💾 Export
                            </button>
                        </div>
                    </div>
                    <pre class="promptstruct-output" id="promptstruct-output"></pre>

                    <!-- Feedback System -->
                    <div class="promptstruct-feedback" id="promptstruct-feedback">
                        <div class="promptstruct-feedback-header">
                            <span>Rate this output:</span>
                            <div class="promptstruct-feedback-quick">
                                <button class="promptstruct-thumb-btn thumb-up" id="promptstruct-thumbs-up" title="Good output">
                                    👍
                                </button>
                                <button class="promptstruct-thumb-btn thumb-down" id="promptstruct-thumbs-down" title="Poor output">
                                    👎
                                </button>
                                <button class="promptstruct-star-btn" id="promptstruct-star" title="Mark as preferred">
                                    ⭐ Preferred
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="promptstruct-inject-section" id="promptstruct-inject-section" style="display: none;">
                    <button class="promptstruct-inject-button" id="promptstruct-inject">
                        🎯 Inject into ${this.currentSite}
                    </button>
                    <button class="promptstruct-inject-direct-button" id="promptstruct-inject-direct">
                        ⚡ Direct Inject (JSON Only)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);
    }

    setupEventListeners() {
        // Sphere click
        this.sphere.addEventListener('click', () => {
            this.togglePanel();
        });

        // Panel close
        this.panel.querySelector('.promptstruct-panel-close').addEventListener('click', () => {
            this.hidePanel();
        });

        // Convert button
        this.panel.querySelector('#promptstruct-convert').addEventListener('click', () => {
            this.convertPrompt();
        });

        // Enhance button
        this.panel.querySelector('#promptstruct-enhance').addEventListener('click', () => {
            this.enhancePrompt();
        });

        // Optimize button
        this.panel.querySelector('#promptstruct-optimize').addEventListener('click', () => {
            this.optimizePrompt();
        });

        // Auto-fill button
        this.panel.querySelector('#promptstruct-autofill').addEventListener('click', () => {
            this.autoFillCurrentPrompt();
        });

        // Copy button
        this.panel.querySelector('#promptstruct-copy').addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Export button
        this.panel.querySelector('#promptstruct-export').addEventListener('click', () => {
            this.exportJSON();
        });

        // Inject button (with context)
        this.panel.querySelector('#promptstruct-inject').addEventListener('click', () => {
            this.injectIntoAI();
        });

        // Direct inject button (JSON only)
        this.panel.querySelector('#promptstruct-inject-direct').addEventListener('click', () => {
            this.injectDirectly();
        });

        // Feedback buttons
        this.panel.querySelector('#promptstruct-thumbs-up').addEventListener('click', () => {
            this.submitFeedback('positive');
        });

        this.panel.querySelector('#promptstruct-thumbs-down').addEventListener('click', () => {
            this.submitFeedback('negative');
        });

        this.panel.querySelector('#promptstruct-star').addEventListener('click', () => {
            this.submitFeedback('preferred');
        });

        // Auto-fill from current prompt on focus
        this.panel.querySelector('#promptstruct-input').addEventListener('focus', () => {
            if (!this.panel.querySelector('#promptstruct-input').value.trim()) {
                this.autoFillCurrentPrompt();
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.sphere.contains(e.target)) {
                this.hidePanel();
            }
        });
    }

    togglePanel() {
        if (this.panel.classList.contains('visible')) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        this.panel.classList.add('visible');
        this.sphere.classList.add('active');
        this.autoFillCurrentPrompt();
    }

    hidePanel() {
        this.panel.classList.remove('visible');
        this.sphere.classList.remove('active');
    }

    autoFillCurrentPrompt() {
        const inputElement = document.querySelector(this.promptSelectors.input);
        if (inputElement) {
            const currentText = inputElement.value || inputElement.textContent || inputElement.innerText;
            if (currentText && currentText.trim()) {
                this.panel.querySelector('#promptstruct-input').value = currentText.trim();
            }
        }
    }

    async convertPrompt() {
        const promptText = this.panel.querySelector('#promptstruct-input').value;
        const schema = this.panel.querySelector('#promptstruct-schema').value;

        if (!promptText.trim()) {
            alert('Please enter a prompt to convert');
            return;
        }

        const convertButton = this.panel.querySelector('#promptstruct-convert');
        const outputSection = this.panel.querySelector('#promptstruct-output-section');
        const outputDiv = this.panel.querySelector('#promptstruct-output');
        const injectSection = this.panel.querySelector('#promptstruct-inject-section');
        const feedbackDiv = this.panel.querySelector('#promptstruct-feedback');

        // Show loading
        convertButton.disabled = true;
        convertButton.innerHTML = '<div class="promptstruct-spinner"></div> Converting...';
        outputSection.style.display = 'none';
        injectSection.style.display = 'none';

        try {
            // Get API settings from storage
            const settings = await chrome.storage.sync.get([
                'groqApiKey',
                'openaiApiKey',
                'anthropicApiKey',
                'provider',
                'model',
                'temperature'
            ]);

            console.log('PromptStruct: Retrieved settings:', {
                hasGroqKey: !!settings.groqApiKey,
                hasOpenAIKey: !!settings.openaiApiKey,
                hasAnthropicKey: !!settings.anthropicApiKey,
                provider: settings.provider,
                groqKeyLength: settings.groqApiKey ? settings.groqApiKey.length : 0
            });

            // Determine which API key to use
            let apiKey = null;
            let provider = settings.provider || 'groq';

            if (provider === 'groq' && settings.groqApiKey) {
                apiKey = settings.groqApiKey;
            } else if (provider === 'openai' && settings.openaiApiKey) {
                apiKey = settings.openaiApiKey;
            } else if (provider === 'anthropic' && settings.anthropicApiKey) {
                apiKey = settings.anthropicApiKey;
            } else {
                // Fallback to any available key
                if (settings.groqApiKey) {
                    apiKey = settings.groqApiKey;
                    provider = 'groq';
                } else if (settings.openaiApiKey) {
                    apiKey = settings.openaiApiKey;
                    provider = 'openai';
                } else if (settings.anthropicApiKey) {
                    apiKey = settings.anthropicApiKey;
                    provider = 'anthropic';
                }
            }

            if (!apiKey) {
                // Show more detailed error message
                const errorMsg = `API key not configured. Please set your API key in the extension settings.

Debug info:
- Provider: ${provider}
- Has Groq key: ${!!settings.groqApiKey}
- Has OpenAI key: ${!!settings.openaiApiKey}
- Has Anthropic key: ${!!settings.anthropicApiKey}

To fix this:
1. Click the PromptStruct extension icon
2. Click the settings gear (⚙️)
3. Enter your ${provider.toUpperCase()} API key
4. Click Save Settings`;

                throw new Error(errorMsg);
            }

            console.log(`PromptStruct: Using ${provider} API`);

            // Send message to background script
            const response = await chrome.runtime.sendMessage({
                action: 'convertPrompt',
                data: {
                    prompt: promptText,
                    schema: schema,
                    provider: provider,
                    model: settings.model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4'),
                    apiKey: apiKey,
                    temperature: settings.temperature || 0.3
                }
            });

            if (response.success) {
                this.currentJSON = response.data.json;

                // Format and display JSON
                try {
                    const formattedJSON = JSON.stringify(JSON.parse(response.data.json), null, 2);
                    outputDiv.textContent = formattedJSON;
                } catch (e) {
                    outputDiv.textContent = response.data.json;
                }

                // Show output and controls
                outputSection.style.display = 'block';
                injectSection.style.display = 'block';

                // Store for feedback
                this.lastConversion = {
                    prompt: promptText,
                    schema: schema,
                    output: response.data.json,
                    timestamp: Date.now(),
                    provider: response.data.provider
                };
            } else {
                throw new Error(response.error || 'Conversion failed');
            }
        } catch (error) {
            console.error('PromptStruct conversion error:', error);
            outputDiv.textContent = `Error: ${error.message}`;
            outputDiv.style.display = 'block';
        } finally {
            convertButton.disabled = false;
            convertButton.innerHTML = '✨ Convert to JSON';
        }
    }

    injectIntoAI() {
        if (!this.currentJSON) return;

        const inputElement = document.querySelector(this.promptSelectors.input);
        if (!inputElement) {
            this.showToast(`Could not find input field for ${this.currentSite}`, 'error');
            return;
        }

        // Create enhanced prompt with JSON
        const enhancedPrompt = `Here's a structured JSON prompt for better results:\n\n${this.currentJSON}\n\nPlease process this structured request.`;

        this.injectText(inputElement, enhancedPrompt);
        this.showSuccessFeedback('Injected with context');
    }

    injectDirectly() {
        if (!this.currentJSON) return;

        const inputElement = document.querySelector(this.promptSelectors.input);
        if (!inputElement) {
            this.showToast(`Could not find input field for ${this.currentSite}`, 'error');
            return;
        }

        // Inject just the JSON
        this.injectText(inputElement, this.currentJSON);
        this.showSuccessFeedback('Direct JSON injected');
    }

    injectText(inputElement, text) {
        // Clear existing content first
        if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
            inputElement.value = text;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // For contenteditable divs
            inputElement.textContent = text;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Focus and set cursor to end
        inputElement.focus();

        // Set cursor to end for contenteditable
        if (inputElement.contentEditable === 'true') {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(inputElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Hide panel after injection
        this.hidePanel();
    }

    showSuccessFeedback(message = 'Success') {
        this.sphere.innerHTML = '✅';
        this.sphere.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        this.showToast(message, 'success');

        setTimeout(() => {
            this.sphere.innerHTML = '🚀';
            this.sphere.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 2000);
    }

    async copyToClipboard() {
        if (!this.currentJSON) return;

        try {
            await navigator.clipboard.writeText(this.currentJSON);
            this.showToast('JSON copied to clipboard!', 'success');

            // Visual feedback on copy button
            const copyBtn = this.panel.querySelector('#promptstruct-copy');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    exportJSON() {
        if (!this.currentJSON) return;

        try {
            const blob = new Blob([this.currentJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `promptstruct-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('JSON exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export:', error);
            this.showToast('Failed to export JSON', 'error');
        }
    }

    async enhancePrompt() {
        const promptText = this.panel.querySelector('#promptstruct-input').value;
        if (!promptText.trim()) {
            this.showToast('Please enter a prompt to enhance', 'warning');
            return;
        }

        const enhanceBtn = this.panel.querySelector('#promptstruct-enhance');
        const originalText = enhanceBtn.innerHTML;
        enhanceBtn.innerHTML = '🔄';
        enhanceBtn.disabled = true;

        try {
            // Get API settings
            const settings = await chrome.storage.sync.get(['groqApiKey', 'openaiApiKey', 'anthropicApiKey', 'provider']);

            const response = await chrome.runtime.sendMessage({
                action: 'enhancePrompt',
                data: {
                    prompt: promptText,
                    provider: settings.provider || 'groq',
                    apiKey: settings.groqApiKey || settings.openaiApiKey || settings.anthropicApiKey
                }
            });

            if (response.success) {
                this.panel.querySelector('#promptstruct-input').value = response.data.enhancedPrompt;
                this.showToast('Prompt enhanced successfully!', 'success');
            } else {
                throw new Error(response.error || 'Enhancement failed');
            }
        } catch (error) {
            console.error('Enhancement error:', error);
            this.showToast('Failed to enhance prompt', 'error');
        } finally {
            enhanceBtn.innerHTML = originalText;
            enhanceBtn.disabled = false;
        }
    }

    async optimizePrompt() {
        const promptText = this.panel.querySelector('#promptstruct-input').value;
        if (!promptText.trim()) {
            this.showToast('Please enter a prompt to optimize', 'warning');
            return;
        }

        this.showToast('AI optimization suggestions coming soon!', 'info');
    }

    async submitFeedback(type) {
        if (!this.lastConversion) return;

        try {
            const feedbackData = {
                ...this.lastConversion,
                feedbackType: type,
                timestamp: Date.now(),
                site: this.currentSite
            };

            // Store feedback locally
            const existingFeedback = await chrome.storage.local.get(['promptstructFeedback']);
            const feedback = existingFeedback.promptstructFeedback || [];
            feedback.push(feedbackData);

            await chrome.storage.local.set({ promptstructFeedback: feedback });

            // Visual feedback
            const feedbackBtns = this.panel.querySelectorAll('.promptstruct-thumb-btn, .promptstruct-star-btn');
            feedbackBtns.forEach(btn => btn.style.opacity = '0.5');

            const clickedBtn = this.panel.querySelector(`#promptstruct-${type === 'positive' ? 'thumbs-up' : type === 'negative' ? 'thumbs-down' : 'star'}`);
            if (clickedBtn) {
                clickedBtn.style.opacity = '1';
                clickedBtn.style.background = 'rgba(34, 197, 94, 0.2)';
            }

            this.showToast(`Feedback submitted: ${type}`, 'success');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            this.showToast('Failed to submit feedback', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `promptstruct-toast promptstruct-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Add animation styles
        if (!document.querySelector('#promptstruct-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'promptstruct-toast-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    observePromptChanges() {
        // Watch for changes in the AI input field
        const observer = new MutationObserver(() => {
            const inputElement = document.querySelector(this.promptSelectors.input);
            if (inputElement) {
                // Add subtle visual indicator when prompt is detected
                const hasText = (inputElement.value || inputElement.textContent || '').trim().length > 0;
                if (hasText) {
                    this.sphere.style.boxShadow = '0 8px 32px rgba(34, 197, 94, 0.4)';
                    this.sphere.classList.add('active');
                } else {
                    this.sphere.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                    this.sphere.classList.remove('active');
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['value']
        });
    }

    // Auto-enhance prompts when user types
    setupAutoEnhancement() {
        let enhancementTimeout;
        const inputElement = document.querySelector(this.promptSelectors.input);

        if (inputElement) {
            inputElement.addEventListener('input', () => {
                clearTimeout(enhancementTimeout);
                enhancementTimeout = setTimeout(() => {
                    this.suggestEnhancement();
                }, 2000); // Wait 2 seconds after user stops typing
            });
        }
    }

    async suggestEnhancement() {
        const inputElement = document.querySelector(this.promptSelectors.input);
        if (!inputElement) return;

        const promptText = (inputElement.value || inputElement.textContent || '').trim();
        if (promptText.length < 20) return; // Only suggest for substantial prompts

        // Show subtle notification
        this.showEnhancementSuggestion();
    }

    showEnhancementSuggestion() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 90px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 9999;
            animation: fadeInOut 3s ease-in-out;
            pointer-events: none;
        `;
        notification.textContent = '💡 Click to enhance with PromptStruct';

        // Add fadeInOut animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateY(10px); }
                20%, 80% { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
console.log('PromptStruct: Content script loaded');
console.log('PromptStruct: Document ready state:', document.readyState);
console.log('PromptStruct: Current URL:', window.location.href);

function initializePromptStruct() {
    console.log('PromptStruct: Initializing...');
    try {
        new PromptStructIntegration();
    } catch (error) {
        console.error('PromptStruct: Failed to initialize:', error);
    }
}

if (document.readyState === 'loading') {
    console.log('PromptStruct: Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initializePromptStruct);
} else {
    console.log('PromptStruct: DOM already loaded, initializing immediately');
    // Add a small delay to ensure everything is ready
    setTimeout(initializePromptStruct, 100);
}
