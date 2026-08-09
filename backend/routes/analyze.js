import { Router } from 'express';
import {
  callGroq,
  cleanMarkdownFences,
  parseGroqJson
} from '../utils/groqClient.js';

const router = Router();

const REVIEW_SYSTEM_PROMPT = `
You are a senior software engineer performing a thorough code review.

Analyze the provided code and identify:
- Bugs
- Security vulnerabilities
- Performance issues
- Bad practices
- Maintainability problems
- Style inconsistencies

For each issue, return an object with:
- line: approximate line number if identifiable, otherwise null
- severity: one of "critical", "warning", "suggestion", "info"
- issue: short title, maximum 10 words
- explanation: clear and specific explanation with a practical fix, maximum 40 words

Return ONLY valid JSON.
Do not use markdown fences.
Do not include any explanation outside the JSON array.

If there are no issues, return:
[]
`;

const DOCS_SYSTEM_PROMPT = `
You are a professional software documentation expert.

Take the provided code and return the same code with useful documentation added.

Add:
- Docstrings to functions and methods
- Documentation to classes
- Comments for non-obvious logic
- Parameter and return-value documentation where appropriate

Use the appropriate documentation style for the language:
- JavaScript: JSDoc
- Python: Python docstrings
- Java: Javadoc
- C#: XML documentation comments
- Other languages: use the conventional documentation style

IMPORTANT:
Do not intentionally change program logic or functionality.
Only add documentation.

Return ONLY the documented source code.
Do not use markdown code fences.
Do not add explanations before or after the code.
`;

const README_SYSTEM_PROMPT = `
You are a professional technical writer.

Given the provided source code, generate a concise README.md section containing:

1. What the module/code does in 2-3 sentences
2. Main functions/classes in bullet points
3. A basic usage example if it can be inferred
4. Dependencies detected from imports

Return ONLY clean Markdown.
Do not include meta-commentary.
`;

const MAX_CODE_LENGTH = 30000;

router.post('/', async (req, res) => {
  try {
    const {
      code,
      language = 'auto',
      source = 'paste',
      apiKey: bodyApiKey,
      model
    } = req.body;

    const apiKey = req.headers['x-groq-api-key'] || bodyApiKey;

    // -------------------------------------------------------
    // Validate code
    // -------------------------------------------------------

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        error: 'Code input is required.'
      });
    }

    // Prevent extremely large requests from consuming the TPM limit.
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(413).json({
        error: `Code is too large. Please provide a file smaller than ${MAX_CODE_LENGTH.toLocaleString()} characters.`
      });
    }

    const languageContext =
      language && language !== 'auto'
        ? `Language: ${language}`
        : 'Language: automatically detect';

    let review = [];
    let documentedCode = '';
    let readme = '';

    const errors = {};

    // =======================================================
    // 1. CODE REVIEW
    // =======================================================

    try {
      console.log('[CodeScribe] Starting code review...');

      const reviewResult = await callGroq({
        systemPrompt: REVIEW_SYSTEM_PROMPT,
        userPrompt: `
${languageContext}

Review the following source code:

${code}
        `,
        apiKey,
        model,
        temperature: 0.2,
        maxTokens: 1200
      });

      try {
        review = parseGroqJson(reviewResult);

        if (!Array.isArray(review)) {
          review = [];
        }
      } catch (parseErr) {
        console.error(
          '[CodeScribe] Review JSON parsing error:',
          parseErr.message
        );

        errors.review =
          'The AI returned an invalid code review format.';
      }
    } catch (err) {
      console.error(
        '[CodeScribe] Review API error:',
        err.message
      );

      errors.review = err.message;
    }

    // =======================================================
    // 2. DOCUMENTATION
    // =======================================================

    try {
      console.log('[CodeScribe] Starting documentation generation...');

      const docsResult = await callGroq({
        systemPrompt: DOCS_SYSTEM_PROMPT,
        userPrompt: `
${languageContext}

Document the following source code:

${code}
        `,
        apiKey,
        model,
        temperature: 0.2,
        maxTokens: 2000
      });

      documentedCode = cleanMarkdownFences(docsResult);
    } catch (err) {
      console.error(
        '[CodeScribe] Documentation API error:',
        err.message
      );

      errors.documentedCode = err.message;
    }

    // =======================================================
    // 3. README GENERATION
    // =======================================================

    try {
      console.log('[CodeScribe] Starting README generation...');

      const readmeResult = await callGroq({
        systemPrompt: README_SYSTEM_PROMPT,
        userPrompt: `
${languageContext}

Generate README documentation for the following source code:

${code}
        `,
        apiKey,
        model,
        temperature: 0.2,
        maxTokens: 1200
      });

      readme = cleanMarkdownFences(readmeResult);
    } catch (err) {
      console.error(
        '[CodeScribe] README API error:',
        err.message
      );

      errors.readme = err.message;
    }

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.json({
      review,
      documentedCode: documentedCode || code,
      readme,
      source,
      language,
      errors:
        Object.keys(errors).length > 0
          ? errors
          : undefined
    });

  } catch (error) {
    console.error(
      '[CodeScribe] Error in /api/analyze:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Internal Server Error during code analysis.'
    });
  }
});

export default router;
