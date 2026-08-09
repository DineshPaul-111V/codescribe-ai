import { Router } from 'express';

const router = Router();

const EXTENSION_LANGUAGE_MAP = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  php: 'php',
  rb: 'ruby',
  html: 'html',
  css: 'css',
  json: 'json',
  sh: 'bash',
  sql: 'sql'
};

function guessLanguage(filename) {
  if (!filename) return 'javascript';
  const ext = filename.split('.').pop()?.toLowerCase();
  return EXTENSION_LANGUAGE_MAP[ext] || 'javascript';
}

router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'GitHub URL parameter is required.' });
    }

    const cleanUrl = url.trim();

    // Case 1: Direct file URL from raw.githubusercontent.com
    if (cleanUrl.includes('raw.githubusercontent.com')) {
      const resp = await fetch(cleanUrl);
      if (!resp.ok) {
        return res.status(resp.status).json({ error: `Failed to fetch raw file: ${resp.statusText}` });
      }
      const content = await resp.text();
      const filename = cleanUrl.split('/').pop() || 'file';
      return res.json({
        filename,
        content,
        language: guessLanguage(filename)
      });
    }

    // Case 2: GitHub web blob URL e.g. https://github.com/owner/repo/blob/main/path/to/file.ext
    const blobMatch = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
    if (blobMatch) {
      const [, owner, repo, branch, path] = blobMatch;
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      const resp = await fetch(rawUrl);
      if (!resp.ok) {
        return res.status(resp.status).json({ error: `Could not fetch file content from ${rawUrl}: ${resp.statusText}` });
      }
      const content = await resp.text();
      const filename = path.split('/').pop() || 'file';
      return res.json({
        filename,
        content,
        language: guessLanguage(filename)
      });
    }

    // Case 3: GitHub repository URL e.g. https://github.com/owner/repo
    const repoMatch = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format. Please provide a valid GitHub repository or file URL.' });
    }

    const owner = repoMatch[1];
    const repo = repoMatch[2].replace(/\.git$/, '');

    // Fetch repository root directory contents via GitHub REST API
    const apiHeaders = {
      'User-Agent': 'CodeScribe-App',
      'Accept': 'application/vnd.github.v3+json'
    };

    const contentsResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers: apiHeaders });

    if (!contentsResp.ok) {
      if (contentsResp.status === 404) {
        return res.status(404).json({ error: `GitHub repository '${owner}/${repo}' was not found or is private.` });
      }
      if (contentsResp.status === 403) {
        return res.status(403).json({ error: 'GitHub API rate limit exceeded. Please try pasting the code directly or use a direct raw file URL.' });
      }
      return res.status(contentsResp.status).json({ error: `GitHub API error: ${contentsResp.statusText}` });
    }

    const files = await contentsResp.json();
    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'Unexpected GitHub API response structure.' });
    }

    // Filter for code files
    const codeFiles = files.filter(f => {
      if (f.type !== 'file') return false;
      const name = f.name.toLowerCase();
      // Skip non-code / config / doc files
      if (name.startsWith('.') || name.includes('readme') || name.includes('license') || name === 'package.json' || name === 'package-lock.json') {
        return false;
      }
      const ext = name.split('.').pop();
      return Boolean(EXTENSION_LANGUAGE_MAP[ext]);
    });

    if (codeFiles.length === 0) {
      // If no top-level code files, check if there's a src/ directory
      const srcDir = files.find(f => f.type === 'dir' && (f.name === 'src' || f.name === 'lib' || f.name === 'app'));
      if (srcDir) {
        const srcResp = await fetch(srcDir.url, { headers: apiHeaders });
        if (srcResp.ok) {
          const srcFiles = await srcResp.json();
          if (Array.isArray(srcFiles)) {
            const nestedCodeFiles = srcFiles.filter(f => f.type === 'file' && EXTENSION_LANGUAGE_MAP[f.name.split('.').pop()?.toLowerCase()]);
            codeFiles.push(...nestedCodeFiles);
          }
        }
      }
    }

    if (codeFiles.length === 0) {
      return res.status(404).json({ error: 'No recognizable code files found in the root or src directory of this repository.' });
    }

    // Priority ordering for main entry files
    const priorityNames = ['main.py', 'index.js', 'app.py', 'index.ts', 'server.js', 'main.go', 'main.rs', 'app.jsx', 'app.tsx'];
    let selectedFile = codeFiles.find(f => priorityNames.includes(f.name.toLowerCase())) || codeFiles[0];

    // Download content for selected file
    const downloadUrl = selectedFile.download_url;
    if (!downloadUrl) {
      return res.status(500).json({ error: `Could not retrieve download URL for ${selectedFile.name}` });
    }

    const fileResp = await fetch(downloadUrl);
    if (!fileResp.ok) {
      return res.status(fileResp.status).json({ error: `Failed to fetch content for ${selectedFile.name}` });
    }

    const content = await fileResp.text();

    return res.json({
      filename: selectedFile.name,
      content,
      language: guessLanguage(selectedFile.name)
    });

  } catch (error) {
    console.error('Error fetching GitHub file:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error while fetching GitHub file.' });
  }
});

export default router;
