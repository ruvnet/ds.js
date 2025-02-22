# ReAct Agent Example

This example demonstrates how to use DSPy.ts to create a ReAct (Reasoning + Acting) agent that can use tools to solve complex tasks. The agent follows the ReACT pattern:

1. **Reasoning**: Think about how to solve the task
2. **Acting**: Use available tools to gather information
3. **Observing**: Process the results from tools
4. **Repeat** until reaching a final answer

## Features

- ReAct agent implementation using DSPy.ts modules
- Tool usage with Calculator and DateTool
- Multi-step reasoning with tool observations
- Configurable max steps and retry logic

## Tools

The example includes two built-in tools:

1. **Calculator**: Performs arithmetic calculations
   - Usage: `Calculator[expression]`
   - Example: `Calculator[25 * 48]`

2. **DateTool**: Gets current date or performs date calculations
   - Usage: `DateTool[operation]`
   - Operations:
     - `now`: Get current date/time
     - `add X days/months/years`: Add time to current date
   - Example: `DateTool[add 30 days]`

## Example Queries

```typescript
// Basic arithmetic
"What is 25 * 48?"

// Date calculations
"What date will it be in 30 days?"

// Multi-step reasoning
"If I invest $1000 with 5% annual interest for 3 years, how much will I have? Show your work."

// Combining multiple tools
"What will be the date 2 months after I get $1234.56 from a 5% return on investment?"
```

## Setup

1. Set your OpenRouter API key:
   ```bash
   export OPENROUTER_API_KEY=your_api_key_here
   ```

2. (Optional) Set a specific model:
   ```bash
   export OPENROUTER_MODEL=your_preferred_model
   ```
   Default: "anthropic/claude-3-sonnet:beta"

3. Run the example:
   ```bash
   ts-node examples/react/index.ts
   ```

## How It Works

1. The agent uses a ReActModule that extends PredictModule to implement the ReAct pattern
2. For each user query, the agent:
   - Thinks about how to solve the task
   - Decides which tool to use (if any)
   - Executes the tool and observes results
   - Continues reasoning until reaching a final answer
3. The agent can use multiple tools in sequence to solve complex tasks
4. A maximum step limit prevents infinite loops

## Adding New Tools

You can add new tools by extending the `tools` array:

```typescript
const tools: Tool[] = [
  {
    name: "YourTool",
    description: "Description of what the tool does",
    run: (input: string) => {
      // Tool implementation
      return result;
    }
  }
];
```
