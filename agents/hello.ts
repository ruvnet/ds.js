/// <reference lib="deno.ns" />

/**
 * Single File ReAct Agent Template (Deno)
 * 
 * This agent follows the ReACT (Reasoning + Acting) logic pattern, integrates with the OpenRouter API for LLM interactions,
 * and supports tool usage within a structured agent framework. It is designed as a single-file TypeScript script for Deno.
 * 
 * ## Setup
 * - Ensure you have a Deno runtime available
 * - Set the environment variable `OPENROUTER_API_KEY` with your OpenRouter API key.
 * - (Optional) Set `OPENROUTER_MODEL` to specify the model (default is "openai/o3-mini-high").
 * - This script requires network access to call the OpenRouter API. When running with Deno, use `--allow-net` (and `--allow-env` to read env variables).
 * 
 * ## Usage
 * Run the script with your query as command line arguments:
 * ```
 * deno run --allow-net --allow-env hello.ts "what is 2 + 2?"
 * ```
 */

const API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL   = Deno.env.get("OPENROUTER_MODEL") || "openai/o3-mini-high";
// Ensure API key is provided
if (!API_KEY) {
  console.error("Error: OPENROUTER_API_KEY is not set in environment.");
  Deno.exit(1);
}

// Define the structure for a chat message and tool
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
interface Tool {
  name: string;
  description: string;
  run: (input: string) => Promise<string> | string;
}

// Define available tools
const tools: Tool[] = [
  {
    name: "Calculator",
    description: "Performs arithmetic calculations. Usage: Calculator[expression]",
    run: (input: string) => {
      // Simple safe evaluation for arithmetic expressions
      try {
        // Allow only numbers and basic math symbols in input for safety
        if (!/^[0-9.+\-*\/()\s]+$/.test(input)) {
          return "Invalid expression";
        }
        // Evaluate the expression
        const result = Function("return (" + input + ")")();
        return String(result);
      } catch (err) {
        return "Error: " + (err as Error).message;
      }
    }
  },
  // Additional tools can be added here
  // {
  //   name: "YourTool",
  //   description: "Description of what the tool does.",
  //   run: async (input: string) => { ... }
  // }
];

// Create a system prompt that instructs the model on how to use tools and follow ReACT format
const toolDescriptions = tools.map(t => `${t.name}: ${t.description}`).join("\n");
const systemPrompt = 
`You are a smart assistant with access to the following tools:
${toolDescriptions}

When answering the user, you may use the tools to gather information or calculate results.
Follow this format strictly:
Thought: <your reasoning here>
Action: <ToolName>[<tool input>]
Observation: <result of the tool action>
... (you can repeat Thought/Action/Observation as needed) ...
Thought: <final reasoning>
Answer: <your final answer to the user's query>

Only provide one action at a time, and wait for the observation before continuing. 
If the answer is directly known or once you have gathered enough information, output the final Answer.
`;

async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      stop: ["Observation:"],  // Stop generation before the model writes an observation
      temperature: 0.0
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: HTTP ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response from LLM (no content)");
  }
  return content;
}

/**
 * Runs the ReACT agent loop for a given user query.
 * @param query - The user's question or command for the agent.
 * @returns The final answer from the agent.
 */
async function runAgent(query: string): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query }
  ];

  // The agent will iterate, allowing up to 10 reasoning loops (to avoid infinite loops).
  for (let step = 0; step < 10; step++) {
    // Call the LLM via OpenRouter
    const assistantReply = await callOpenRouter(messages);
    // Print the assistant's thought process
    console.log(assistantReply.split("Answer:")[0].trim());
    // Append the assistant's reply to the message history
    messages.push({ role: "assistant", content: assistantReply });
    // Check if the assistant's reply contains a final answer
    const answerMatch = assistantReply.match(/Answer:\s*(.*)$/);
    if (answerMatch) {
      // Return the text after "Answer:" as the final answer
      return answerMatch[1].trim();
    }
    // Otherwise, look for an action to perform
    const actionMatch = assistantReply.match(/Action:\s*([^\[]+)\[([^\]]+)\]/);
    if (actionMatch) {
      const toolName = actionMatch[1].trim();
      const toolInput = actionMatch[2].trim();
      // Find the tool by name (case-insensitive match)
      const tool = tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
      let observation: string;
      if (!tool) {
        observation = `Tool "${toolName}" not found`;
      } else {
        try {
          const result = await tool.run(toolInput);
          observation = String(result);
        } catch (err) {
          observation = `Error: ${(err as Error).message}`;
        }
      }
      // Print the observation
      console.log("Observation:", observation);
      // Append the observation as a system message for the next LLM call
      messages.push({ role: "system", content: `Observation: ${observation}` });
      // Continue loop for next reasoning step with the new observation in context
      continue;
    }
    // If no Action or Answer was found in the assistant's reply, break to avoid an endless loop.
    // (This could happen if the model didn't follow the format. In such case, treat the whole reply as answer.)
    return assistantReply.trim();
  }
  throw new Error("Agent did not produce a final answer within the step limit.");
}

// Get the query from command line arguments
const query = Deno.args.join(" ");
if (!query) {
  console.error("Error: Please provide a query as command line argument.");
  console.error("Example: deno run --allow-net --allow-env hello.ts \"what is 2 + 2?\"");
  Deno.exit(1);
}

// Run the agent with the query
runAgent(query)
  .then(answer => {
    console.log("\nAnswer:", answer);
  })
  .catch(err => {
    console.error("Error:", err.message);
    Deno.exit(1);
  });
