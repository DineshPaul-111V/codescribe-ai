# CodeScribe — AI Code Review & Documentation Generator

> **An AI-powered developer tool that analyzes source code, identifies potential issues, generates documentation, and creates README summaries.**

[🚀 Live Demo](https://codescribe-ai-692z.vercel.app/) · [📂 GitHub Repository](https://github.com/DineshPaul-111V/codescribe-ai)

CodeScribe helps developers reduce the time spent on repetitive code review and documentation tasks.

It accepts source code through **direct paste, file upload, or a public GitHub URL**, analyzes the code using an LLM, and generates three useful developer outputs:

- 🔍 **AI Code Review**
- 📝 **Documented Code with Docstrings**
- 📚 **README Documentation**


---

## 🎯 Problem

Small development teams often have limited time for code reviews and documentation.

As a result, projects can accumulate:

* Undetected bugs
* Security vulnerabilities
* Performance issues
* Poor coding practices
* Missing documentation
* Difficult-to-understand functions and modules

CodeScribe aims to automate the first layer of code analysis and documentation so developers can focus more on building and improving their applications.

---

## 💡 Solution

CodeScribe creates an automated workflow:

```text
Paste Code / Upload File / GitHub URL
              ↓
        Code Analysis
              ↓
        LLM Processing
              ↓
   ┌──────────┼──────────┐
   ↓          ↓          ↓
Code Review  Docstrings  README
```

The application analyzes the submitted source code and generates structured developer-friendly results.

---

## ✨ Key Features

### 🔍 1. AI Code Review

Analyzes source code and identifies potential:

* 🐞 Bugs
* 🔐 Security vulnerabilities
* ⚡ Performance issues
* 🎨 Code quality problems
* 📐 Style and maintainability issues

Review results include severity levels and relevant line numbers when available.

---

### 📝 2. Automatic Documentation

CodeScribe generates documented versions of the submitted code with:

* Function docstrings
* Inline comments
* Parameter descriptions
* Return value descriptions
* Purpose and behavior explanations

The goal is to improve code readability without changing the original program logic.

---

### 📚 3. README Generator

Automatically generates documentation describing:

* Project/module purpose
* Main functions
* Dependencies
* Usage
* Example code
* Important implementation details

The generated README content can be previewed and downloaded as a Markdown file.

---

### 🐙 4. GitHub Code Input

Users can provide a public GitHub file URL.

CodeScribe retrieves the source file through the GitHub API and sends it for analysis.

---

### 📂 5. Multiple Input Methods

Code can be submitted through:

* Paste Code
* File Upload
* Public GitHub URL
* Built-in code examples/presets

---

## 🧠 AI Processing

CodeScribe uses an LLM through the Groq API to perform the code analysis and documentation generation.

### Development Model

The project was initially developed using:

```text
llama-3.3-70b-versatile
```

Groq currently recommends newer models such as `openai/gpt-oss-120b` and `qwen/qwen3.6-27b` as replacements for `llama-3.3-70b-versatile`. The model used by the application can therefore be updated through the backend configuration without changing the overall application architecture.

---

## 🏗️ Project Architecture

```text
codescribe/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── analyze.js
│   │   └── github.js
│   ├── utils/
│   │   └── groqClient.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── CodeInput.jsx
│   │   │   ├── ReviewTab.jsx
│   │   │   ├── DocumentedCodeTab.jsx
│   │   │   └── ReadmeTab.jsx
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer               | Technology               |
| ------------------- | ------------------------ |
| AI / LLM            | Groq API                 |
| Backend             | Node.js + Express        |
| Frontend            | React + Vite             |
| Styling             | Tailwind CSS             |
| GitHub Integration  | GitHub API               |
| Syntax Highlighting | react-syntax-highlighter |
| Markdown Rendering  | react-markdown           |
| API Communication   | REST API                 |

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm
* Groq API key
* Internet connection for Groq API and GitHub URL analysis

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/codescribe-ai.git

cd codescribe-ai
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🧪 Demo

### Example Workflow

1. Open CodeScribe.
2. Select a code input method.
3. Paste code, upload a source file, or provide a public GitHub URL.
4. Click **Analyze Code**.
5. Wait for the AI analysis.
6. Explore the generated results.

### Generated Results

#### Code Review

Displays identified issues with:

* Severity
* Category
* Explanation
* Suggested improvement
* Relevant line number

#### Documented Code

Displays the original code with automatically generated documentation.

#### README

Displays a Markdown preview that can be downloaded as:

```text
README.md
```

---

## 🔐 Security

API keys are stored on the backend using environment variables and are not exposed directly to the frontend.

Do not commit your `.env` file.

The repository should contain only:

```text
.env.example
```

and never:

```text
.env
```

---

## ⚠️ Limitations

CodeScribe uses AI-generated analysis, so results should be treated as **developer assistance rather than a replacement for professional code review, security testing, or static analysis tools**.

AI-generated suggestions may occasionally be incorrect or incomplete.

Always validate important recommendations before applying them to production systems.

---

## 🔮 Future Improvements

Planned improvements include:

* [ ] Full GitHub repository analysis
* [ ] Pull Request code review
* [ ] GitHub Actions integration
* [ ] Automatic PR review comments
* [ ] Support for additional programming languages
* [ ] Static analysis integration
* [ ] Code quality scoring
* [ ] Security vulnerability scanning
* [ ] Authentication and user accounts
* [ ] Analysis history
* [ ] Export reports as PDF
* [ ] Configurable review rules
* [ ] Support for multiple LLM providers

---

## 🎯 Challenge Alignment

**Challenge:** Auto Code Review & Documentation Generator

**Core Loop:**

```text
Code / GitHub Repository
          ↓
      AI Analysis
          ↓
 ┌────────┼─────────┐
 ↓        ↓         ↓
Review  Docstrings  README
```

CodeScribe addresses the challenge by combining automated code analysis and documentation generation into a single developer workflow.

---

## 📌 Project Status

**Status:** Active Development

CodeScribe was built as an AI developer productivity tool demonstrating how LLMs can automate repetitive software engineering tasks.
