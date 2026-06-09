const express = require('express');
const https   = require('https');
const multer  = require('multer');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');
const User    = require('../models/User');
const JobRole = require('../models/JobRole');

/* ── multer: keep file in memory ── */
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/* ── call Anthropic API using built-in https ── */
function callClaude(prompt, maxTokens = 1500) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return reject(new Error('ANTHROPIC_API_KEY is not set in Server/.env'));
    }

    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'Anthropic API error'));
          const text = parsed.content?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Anthropic response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ── extract readable text from buffer ── */
function bufferToText(buffer) {
  // Strip binary/non-printable bytes, keep ASCII readable content
  return buffer
    .toString('utf-8', 0, Math.min(buffer.length, 40000))
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s{3,}/g, '  ')
    .trim();
}

/* ═══════════════════════════════════════════════════════════════
   STANDARD ROUTES
═══════════════════════════════════════════════════════════════ */

// GET /api/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/skills
router.put('/skills', protect, async (req, res) => {
  try {
    const { skills } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { skills }, { new: true }).select('-password');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/jobs
router.get('/jobs', protect, async (req, res) => {
  try {
    const jobs = await JobRole.find();
    res.json(jobs);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/analyze
router.post('/analyze', protect, async (req, res) => {
  try {
    const { jobRoleId } = req.body;
    const user    = await User.findById(req.user._id);
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole) return res.status(404).json({ message: 'Job role not found' });

    const userSkills    = user.skills.map(s => s.toLowerCase().trim());
    const required      = jobRole.requiredSkills;
    const matched       = required.filter(s => userSkills.includes(s.toLowerCase().trim()));
    const missing       = required.filter(s => !userSkills.includes(s.toLowerCase().trim()));
    const matchPct      = required.length ? Math.round((matched.length / required.length) * 100) : 0;

    const resourceMap = {
      React:'https://react.dev/learn', JavaScript:'https://javascript.info',
      TypeScript:'https://www.typescriptlang.org/docs/', 'Node.js':'https://nodejs.org/en/learn',
      MongoDB:'https://learn.mongodb.com', Python:'https://docs.python.org/3/tutorial/',
      Docker:'https://docs.docker.com/get-started/', AWS:'https://aws.amazon.com/training/',
      Git:'https://git-scm.com/book/en/v2', SQL:'https://www.w3schools.com/sql/',
    };
    const recommendations = missing.map(skill => ({
      skill, resource: resourceMap[skill] || `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}`,
    }));

    res.json({ jobRole: jobRole.role, userSkills: user.skills, requiredSkills: required, matchedSkills: matched, missingSkills: missing, matchPercentage: matchPct, recommendations });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════
   AI ROUTES
═══════════════════════════════════════════════════════════════ */

// POST /api/ai/interview-questions
router.post('/ai/interview-questions', protect, async (req, res) => {
  try {
    const { role, level } = req.body;
    if (!role || !level) return res.status(400).json({ message: 'role and level are required' });

    const prompt = `Generate exactly 5 technical interview questions for a ${level}-level ${role} position.
Make them practical and progressively challenging. Mix conceptual and scenario-based questions.
Return ONLY a valid JSON array of 5 question strings. No markdown, no explanation.
Example: ["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?"]`;

    const text = await callClaude(prompt, 600);
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: 'Invalid AI response format' });
    }
    res.json({ questions: questions.slice(0, 5) });
  } catch (err) {
    console.error('Interview questions error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/interview-feedback
router.post('/ai/interview-feedback', protect, async (req, res) => {
  try {
    const { role, level, question, answer } = req.body;
    if (!role || !question || !answer) return res.status(400).json({ message: 'Missing fields' });

    const prompt = `You are a senior ${role} interviewer conducting a ${level}-level technical interview.

Question: "${question}"
Candidate's answer: "${answer}"

Give concise, constructive feedback in 3-4 sentences. Cover: what was correct, what was missing, and key points a strong answer would include. Be encouraging and specific. Write in plain paragraph form — no bullet points.`;

    const feedback = await callClaude(prompt, 500);
    res.json({ feedback });
  } catch (err) {
    console.error('Interview feedback error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/aptitude-questions
router.post('/ai/aptitude-questions', protect, async (req, res) => {
  try {
    const { count = 15 } = req.body;

    const prompt = `Generate ${count} unique multiple-choice technical questions for software engineering candidates.

Distribute topics evenly across: Data Structures & Algorithms, Web Development, JavaScript, Database concepts, Git, System Design basics, and Logical Reasoning/Math.

Rules:
- Each question must be genuinely different from common textbook questions
- Vary difficulty: easy, medium, hard
- Make all 4 options plausible (no obviously wrong options)
- Never repeat the same question

Return ONLY a valid JSON array. Each item must have exactly:
- "q": question string
- "options": array of exactly 4 strings
- "ans": number 0-3 (index of correct answer)  
- "cat": short category label (e.g. "DSA", "JavaScript", "Web", "Database", "Git", "Logic")

No markdown fences, no explanation, no preamble. Raw JSON array only.`;

    const text = await callClaude(prompt, 3500);
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    if (!Array.isArray(questions)) return res.status(500).json({ message: 'AI returned invalid format' });

    const valid = questions
      .filter(q => q.q && Array.isArray(q.options) && q.options.length === 4 && typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3 && q.cat)
      .slice(0, count);

    if (valid.length === 0) return res.status(500).json({ message: 'No valid questions generated' });

    res.json({ questions: valid });
  } catch (err) {
    console.error('Aptitude questions error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/parse-resume
router.post('/ai/parse-resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const rawText = bufferToText(req.file.buffer);

    if (!rawText || rawText.length < 30) {
      return res.status(400).json({ message: 'Could not read file content. Please use a .txt resume for best results.' });
    }

    const prompt = `You are an expert resume parser. Analyze the resume text below and extract skills.

Resume content:
---
${rawText.substring(0, 8000)}
---

Instructions:
1. Extract ONLY technical skills, tools, languages, and frameworks that are explicitly mentioned
2. Do NOT add skills that are not in the text
3. Normalize skill names (e.g., "reactjs" -> "React", "node" -> "Node.js")
4. Include: programming languages, frameworks, libraries, databases, cloud platforms, tools, methodologies

Return ONLY this JSON object (no markdown, no explanation):
{
  "skills": ["skill1", "skill2"],
  "experienceYears": <number or null>,
  "summary": "<one sentence about the candidate>"
}`;

    const text = await callClaude(prompt, 1000);
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      return res.status(500).json({ message: 'AI could not parse resume structure' });
    }

    res.json({
      fileName: req.file.originalname,
      skills: parsed.skills,
      experienceYears: parsed.experienceYears || null,
      summary: parsed.summary || '',
    });
  } catch (err) {
    console.error('Resume parse error:', err.message);
    res.status(500).json({ message: err.message || 'Resume parsing failed' });
  }
});

module.exports = router;
