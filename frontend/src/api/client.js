const API_BASE = '/api';

/**
 * Analyzes code using Groq API via backend endpoint.
 * @param {Object} payload
 * @param {string} payload.code
 * @param {string} [payload.language]
 * @param {string} [payload.source]
 */
export async function analyzeCode({ code, language = 'auto', source = 'paste', apiKey, model }) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey && apiKey.trim()) {
    headers['x-groq-api-key'] = apiKey.trim();
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, language, source, apiKey, model }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server responded with status ${response.status}`);
  }

  return data;
}

/**
 * Fetches raw code file from GitHub URL.
 * @param {string} url 
 */
export async function fetchGithubFile(url) {
  const response = await fetch(`${API_BASE}/github-file?url=${encodeURIComponent(url)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch file from GitHub (${response.status})`);
  }

  return data;
}
