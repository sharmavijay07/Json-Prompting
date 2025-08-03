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

            /* Developer Tools Styles */
            .promptstruct-dev-tools {
                margin: 16px 0;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f9fafb;
            }

            .promptstruct-dev-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f3f4f6;
                border-radius: 8px 8px 0 0;
                cursor: pointer;
                font-weight: 500;
                color: #374151;
            }

            .promptstruct-dev-header:hover {
                background: #e5e7eb;
            }

            .promptstruct-dev-toggle {
                background: none;
                border: none;
                font-size: 12px;
                color: #6b7280;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .promptstruct-dev-content {
                padding: 16px;
            }

            .promptstruct-dev-row {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
            }

            .promptstruct-dev-row:last-child {
                margin-bottom: 0;
            }

            .promptstruct-dev-btn {
                flex: 1;
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
            }

            .promptstruct-dev-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .promptstruct-dev-btn:nth-child(even) {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }

            .promptstruct-dev-btn:nth-child(even):hover {
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

                .promptstruct-dev-row {
                    flex-direction: column;
                }

                .promptstruct-dev-btn {
                    margin-bottom: 4px;
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
                        <option value="typescript-interface">TypeScript Interface</option>
                        <option value="python-pydantic">Python Pydantic Model</option>
                        <option value="json-schema">JSON Schema</option>
                        <option value="zod-schema">Zod Schema</option>
                        <option value="api-endpoint">REST API Endpoint</option>
                        <option value="graphql-schema">GraphQL Schema</option>
                        <option value="custom">Custom Schema</option>
                    </select>
                </div>

                <!-- Developer Tools Section -->
                <div class="promptstruct-dev-tools" id="promptstruct-dev-tools">
                    <div class="promptstruct-dev-header">
                        <span>🛠️ Developer Tools</span>
                        <button class="promptstruct-dev-toggle" id="promptstruct-dev-toggle">▼</button>
                    </div>
                    <div class="promptstruct-dev-content" id="promptstruct-dev-content" style="display: none;">
                        <div class="promptstruct-dev-row">
                            <button class="promptstruct-dev-btn" id="promptstruct-code-detect" title="Auto-detect code context">
                                🔍 Detect Code Context
                            </button>
                            <button class="promptstruct-dev-btn" id="promptstruct-add-validation" title="Add validation rules">
                                ✅ Add Validation
                            </button>
                        </div>
                        <div class="promptstruct-dev-row">
                            <button class="promptstruct-dev-btn" id="promptstruct-add-examples" title="Add code examples">
                                📝 Add Examples
                            </button>
                            <button class="promptstruct-dev-btn" id="promptstruct-add-tests" title="Include test cases">
                                🧪 Add Tests
                            </button>
                        </div>
                        <div class="promptstruct-dev-row">
                            <button class="promptstruct-dev-btn" id="promptstruct-add-docs" title="Add documentation">
                                📚 Add Docs
                            </button>
                            <button class="promptstruct-dev-btn" id="promptstruct-add-types" title="Add type safety">
                                🔒 Add Types
                            </button>
                        </div>
                        <div class="promptstruct-dev-row">
                            <button class="promptstruct-dev-btn" id="promptstruct-quick-snippets" title="Quick code snippets">
                                ⚡ Quick Snippets
                            </button>
                            <button class="promptstruct-dev-btn" id="promptstruct-best-practices" title="Add best practices">
                                🏆 Best Practices
                            </button>
                        </div>
                    </div>
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

        // Developer tools toggle
        const devToggle = this.panel.querySelector('#promptstruct-dev-toggle');
        const devHeader = this.panel.querySelector('.promptstruct-dev-header');

        if (devToggle && devHeader) {
            // Add click listener to both the button and header
            devToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDevTools();
            });

            devHeader.addEventListener('click', () => {
                this.toggleDevTools();
            });
        }

        // Developer tool buttons with error handling
        const devButtons = [
            { id: '#promptstruct-code-detect', method: 'detectCodeContext' },
            { id: '#promptstruct-add-validation', method: 'addValidationRules' },
            { id: '#promptstruct-add-examples', method: 'addCodeExamples' },
            { id: '#promptstruct-add-tests', method: 'addTestCases' },
            { id: '#promptstruct-add-docs', method: 'addDocumentation' },
            { id: '#promptstruct-add-types', method: 'addTypeSafety' },
            { id: '#promptstruct-quick-snippets', method: 'showQuickSnippets' },
            { id: '#promptstruct-best-practices', method: 'addBestPractices' }
        ];

        devButtons.forEach(({ id, method }) => {
            const button = this.panel.querySelector(id);
            if (button) {
                button.addEventListener('click', () => {
                    try {
                        this[method]();
                    } catch (error) {
                        console.error(`Error in ${method}:`, error);
                        this.showToast(`Error: ${method} failed`, 'error');
                    }
                });
            } else {
                console.warn(`Developer button not found: ${id}`);
            }
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

        const optimizeBtn = this.panel.querySelector('#promptstruct-optimize');
        const originalText = optimizeBtn.innerHTML;
        optimizeBtn.innerHTML = '🔄 Analyzing...';
        optimizeBtn.disabled = true;

        try {
            // Get API settings
            const settings = await chrome.storage.sync.get(['groqApiKey', 'openaiApiKey', 'anthropicApiKey', 'provider']);

            // Get previous feedback for learning
            const feedbackData = await chrome.storage.local.get(['promptstructFeedback']);
            const feedback = feedbackData.promptstructFeedback || [];

            const response = await chrome.runtime.sendMessage({
                action: 'optimizePrompt',
                data: {
                    prompt: promptText,
                    provider: settings.provider || 'groq',
                    apiKey: settings.groqApiKey || settings.openaiApiKey || settings.anthropicApiKey,
                    feedbackHistory: feedback.slice(-10) // Last 10 feedback entries for learning
                }
            });

            if (response.success) {
                // Handle different response formats
                let suggestions = response.data.suggestions;
                if (!Array.isArray(suggestions)) {
                    // If it's a string, try to parse it as JSON
                    if (typeof suggestions === 'string') {
                        try {
                            const parsed = JSON.parse(suggestions);
                            suggestions = parsed.suggestions || parsed.improvements || [];
                        } catch (e) {
                            // If parsing fails, create a simple suggestion
                            suggestions = [{
                                title: 'Optimization Suggestion',
                                description: suggestions,
                                action: 'append',
                                addition: '\n\nOptimization: ' + suggestions
                            }];
                        }
                    } else if (suggestions && suggestions.improvements) {
                        // Handle the format from the background script
                        suggestions = suggestions.improvements.map(imp => ({
                            title: imp.category || 'Improvement',
                            description: imp.suggestion || imp.issue,
                            action: 'replace',
                            newPrompt: suggestions.optimized_prompt || this.panel.querySelector('#promptstruct-input').value + '\n\n' + imp.suggestion
                        }));
                    } else {
                        // Fallback to empty array
                        suggestions = [];
                    }
                }

                if (suggestions.length > 0) {
                    this.showOptimizationSuggestions(suggestions);
                    this.showToast('Optimization suggestions generated!', 'success');
                } else {
                    this.showToast('No specific optimizations suggested', 'info');
                }
            } else {
                throw new Error(response.error || 'Optimization failed');
            }
        } catch (error) {
            console.error('Optimization error:', error);
            this.showToast('Failed to generate optimization suggestions', 'error');
        } finally {
            optimizeBtn.innerHTML = originalText;
            optimizeBtn.disabled = false;
        }
    }

    showOptimizationSuggestions(suggestions) {
        console.log('Showing optimization suggestions:', suggestions);

        // Ensure suggestions is an array and has valid data
        if (!Array.isArray(suggestions)) {
            console.error('Suggestions is not an array:', suggestions);
            suggestions = [];
        }

        // Filter out invalid suggestions and add defaults if needed
        const validSuggestions = suggestions.filter(s => s && typeof s === 'object').map(suggestion => ({
            title: suggestion.title || suggestion.category || suggestion.type || 'Optimization Suggestion',
            description: suggestion.description || suggestion.suggestion || suggestion.issue || suggestion.text || 'Improve your prompt structure and clarity',
            action: suggestion.action || 'append',
            addition: suggestion.addition || suggestion.newPrompt || suggestion.improvement || '',
            newPrompt: suggestion.newPrompt || ''
        }));

        // If no valid suggestions, create default ones
        if (validSuggestions.length === 0) {
            validSuggestions.push(
                {
                    title: 'Add Context',
                    description: 'Include more specific context about your requirements',
                    action: 'append',
                    addition: '\n\nAdditional context: Please provide specific examples and detailed requirements.'
                },
                {
                    title: 'Improve Clarity',
                    description: 'Make your prompt more clear and specific',
                    action: 'append',
                    addition: '\n\nClarification: Be more specific about the expected output format and constraints.'
                },
                {
                    title: 'Add Examples',
                    description: 'Include examples to guide the AI response',
                    action: 'append',
                    addition: '\n\nExample: [Provide a concrete example of what you want]'
                }
            );
        }

        // Create suggestions popup
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'promptstruct-suggestions-popup';
        suggestionsDiv.innerHTML = `
            <div class="promptstruct-suggestions-header">
                <h4>💡 Optimization Suggestions</h4>
                <button class="promptstruct-suggestions-close">×</button>
            </div>
            <div class="promptstruct-suggestions-content">
                ${validSuggestions.map((suggestion, index) => `
                    <div class="promptstruct-suggestion-item">
                        <div class="suggestion-title">${suggestion.title}</div>
                        <div class="suggestion-description">${suggestion.description}</div>
                        <button class="suggestion-apply-btn" data-suggestion="${index}">Apply</button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add styles for suggestions popup
        if (!document.querySelector('#promptstruct-suggestions-styles')) {
            const style = document.createElement('style');
            style.id = 'promptstruct-suggestions-styles';
            style.textContent = `
                .promptstruct-suggestions-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px;
                    max-height: 400px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 10001;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .promptstruct-suggestions-header {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .promptstruct-suggestions-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }
                .promptstruct-suggestions-content {
                    padding: 20px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .promptstruct-suggestion-item {
                    margin-bottom: 16px;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: #f9fafb;
                }
                .suggestion-title {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 4px;
                }
                .suggestion-description {
                    font-size: 14px;
                    color: #6b7280;
                    margin-bottom: 8px;
                }
                .suggestion-apply-btn {
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .suggestion-apply-btn:hover {
                    background: #059669;
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(suggestionsDiv);

        // Add event listeners
        suggestionsDiv.querySelector('.promptstruct-suggestions-close').addEventListener('click', () => {
            suggestionsDiv.remove();
        });

        suggestionsDiv.querySelectorAll('.suggestion-apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestionIndex = parseInt(e.target.dataset.suggestion);
                const suggestion = validSuggestions[suggestionIndex];
                if (suggestion.action === 'replace') {
                    this.panel.querySelector('#promptstruct-input').value = suggestion.newPrompt;
                } else if (suggestion.action === 'append') {
                    const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
                    this.panel.querySelector('#promptstruct-input').value = currentPrompt + ' ' + suggestion.addition;
                }
                this.showToast('Suggestion applied!', 'success');
                suggestionsDiv.remove();
            });
        });

        // Close on outside click
        document.addEventListener('click', function closeOnOutside(e) {
            if (!suggestionsDiv.contains(e.target)) {
                suggestionsDiv.remove();
                document.removeEventListener('click', closeOnOutside);
            }
        });
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

        // Also observe for AI responses to learn from them
        this.observeAIResponses();
    }

    observeAIResponses() {
        // Different selectors for AI response containers on different platforms
        const responseSelectors = {
            'ChatGPT': '[data-message-author-role="assistant"]',
            'Claude': '[data-is-streaming="false"]',
            'Gemini': '.model-response-text',
            'Grok': '.response-content',
            'Poe': '.Message_botMessageBubble',
            'Perplexity': '.prose',
            'You.com': '.response-text',
            'Copilot': '.response-message'
        };

        const responseSelector = responseSelectors[this.currentSite];
        if (!responseSelector) return;

        const responseObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const responseElement = node.querySelector ? node.querySelector(responseSelector) : null;
                            if (responseElement || node.matches?.(responseSelector)) {
                                this.captureAIResponse(responseElement || node);
                            }
                        }
                    });
                }
            });
        });

        responseObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async captureAIResponse(responseElement) {
        // Wait a bit to ensure the response is complete
        setTimeout(async () => {
            const responseText = responseElement.textContent || responseElement.innerText;
            if (responseText && responseText.length > 50) { // Only capture substantial responses

                // Check if this response is related to our last conversion
                if (this.lastConversion && Date.now() - this.lastConversion.timestamp < 300000) { // 5 minutes
                    const learningData = {
                        ...this.lastConversion,
                        aiResponse: responseText.substring(0, 2000), // Limit response length
                        responseTimestamp: Date.now(),
                        site: this.currentSite,
                        responseQuality: 'pending' // Will be updated when user provides feedback
                    };

                    // Store for learning
                    const existingLearning = await chrome.storage.local.get(['promptstructLearning']);
                    const learning = existingLearning.promptstructLearning || [];
                    learning.push(learningData);

                    // Keep only last 100 entries to avoid storage bloat
                    if (learning.length > 100) {
                        learning.splice(0, learning.length - 100);
                    }

                    await chrome.storage.local.set({ promptstructLearning: learning });

                    console.log('PromptStruct: Captured AI response for learning');
                }
            }
        }, 2000);
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

    // Developer Tools Methods
    toggleDevTools() {
        const content = this.panel.querySelector('#promptstruct-dev-content');
        const toggle = this.panel.querySelector('#promptstruct-dev-toggle');

        if (!content || !toggle) {
            console.error('Developer tools elements not found');
            this.showToast('Developer tools not available', 'error');
            return;
        }

        console.log('Toggling dev tools, current display:', content.style.display);

        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            toggle.textContent = '▲';
            this.showToast('Developer tools opened', 'info');
        } else {
            content.style.display = 'none';
            toggle.textContent = '▼';
            this.showToast('Developer tools closed', 'info');
        }
    }

    detectCodeContext() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;

        // Analyze the prompt for code-related keywords
        const codeKeywords = {
            'function': 'function development',
            'class': 'class/object design',
            'api': 'API development',
            'database': 'database operations',
            'algorithm': 'algorithm implementation',
            'test': 'testing and validation',
            'component': 'component development',
            'service': 'service architecture',
            'model': 'data modeling',
            'interface': 'interface design'
        };

        let detectedContext = [];
        const lowerPrompt = currentPrompt.toLowerCase();

        Object.keys(codeKeywords).forEach(keyword => {
            if (lowerPrompt.includes(keyword)) {
                detectedContext.push(codeKeywords[keyword]);
            }
        });

        if (detectedContext.length > 0) {
            const enhancement = `\n\nDetected context: ${detectedContext.join(', ')}. Please ensure the implementation includes proper error handling, type safety, and follows best practices for ${detectedContext[0]}.`;
            this.panel.querySelector('#promptstruct-input').value = currentPrompt + enhancement;
            this.showToast(`Added context: ${detectedContext.join(', ')}`, 'success');
        } else {
            this.showToast('No specific code context detected', 'info');
        }
    }

    addValidationRules() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
        const validation = `\n\nValidation requirements:
- Input validation for all parameters
- Type checking and sanitization
- Error handling for edge cases
- Boundary condition checks
- Security validation (SQL injection, XSS prevention)`;

        this.panel.querySelector('#promptstruct-input').value = currentPrompt + validation;
        this.showToast('Added validation requirements', 'success');
    }

    addCodeExamples() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
        const examples = `\n\nPlease include:
- Code examples showing usage
- Input/output examples
- Edge case examples
- Best practice examples
- Common pitfall examples`;

        this.panel.querySelector('#promptstruct-input').value = currentPrompt + examples;
        this.showToast('Added example requirements', 'success');
    }

    addTestCases() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
        const tests = `\n\nTesting requirements:
- Unit test cases for all functions
- Integration test scenarios
- Edge case testing
- Performance test considerations
- Mock data examples
- Test coverage expectations`;

        this.panel.querySelector('#promptstruct-input').value = currentPrompt + tests;
        this.showToast('Added testing requirements', 'success');
    }

    addDocumentation() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
        const docs = `\n\nDocumentation requirements:
- Comprehensive JSDoc/docstring comments
- README with usage instructions
- API documentation
- Code comments explaining complex logic
- Examples and tutorials
- Changelog and versioning info`;

        this.panel.querySelector('#promptstruct-input').value = currentPrompt + docs;
        this.showToast('Added documentation requirements', 'success');
    }

    addTypeSafety() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
        const types = `\n\nType safety requirements:
- Strong typing for all parameters and returns
- Interface/type definitions
- Generic type support where applicable
- Runtime type checking
- Type guards and assertions
- Null/undefined safety`;

        this.panel.querySelector('#promptstruct-input').value = currentPrompt + types;
        this.showToast('Added type safety requirements', 'success');
    }

    showQuickSnippets() {
        const snippets = [
            {
                title: 'REST API Endpoint',
                prompt: 'Create a REST API endpoint that handles CRUD operations for [resource] with proper error handling, validation, and authentication.'
            },
            {
                title: 'React Component',
                prompt: 'Create a React functional component with TypeScript that [functionality] using hooks, proper prop types, and error boundaries.'
            },
            {
                title: 'Database Schema',
                prompt: 'Design a database schema for [entity] with proper relationships, indexes, constraints, and migration scripts.'
            },
            {
                title: 'Algorithm Implementation',
                prompt: 'Implement [algorithm name] with optimal time/space complexity, including edge case handling and comprehensive test cases.'
            },
            {
                title: 'Microservice',
                prompt: 'Design a microservice for [functionality] with proper logging, monitoring, health checks, and containerization.'
            },
            {
                title: 'Data Processing Pipeline',
                prompt: 'Create a data processing pipeline that [processes data] with error handling, retry logic, and performance optimization.'
            }
        ];

        this.showSnippetSelector(snippets);
    }

    showSnippetSelector(snippets) {
        const modal = document.createElement('div');
        modal.className = 'promptstruct-snippet-modal';
        modal.innerHTML = `
            <div class="promptstruct-snippet-content">
                <div class="promptstruct-snippet-header">
                    <h4>⚡ Quick Code Snippets</h4>
                    <button class="promptstruct-snippet-close">×</button>
                </div>
                <div class="promptstruct-snippet-list">
                    ${snippets.map((snippet, index) => `
                        <div class="promptstruct-snippet-item" data-index="${index}">
                            <div class="snippet-title">${snippet.title}</div>
                            <div class="snippet-preview">${snippet.prompt.substring(0, 100)}...</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add styles
        if (!document.querySelector('#promptstruct-snippet-styles')) {
            const style = document.createElement('style');
            style.id = 'promptstruct-snippet-styles';
            style.textContent = `
                .promptstruct-snippet-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10002;
                }
                .promptstruct-snippet-content {
                    background: white;
                    border-radius: 12px;
                    width: 500px;
                    max-height: 600px;
                    overflow: hidden;
                }
                .promptstruct-snippet-header {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .promptstruct-snippet-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }
                .promptstruct-snippet-list {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 20px;
                }
                .promptstruct-snippet-item {
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .promptstruct-snippet-item:hover {
                    background: #f0f4ff;
                    border-color: #3b82f6;
                    transform: translateY(-1px);
                }
                .snippet-title {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 4px;
                }
                .snippet-preview {
                    font-size: 12px;
                    color: #6b7280;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.promptstruct-snippet-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelectorAll('.promptstruct-snippet-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const snippet = snippets[index];
                this.panel.querySelector('#promptstruct-input').value = snippet.prompt;
                this.showToast(`Applied ${snippet.title} template`, 'success');
                modal.remove();
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    addBestPractices() {
        const currentPrompt = this.panel.querySelector('#promptstruct-input').value;
        const practices = `\n\nBest practices to include:
- SOLID principles compliance
- Clean code standards
- Performance optimization
- Security best practices
- Accessibility considerations
- Code maintainability
- Error handling patterns
- Logging and monitoring
- Code documentation
- Testing strategies`;

        this.panel.querySelector('#promptstruct-input').value = currentPrompt + practices;
        this.showToast('Added best practices requirements', 'success');
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
