// Prompt Template Library for PromptStruct Extension

class PromptTemplateLibrary {
    static getTemplates() {
        return {
            'api-endpoint': {
                name: 'API Endpoint Function',
                description: 'Create a function that calls an external API endpoint',
                category: 'API Integration',
                template: {
                    format: (values) => `Create a function that ${values.action || '[action]'} by calling the ${values.api_name || '[api_name]'} API. The function should:

- Accept parameters: ${values.parameters || '[parameters]'}
- Make a ${values.method || 'GET'} request to ${values.endpoint || '[endpoint]'}
- Handle authentication using ${values.auth_method || '[auth_method]'}
- Return ${values.return_format || '[return_format]'}
- Include proper error handling for ${values.error_cases || '[error_cases]'}

The function should be robust and include input validation.`
                },
                variables: ['action', 'api_name', 'parameters', 'method', 'endpoint', 'auth_method', 'return_format', 'error_cases']
            },

            'data-validation': {
                name: 'Data Validation Function',
                description: 'Create a function that validates data structures',
                category: 'Data Processing',
                template: {
                    format: (values) => `Create a data validation function that validates ${values.data_type || '[data_type]'} data. The function should:

- Validate required fields: ${values.required_fields || '[required_fields]'}
- Check data types for: ${values.type_checks || '[type_checks]'}
- Apply business rules: ${values.business_rules || '[business_rules]'}
- Return validation results with: ${values.result_format || '[result_format]'}
- Handle edge cases: ${values.edge_cases || '[edge_cases]'}

Include comprehensive error messages and validation feedback.`
                },
                variables: ['data_type', 'required_fields', 'type_checks', 'business_rules', 'result_format', 'edge_cases']
            },

            'email-processing': {
                name: 'Email Processing Function',
                description: 'Create a function that processes and analyzes emails',
                category: 'Communication',
                template: {
                    format: (values) => `Create an email processing function that ${values.email_action || '[email_action]'}. The function should:

- Parse email content including: ${values.parse_elements || '[parse_elements]'}
- Extract information: ${values.extract_info || '[extract_info]'}
- Apply filters based on: ${values.filter_criteria || '[filter_criteria]'}
- Generate output format: ${values.output_format || '[output_format]'}
- Handle different email types: ${values.email_types || '[email_types]'}

Include support for attachments and HTML content parsing.`
                },
                variables: ['email_action', 'parse_elements', 'extract_info', 'filter_criteria', 'output_format', 'email_types']
            },

            'database-query': {
                name: 'Database Query Function',
                description: 'Create a function that queries and manipulates database data',
                category: 'Database',
                template: {
                    format: (values) => `Create a database function that ${values.db_operation || '[db_operation]'} in the ${values.database_type || '[database_type]'} database. The function should:

- Connect to database: ${values.connection_details || '[connection_details]'}
- Execute query on tables: ${values.tables || '[tables]'}
- Apply filters: ${values.filters || '[filters]'}
- Return data format: ${values.return_format || '[return_format]'}
- Handle transactions: ${values.transaction_handling || '[transaction_handling]'}
- Include error handling for: ${values.error_scenarios || '[error_scenarios]'}

Ensure proper SQL injection prevention and connection management.`
                },
                variables: ['db_operation', 'database_type', 'connection_details', 'tables', 'filters', 'return_format', 'transaction_handling', 'error_scenarios']
            },

            'file-processing': {
                name: 'File Processing Function',
                description: 'Create a function that processes and manipulates files',
                category: 'File Operations',
                template: {
                    format: (values) => `Create a file processing function that ${values.file_operation || '[file_operation]'} ${values.file_types || '[file_types]'} files. The function should:

- Read files from: ${values.input_location || '[input_location]'}
- Process content by: ${values.processing_steps || '[processing_steps]'}
- Apply transformations: ${values.transformations || '[transformations]'}
- Output to format: ${values.output_format || '[output_format]'}
- Handle file errors: ${values.error_handling || '[error_handling]'}
- Support batch processing: ${values.batch_features || '[batch_features]'}

Include proper file validation and memory management.`
                },
                variables: ['file_operation', 'file_types', 'input_location', 'processing_steps', 'transformations', 'output_format', 'error_handling', 'batch_features']
            },

            'web-scraping': {
                name: 'Web Scraping Function',
                description: 'Create a function that scrapes and extracts web data',
                category: 'Web Automation',
                template: {
                    format: (values) => `Create a web scraping function that extracts ${values.data_target || '[data_target]'} from ${values.website_type || '[website_type]'} websites. The function should:

- Navigate to URLs: ${values.target_urls || '[target_urls]'}
- Extract elements: ${values.extract_elements || '[extract_elements]'}
- Handle dynamic content: ${values.dynamic_handling || '[dynamic_handling]'}
- Apply data cleaning: ${values.data_cleaning || '[data_cleaning]'}
- Store results in: ${values.storage_format || '[storage_format]'}
- Respect rate limits: ${values.rate_limiting || '[rate_limiting]'}

Include proper error handling and anti-detection measures.`
                },
                variables: ['data_target', 'website_type', 'target_urls', 'extract_elements', 'dynamic_handling', 'data_cleaning', 'storage_format', 'rate_limiting']
            },

            'text-analysis': {
                name: 'Text Analysis Function',
                description: 'Create a function that analyzes and processes text content',
                category: 'Natural Language Processing',
                template: {
                    format: (values) => `Create a text analysis function that performs ${values.analysis_type || '[analysis_type]'} on ${values.text_source || '[text_source]'}. The function should:

- Process text input: ${values.input_processing || '[input_processing]'}
- Apply analysis techniques: ${values.analysis_methods || '[analysis_methods]'}
- Extract insights: ${values.insights || '[insights]'}
- Generate metrics: ${values.metrics || '[metrics]'}
- Output results as: ${values.output_structure || '[output_structure]'}
- Handle multiple languages: ${values.language_support || '[language_support]'}

Include confidence scores and detailed analysis breakdown.`
                },
                variables: ['analysis_type', 'text_source', 'input_processing', 'analysis_methods', 'insights', 'metrics', 'output_structure', 'language_support']
            },

            'workflow-automation': {
                name: 'Workflow Automation Function',
                description: 'Create a function that automates business workflows',
                category: 'Automation',
                template: {
                    format: (values) => `Create a workflow automation function that ${values.workflow_purpose || '[workflow_purpose]'} for ${values.business_context || '[business_context]'}. The function should:

- Trigger on events: ${values.trigger_events || '[trigger_events]'}
- Execute steps: ${values.workflow_steps || '[workflow_steps]'}
- Make decisions based on: ${values.decision_criteria || '[decision_criteria]'}
- Integrate with systems: ${values.system_integrations || '[system_integrations]'}
- Send notifications: ${values.notification_methods || '[notification_methods]'}
- Log activities: ${values.logging_requirements || '[logging_requirements]'}

Include rollback capabilities and comprehensive monitoring.`
                },
                variables: ['workflow_purpose', 'business_context', 'trigger_events', 'workflow_steps', 'decision_criteria', 'system_integrations', 'notification_methods', 'logging_requirements']
            }
        };
    }

    static getTemplatesByCategory() {
        const templates = this.getTemplates();
        const categories = {};
        
        Object.entries(templates).forEach(([key, template]) => {
            const category = template.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({ key, ...template });
        });
        
        return categories;
    }

    static getTemplate(key) {
        const templates = this.getTemplates();
        return templates[key] || null;
    }
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.PromptTemplateLibrary = PromptTemplateLibrary;
}
