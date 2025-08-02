# PromptStruct Demo Examples

Try these example prompts to test all the enhanced features of PromptStruct v2.0!

## 🚀 Quick Start Examples

### 1. OpenAI Function Calling
**Prompt**: 
```
Create a function that takes a user's email and password, validates the email format, checks password strength (minimum 8 characters, at least one uppercase, one lowercase, one number), and returns authentication status with detailed feedback.
```

**Expected Output**: OpenAI function with email/password parameters, validation rules, and structured response format.

### 2. LangChain Tool
**Prompt**:
```
Create a tool that searches for recent news articles about a specific topic, filters by date range and source credibility, and returns summarized results with sentiment analysis.
```

**Expected Output**: LangChain tool definition with search parameters, filtering options, and structured output schema.

### 3. Agent Prompt
**Prompt**:
```
Create an AI agent that acts as a customer service representative for an e-commerce platform. The agent should handle order inquiries, process returns, provide product recommendations, and escalate complex issues to human agents when necessary.
```

**Expected Output**: Structured agent prompt with role definition, capabilities, constraints, and escalation procedures.

## 🚀 New Features Demo

### Model Comparison Testing
**Test Prompt:**
```
Create a function that processes customer feedback, analyzes sentiment, and generates actionable insights for product improvement.
```

**Steps:**
1. Enter the prompt above
2. Click "Compare" button
3. Watch as PromptStruct tests the same prompt across OpenAI, Anthropic, and Groq
4. Compare the different outputs and choose the best one

### Batch Processing Demo
**Test Prompts:**
```
Create a function that validates email addresses
Build a tool for sentiment analysis of social media posts
Design an agent for automated customer support
Generate a schema for user authentication system
Create a function for real-time data processing
```

**Steps:**
1. Click "Batch" button
2. Paste the prompts above (one per line)
3. Click "Process Batch"
4. Review all results and export them as a single file

### Template Library Testing
**Steps:**
1. Click "Templates" button
2. Try the "Function Creation" template
3. Fill in variables like:
   - Functionality: "validates user passwords"
   - Parameters: "password (string), requirements (object)"
   - Behavior: "Check length, complexity, and common patterns"
   - Return Type: "validation result with strength score"
4. Apply template and convert

### Usage Tracking Demo
**Steps:**
1. Make several conversions using different providers
2. Check the "Usage & Cost" section that appears
3. View token usage and estimated costs
4. Compare efficiency across providers

## 🎯 Feature Testing Examples

### Prompt Optimization Testing

#### Before Optimization:
```
make a function for users
```

#### After Using Optimize Feature:
The AI will suggest improvements like:
- Specify what the function should do
- Define input parameters
- Clarify expected output
- Add validation requirements

#### Improved Prompt Example:
```
Create a function that manages user registration, takes email and password as input, validates email format and password strength, stores user data securely, and returns success/error status with appropriate messages.
```

### Schema Comparison Testing

Try the same prompt with different schemas to see how the output adapts:

**Test Prompt**:
```
Create a system that processes customer feedback, analyzes sentiment, categorizes issues, and generates actionable insights for the product team.
```

**Try with**:
- OpenAI Function Calling → Function-based approach
- LangChain Tool → Tool-based approach  
- Agent Prompt → Agent-based approach
- Custom Schema → Flexible structure

## 🔧 Advanced Examples

### Complex Function Example
**Prompt**:
```
Create a comprehensive user authentication system that handles registration, login, password reset, two-factor authentication, session management, and account lockout after failed attempts. Include rate limiting, email verification, and audit logging.
```

### Data Processing Tool
**Prompt**:
```
Build a tool that processes CSV files containing sales data, validates data integrity, performs statistical analysis (mean, median, trends), generates visualizations, and exports results in multiple formats (PDF, Excel, JSON).
```

### AI Agent Workflow
**Prompt**:
```
Design an AI agent that manages project workflows by tracking tasks, assigning priorities, monitoring deadlines, sending notifications, generating progress reports, and automatically adjusting schedules based on team capacity and dependencies.
```

## 🎨 Creative Examples

### Game Development
**Prompt**:
```
Create a function for a role-playing game that generates random encounters based on player level, location type, time of day, and previous actions. Include enemy scaling, loot generation, and experience point calculations.
```

### Content Creation
**Prompt**:
```
Build a tool that helps content creators by analyzing trending topics, suggesting content ideas, optimizing titles for SEO, scheduling posts across platforms, and tracking engagement metrics.
```

### Educational Assistant
**Prompt**:
```
Design an AI tutor agent that adapts to student learning styles, provides personalized explanations, creates practice problems, tracks progress, identifies knowledge gaps, and suggests study strategies.
```

## 🧪 Edge Case Testing

### Minimal Prompt
```
email validator
```
*Test how the AI expands minimal input*

### Very Specific Prompt
```
Create a function named 'validateBusinessEmail' that takes a string parameter called 'emailAddress', checks if it matches the pattern /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, verifies the domain is not in a blacklist array, ensures the local part is not longer than 64 characters, and returns an object with properties 'isValid' (boolean), 'errorCode' (string), and 'suggestion' (string or null).
```
*Test handling of very detailed requirements*

### Multi-Language Context
```
Create a function that processes text in multiple languages (English, Spanish, French, German), detects the language automatically, translates to English if needed, performs sentiment analysis, and returns results with confidence scores.
```
*Test complex, multi-step processing*

## 📊 Testing Checklist

Use these examples to verify:

- [ ] **Basic Conversion**: Simple prompts convert correctly
- [ ] **Schema Adaptation**: Same prompt produces different outputs for different schemas
- [ ] **Optimization**: Vague prompts get helpful improvement suggestions
- [ ] **Complex Logic**: Detailed requirements are captured accurately
- [ ] **Error Handling**: Invalid or empty prompts show appropriate messages
- [ ] **Export Functions**: Generated JSON can be copied and exported
- [ ] **History**: Prompts are saved and can be reused
- [ ] **Provider Switching**: OpenAI and Anthropic produce different but valid outputs

## 🎯 Success Criteria

A successful test should produce:

1. **Valid JSON**: Output parses correctly as JSON
2. **Schema Compliance**: Matches the selected schema format
3. **Completeness**: Includes all necessary fields and properties
4. **Clarity**: Descriptions are clear and actionable
5. **Usability**: Generated code/config can be used in real projects

## 💡 Pro Tips

### Writing Better Prompts
- Be specific about data types and formats
- Include examples when helpful
- Mention error handling requirements
- Specify validation rules
- Describe expected behavior clearly

### Using Optimization
- Start with a basic prompt
- Use the optimize feature to get suggestions
- Apply the suggestions and re-convert
- Compare results to see improvements

### Schema Selection
- Use OpenAI Function for API integrations
- Use LangChain Tool for agent frameworks
- Use Agent Prompt for complex AI behaviors
- Use Custom for unique requirements

---

**Happy Testing!** 🚀 These examples should help you explore all the features of PromptStruct and create amazing AI-powered applications.
