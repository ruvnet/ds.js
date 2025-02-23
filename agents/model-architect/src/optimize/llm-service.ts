/**
 * Service for interacting with OpenRouter API
 */
export class LlmService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "anthropic/claude-3-sonnet-20240229") {
    if (!apiKey || apiKey === "your-api-key" || apiKey === "exported") {
      throw new Error(
        "Please provide the actual OpenRouter API key, not the placeholder value. " +
        "The key should start with 'sk-or-v1-' and contain only letters, numbers, and dashes."
      );
    }

    this.validateApiKey(apiKey);
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Validate API key format
   */
  private validateApiKey(key: string): void {
    // OpenRouter API keys should start with sk-or-v1-
    if (!key.startsWith("sk-or-v1-")) {
      throw new Error(
        "Invalid API key format. OpenRouter API keys should start with 'sk-or-v1-'. " +
        "Please provide your actual OpenRouter API key."
      );
    }

    // Should only contain alphanumeric characters and dashes
    if (!/^[a-zA-Z0-9-]+$/.test(key)) {
      throw new Error(
        "Invalid API key format. API keys should only contain letters, numbers, and dashes. " +
        "Please check your OpenRouter API key."
      );
    }
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<string> {
    try {
      const data = await response.json();
      if (data.error?.message) {
        return `${data.error.message} (code: ${data.error.code || "unknown"})`;
      }
      return await response.text();
    } catch {
      return `HTTP ${response.status} - ${response.statusText}`;
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: Error, context: string): Error {
    // Network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return new Error(
        `Network error while ${context}. Please check your internet connection.`
      );
    }

    // Rate limiting
    if (error.message.includes("429")) {
      return new Error(
        `Rate limit exceeded. Please wait a moment before trying again.`
      );
    }

    // Authentication
    if (error.message.includes("401")) {
      return new Error(
        `Authentication failed. Please check your OpenRouter API key.`
      );
    }

    // Model errors
    if (error.message.includes("model")) {
      return new Error(
        `Model error: ${error.message}. Try using a different model.`
      );
    }

    return error;
  }

  /**
   * Call OpenRouter API
   */
  async callLlm(
    prompt: string,
    systemPrompt: string,
    stopSequences: string[] = ["Observation:"]
  ): Promise<string> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/saoudrizwan/ds.js",
          "X-Title": "DS.js Model Architect"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          stop: stopSequences,
          temperature: 0.0
        })
      });

      if (!response.ok) {
        const errorMessage = await this.parseErrorResponse(response);
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }

      const data = await response.json();
      const content: string | undefined = data.choices?.[0]?.message?.content;
      
      if (typeof content !== "string") {
        throw new Error("Invalid response from LLM (no content)");
      }

      return content;
    } catch (error) {
      throw this.handleApiError(error as Error, "calling OpenRouter API");
    }
  }

  /**
   * Call LLM with retry logic
   */
  async callLlmWithRetry(
    prompt: string,
    systemPrompt: string,
    maxRetries = 3,
    stopSequences: string[] = ["Observation:"]
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.callLlm(prompt, systemPrompt, stopSequences);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication or validation errors
        if (
          error instanceof Error && (
            error.message.includes("Authentication failed") ||
            error.message.includes("Invalid API key")
          )
        ) {
          throw error;
        }
        
        console.error(`Attempt ${attempt} failed:`, error);
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Call LLM with JSON validation
   */
  async callLlmForJson<T>(
    prompt: string,
    systemPrompt: string,
    validateJson: (json: unknown) => json is T,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.callLlm(prompt, systemPrompt);
        const json = JSON.parse(response);
        
        if (!validateJson(json)) {
          throw new Error("Invalid JSON structure");
        }
        
        return json;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication or validation errors
        if (
          error instanceof Error && (
            error.message.includes("Authentication failed") ||
            error.message.includes("Invalid API key")
          )
        ) {
          throw error;
        }
        
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to get valid JSON after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Call LLM with streaming
   */
  async *streamLlm(
    prompt: string,
    systemPrompt: string,
    stopSequences: string[] = ["Observation:"]
  ): AsyncGenerator<string> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/saoudrizwan/ds.js",
          "X-Title": "DS.js Model Architect"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          stop: stopSequences,
          temperature: 0.0,
          stream: true
        })
      });

      if (!response.ok) {
        const errorMessage = await this.parseErrorResponse(response);
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw this.handleApiError(error as Error, "streaming from OpenRouter API");
    }
  }
}
