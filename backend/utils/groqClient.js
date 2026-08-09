import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_URL =
  'https://api.groq.com/openai/v1/chat/completions';

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get the recommended retry delay from Groq.
 */
function getRetryDelay(response, errorText, attempt) {
  // Prefer Retry-After header
  const retryAfter = response.headers.get('retry-after');

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (!Number.isNaN(seconds)) {
      return Math.ceil(seconds * 1000) + 500;
    }
  }

  // Try to extract "in 2.77s" from Groq error
  const match = errorText.match(
    /(?:in|after)\s+(\d+(?:\.\d+)?)\s*s/i
  );

  if (match) {
    return Math.ceil(Number(match[1]) * 1000) + 500;
  }

  // Fallback exponential backoff
  return Math.min(
    2000 * Math.pow(2, attempt - 1),
    10000
  );
}

/**
 * Calls the Groq API with retry handling.
 */
export async function callGroq({
  systemPrompt,
  userPrompt,
  apiKey,
  model = DEFAULT_MODEL,
  temperature = 0.3,
  maxTokens = 1200
}) {
  const finalApiKey =
    apiKey || process.env.GROQ_API_KEY;

  if (
    !finalApiKey ||
    finalApiKey === 'your_groq_api_key_here'
  ) {
    throw new Error(
      'GROQ_API_KEY is not configured.'
    );
  }

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        [Groq] Attempt ${attempt}/${MAX_RETRIES} using ${model}
      );

      const response = await fetch(
        GROQ_API_URL,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': Bearer ${finalApiKey}
          },

          body: JSON.stringify({
            model,

            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: userPrompt
              }
            ],

            temperature,
            max_tokens: maxTokens
          })
        }
      );

      // ---------------------------------------------
      // 429 RATE LIMIT
      // ---------------------------------------------

      if (response.status === 429) {
        const errorText = await response.text();

        console.warn(
          [Groq] Rate limit reached. Attempt ${attempt}/${MAX_RETRIES}
        );

        const waitMs = getRetryDelay(
          response,
          errorText,
          attempt
        );

        console.warn(
          [Groq] Waiting ${Math.ceil(waitMs / 1000)} seconds...
        );

        if (attempt === MAX_RETRIES) {
          throw new Error(
            'Groq rate limit reached. Please wait a few seconds and try again.'
          );
        }

        await sleep(waitMs);

        continue;
      }

      // ---------------------------------------------
      // OTHER API ERRORS
      // ---------------------------------------------

      if (!response.ok) {
        const errorBody = await response.text();

        let errorMessage =
          Groq API HTTP ${response.status}: ${response.statusText};

        try {
          const parsed = JSON.parse(errorBody);

          if (parsed?.error?.message) {
            errorMessage +=
              ` - ${parsed.error.message}`;
          }
        } catch {
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        }

        throw new Error(errorMessage);
      }

      // ---------------------------------------------
      // SUCCESS
      // ---------------------------------------------

      const data = await response.json();

      const content =
        data?.choices?.[0]?.message?.content || '';

      if (!content) {
        throw new Error(
          'Groq returned an empty response.'
        );
      }

      console.log(
        [Groq] Request successful using ${model}
      );

      return content;

    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw error;
      }

      // Retry only rate-limit related errors
      if (
        !error.message
          ?.toLowerCase()
          .includes('rate limit')
      ) {
        throw error;
      }

      await sleep(
        Math.min(
          2000 * Math.pow(2, attempt - 1),
          10000
        )
      );
    }
  }

  throw new Error(
    'Groq request failed after maximum retries.'
  );
}

/**
 * Remove Markdown code fences from AI output.
 *
 * Example:
 * python
 * print("hello")
 * 
 *
 * becomes:
 *
 * print("hello")
 */
export function cleanMarkdownFences(text) {
  if (!text) {
    return '';
  }

  let cleaned = text.trim();

  // Remove opening code fence
  cleaned = cleaned.replace(
    /^[a-zA-Z0-9_-]*\s*/i,
    ''
  );

  // Remove closing code fence
  cleaned = cleaned.replace(
    /\s*$/,
    ''
  );

  return cleaned.trim();
}

/**
 * Parse JSON returned by Groq.
 */
export function parseGroqJson(text) {
  const cleaned =
    cleanMarkdownFences(text);

  // First try direct JSON parsing
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with extraction
  }

  // Try extracting JSON array
  const arrayMatch =
    cleaned.match(/\[[\s\S]*\]/);

  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // Continue
    }
  }

  // Try extracting JSON object
  const objectMatch =
    cleaned.match(/\{[\s\S]*\}/);

  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // Continue
    }
  }

  console.error(
    '[Groq] Failed to parse JSON response:',
    text
  );

  throw new Error(
    'Groq response could not be parsed as valid JSON.'
  );
}
