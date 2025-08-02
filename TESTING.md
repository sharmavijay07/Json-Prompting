# PromptStruct Testing Checklist

## Pre-Testing Setup

### Environment Setup
- [ ] Chrome browser (latest version)
- [ ] Developer mode enabled in chrome://extensions/
- [ ] Extension loaded successfully
- [ ] Icons visible in toolbar
- [ ] OpenAI API key available for testing
- [ ] Anthropic API key available for testing (optional)

### Initial Verification
- [ ] Extension popup opens when clicked
- [ ] All UI elements visible and properly styled
- [ ] No console errors on popup open
- [ ] Settings modal opens and closes
- [ ] Theme toggle works (light/dark)

## Core Functionality Tests

### 1. Basic Prompt Conversion

#### OpenAI Function Calling Schema
- [ ] **Test Prompt**: "Create a function that validates email addresses and returns validation status"
- [ ] **Expected**: Valid OpenAI function JSON with name, description, parameters
- [ ] **Verify**: JSON is properly formatted and parseable
- [ ] **Check**: Required fields are marked correctly

#### LangChain Tool Schema
- [ ] **Test Prompt**: "Create a tool that searches Wikipedia for information about a topic"
- [ ] **Expected**: LangChain-compatible tool definition
- [ ] **Verify**: Includes input_schema, return_schema, examples
- [ ] **Check**: Tool name is PascalCase

#### Agent Prompt Schema
- [ ] **Test Prompt**: "Create an agent that analyzes customer feedback and provides insights"
- [ ] **Expected**: Structured agent prompt with role, task, instructions
- [ ] **Verify**: Includes constraints and success criteria
- [ ] **Check**: Instructions are actionable

#### Anthropic Tool Schema
- [ ] **Test Prompt**: "Create a tool that summarizes text and extracts key points"
- [ ] **Expected**: Anthropic-compatible tool definition
- [ ] **Verify**: Follows Anthropic's tool specification
- [ ] **Check**: Tool name is snake_case

#### Custom Schema
- [ ] **Test Prompt**: "Create a configuration for a recommendation system"
- [ ] **Expected**: Flexible JSON structure appropriate for the use case
- [ ] **Verify**: Structure makes sense for the described system
- [ ] **Check**: Includes relevant properties and metadata

### 2. AI Provider Testing

#### OpenAI Integration
- [ ] GPT-4 model works correctly
- [ ] GPT-3.5 Turbo model works correctly
- [ ] API errors are handled gracefully
- [ ] Usage statistics are returned
- [ ] Rate limiting is handled

#### Anthropic Integration
- [ ] Claude 3 Sonnet works correctly
- [ ] Claude 3 Haiku works correctly
- [ ] API errors are handled gracefully
- [ ] Different response format is parsed correctly
- [ ] Model switching updates options correctly

### 3. Prompt Optimization

#### Basic Optimization
- [ ] **Test Prompt**: "make a function"
- [ ] **Expected**: Suggestions for clarity and specificity
- [ ] **Verify**: Structured JSON response with improvements
- [ ] **Check**: Optimized prompt is provided

#### Advanced Optimization
- [ ] **Test Prompt**: "Create a function that takes user input and does something with it"
- [ ] **Expected**: Detailed suggestions for parameters, validation, error handling
- [ ] **Verify**: Category-based improvements (clarity, specificity, etc.)
- [ ] **Check**: Examples provided where applicable

#### Schema-Specific Optimization
- [ ] Test optimization with different schema types
- [ ] Verify suggestions are relevant to selected schema
- [ ] Check that optimized prompts work better for conversion
- [ ] Confirm "Use This Prompt" button works

## User Interface Tests

### 4. Settings Management

#### API Configuration
- [ ] API key input accepts and saves keys
- [ ] Provider switching updates model options
- [ ] Model selection persists after restart
- [ ] Temperature slider works and saves value
- [ ] Settings validation prevents invalid inputs

#### Preferences
- [ ] Theme toggle persists across sessions
- [ ] Save history checkbox works
- [ ] Schema preference is remembered
- [ ] Settings modal closes properly
- [ ] Invalid settings show appropriate errors

### 5. Copy and Export Features

#### Copy Functionality
- [ ] Copy button works with valid JSON
- [ ] Copy button shows error with no JSON
- [ ] Clipboard contains exact JSON text
- [ ] Success notification appears
- [ ] Works with different JSON structures

#### Export Options
- [ ] Export modal opens correctly
- [ ] JSON export creates valid .json file
- [ ] JavaScript export creates valid .js file
- [ ] Python export creates valid .py file
- [ ] Text export includes metadata
- [ ] File names include timestamps

