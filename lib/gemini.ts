// Gemini API client using REST API directly with retry logic

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const REQUEST_TIMEOUT = 90000; // 90 seconds

// Helper to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is retryable
function isRetryableError(error: unknown, status?: number): boolean {
  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("fetch failed") ||
      message.includes("enotfound") ||
      message.includes("econnrefused") ||
      message.includes("econnreset") ||
      message.includes("etimedout") ||
      message.includes("network") ||
      message.includes("socket") ||
      message.includes("abort") ||
      error.name === "AbortError"
    ) {
      return true;
    }
  }
  
  // Retry on server errors or rate limiting
  if (status && (status >= 500 || status === 429 || status === 408)) {
    return true;
  }
  
  return false;
}

// Calculate delay with exponential backoff and jitter
function getRetryDelay(attempt: number): number {
  const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
  return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
}

async function makeRequest(apiKey: string, prompt: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Connection": "keep-alive",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Low temperature for deterministic output
          topP: 0.8,
          maxOutputTokens: 8192,
        },
      }),
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Log retry attempts (except first)
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${MAX_RETRIES}...`);
      }

      const response = await makeRequest(apiKey, prompt);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error (attempt ${attempt + 1}):`, errorText);
        
        // Check if we should retry this status code
        if (isRetryableError(null, response.status) && attempt < MAX_RETRIES) {
          const delay = getRetryDelay(attempt);
          console.log(`Retrying in ${Math.round(delay / 1000)}s due to status ${response.status}...`);
          await sleep(delay);
          continue;
        }
        
        // Non-retryable errors - throw immediately
        if (response.status === 400) {
          throw new Error(`Invalid request: ${errorText}`);
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid or expired API key. Please check your GEMINI_API_KEY.");
        } else if (response.status === 404) {
          throw new Error(`Model not found. The model "${GEMINI_MODEL}" may not be available.`);
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status >= 500) {
          throw new Error("Gemini API server error. Please try again later.");
        }
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // Extract text from response
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        // Check for blocked content
        const blockReason = data?.candidates?.[0]?.finishReason;
        if (blockReason === "SAFETY") {
          throw new Error("Response blocked due to safety filters.");
        }
        throw new Error("Empty response from Gemini API");
      }

      return text.trim();
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this error is retryable
      if (isRetryableError(error) && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(attempt);
        console.log(`Network error on attempt ${attempt + 1}, retrying in ${Math.round(delay / 1000)}s...`);
        console.log(`Error: ${lastError.message}`);
        await sleep(delay);
        continue;
      }
      
      // Transform error message for better UX
      if (lastError.name === "AbortError") {
        throw new Error("Request timed out after multiple attempts. Please check your network connection and try again.");
      }
      if (
        lastError.message.includes("fetch failed") || 
        lastError.message.includes("ENOTFOUND") || 
        lastError.message.includes("ECONNREFUSED") ||
        lastError.message.includes("ECONNRESET")
      ) {
        throw new Error(
          "Network error: Unable to connect to Gemini API after multiple attempts. " +
          "Please check your internet connection and try again."
        );
      }
      
      throw lastError;
    }
  }
  
  // This should not be reached, but just in case
  throw lastError || new Error("Unknown error occurred");
}

// Extract JSON from a response that might have markdown code fences
export function extractJSON(text: string): string {
  // Try to extract from ```json ... ``` blocks
  const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON (starts with { or [)
  const rawMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (rawMatch) {
    return rawMatch[1].trim();
  }

  // Return as-is, let the caller handle parsing errors
  return text.trim();
}