### 6. History Management

#### History Storage
- [ ] Prompts are saved to history when enabled
- [ ] History modal opens and displays items
- [ ] History items show correct metadata (schema, date)
- [ ] History is limited to 50 items
- [ ] Old items are removed when limit exceeded

#### History Interaction
- [ ] "View JSON" toggles JSON display
- [ ] "Use Prompt" loads prompt and schema
- [ ] Clear history works with confirmation
- [ ] History can be disabled in settings
- [ ] Empty history shows appropriate message

## Error Handling Tests

### 7. API Error Scenarios

#### Invalid API Keys
- [ ] Empty API key shows appropriate error
- [ ] Invalid API key format shows error
- [ ] Expired API key handled gracefully
- [ ] Network errors are caught and displayed

#### Rate Limiting
- [ ] Rate limit errors show helpful message
- [ ] Retry suggestions are provided
- [ ] Extension remains functional after errors
- [ ] Error messages are user-friendly

### 8. Input Validation

#### Prompt Input
- [ ] Empty prompts show validation error
- [ ] Very long prompts are handled correctly
- [ ] Special characters in prompts work
- [ ] Unicode characters are supported

#### Settings Validation
- [ ] Invalid temperature values are rejected
- [ ] Empty model selection is prevented
- [ ] Malformed API keys show warnings
- [ ] Settings reset to defaults when corrupted

## Performance Tests

### 9. Response Times

#### Conversion Speed
- [ ] Simple prompts convert in < 10 seconds
- [ ] Complex prompts complete within reasonable time
- [ ] Loading indicators show during processing
- [ ] Multiple rapid requests are handled correctly

#### UI Responsiveness
- [ ] Popup opens quickly (< 1 second)
- [ ] Theme switching is immediate
- [ ] Modal animations are smooth
- [ ] No UI freezing during API calls

### 10. Memory and Storage

#### Storage Management
- [ ] Settings persist across browser restarts
- [ ] History storage doesn't exceed limits
- [ ] Corrupted storage is handled gracefully
- [ ] Storage cleanup works correctly

#### Memory Usage
- [ ] Extension doesn't leak memory
- [ ] Multiple conversions don't slow down browser
- [ ] Background script remains responsive
- [ ] Popup can be opened/closed repeatedly

## Edge Cases and Stress Tests

### 11. Unusual Inputs

#### Prompt Variations
- [ ] Single word prompts
- [ ] Extremely long prompts (>5000 characters)
- [ ] Prompts with only special characters
- [ ] Prompts in different languages
- [ ] Code snippets as prompts

#### Schema Edge Cases
- [ ] Switching schemas mid-conversion
- [ ] Invalid schema selections
- [ ] Custom schema with complex requirements
- [ ] Schema-prompt mismatches

### 12. Browser Compatibility

#### Chrome Versions
- [ ] Latest Chrome stable
- [ ] Chrome beta (if available)
- [ ] Chromium-based browsers (Edge, Brave)
- [ ] Different operating systems

#### Extension Lifecycle
- [ ] Extension updates work correctly
- [ ] Disable/enable extension maintains state
- [ ] Browser restart preserves settings
- [ ] Multiple Chrome profiles work independently

## Final Verification

### 13. End-to-End Workflows

#### Complete User Journey
- [ ] Install extension → Configure API → Convert prompt → Copy result
- [ ] Use optimization → Apply suggestions → Re-convert → Export
- [ ] Browse history → Reuse old prompt → Modify → Save new version
- [ ] Switch providers → Compare results → Choose best output

#### Real-World Scenarios
- [ ] Developer creating OpenAI functions
- [ ] Data scientist building LangChain tools
- [ ] Product manager defining agent behaviors
- [ ] Student learning prompt engineering

### 14. Documentation Verification

#### User Guides
- [ ] Installation instructions work correctly
- [ ] All features mentioned in README are functional
- [ ] Examples in documentation produce expected results
- [ ] Troubleshooting guide addresses common issues

---

## Test Results Template

```
Test Date: ___________
Tester: ___________
Chrome Version: ___________
Extension Version: ___________

Core Functionality: ✅ / ❌
API Integration: ✅ / ❌
UI/UX: ✅ / ❌
Error Handling: ✅ / ❌
Performance: ✅ / ❌

Critical Issues Found: ___________
Minor Issues Found: ___________
Suggestions: ___________

Overall Status: PASS / FAIL / NEEDS WORK
```

**Testing Complete!** 🎉 Ready for production deployment.
