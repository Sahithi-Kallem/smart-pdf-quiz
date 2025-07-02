const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Increase payload limits for large files
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Configure multer for larger files
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Helper function to chunk text for large documents
function chunkText(text, maxChunkSize = 8000) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Helper function to extract topics from text
function extractTopics(text) {
  const topics = new Set();
  const commonTopics = [
    'introduction', 'conclusion', 'methodology', 'results', 'discussion',
    'background', 'literature review', 'analysis', 'implementation', 'evaluation',
    'recommendations', 'future work', 'summary', 'abstract', 'references'
  ];
  
  const textLower = text.toLowerCase();
  commonTopics.forEach(topic => {
    if (textLower.includes(topic)) {
      topics.add(topic.charAt(0).toUpperCase() + topic.slice(1));
    }
  });
  
  // Extract chapter/section headings (simple heuristic)
  const headings = text.match(/^[A-Z][A-Za-z\s]{3,30}$/gm) || [];
  headings.slice(0, 10).forEach(heading => {
    if (heading.length < 50) {
      topics.add(heading.trim());
    }
  });
  
  return Array.from(topics).slice(0, 8); // Limit to 8 topics
}

// Helper function to determine question count based on document characteristics
function calculateQuestionCount(wordCount, pageCount, topics) {
  let baseQuestions = 5;
  
  // Increase questions based on document size
  if (wordCount > 5000) baseQuestions += 3;
  if (wordCount > 10000) baseQuestions += 3;
  if (wordCount > 20000) baseQuestions += 4;
  
  // Increase questions based on page count
  if (pageCount > 10) baseQuestions += 2;
  if (pageCount > 25) baseQuestions += 3;
  if (pageCount > 50) baseQuestions += 5;
  
  // Increase questions based on topic diversity
  baseQuestions += Math.min(topics.length, 5);
  
  // Cap at reasonable maximum
  return Math.min(baseQuestions, 25);
}

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('📥 Received file:', req.file.originalname, `(${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Extract PDF content
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const fullText = pdfData.text;
    const wordCount = fullText.split(/\s+/).length;
    const pageCount = pdfData.numpages;
    
    console.log(`📄 Extracted PDF: ${pageCount} pages, ${wordCount} words`);

    // Extract topics
    const topics = extractTopics(fullText);
    console.log('🏷️ Identified topics:', topics);

    // Calculate optimal question count
    const questionCount = calculateQuestionCount(wordCount, pageCount, topics);
    console.log(`🎯 Generating ${questionCount} questions`);

    // For very large documents, process in chunks
    const chunks = chunkText(fullText, 12000);
    console.log(`📚 Processing ${chunks.length} text chunks`);

    let allQuestions = [];
    let summaryParts = [];

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const questionsForChunk = Math.ceil(questionCount / chunks.length);
      
      console.log(`🔄 Processing chunk ${i + 1}/${chunks.length} (${questionsForChunk} questions)`);

      const prompt = {
        contents: [
          {
            parts: [
              {
                text: `
You are an expert educational content creator. Analyze the following text and generate:

1. A comprehensive summary (2-3 paragraphs) focusing on key concepts and main ideas
2. ${questionsForChunk} high-quality multiple-choice questions with:
   - Clear, specific questions that test understanding
   - 4 well-crafted options (A, B, C, D)
   - Correct answer (as A, B, C, or D)
   - Detailed explanation for the correct answer
   - Topic classification for each question

Make questions varied in difficulty and cover different aspects of the content.
Include questions that test:
- Factual recall
- Conceptual understanding  
- Application of knowledge
- Analysis and synthesis

Respond in clean JSON format:
{
  "summary": "Comprehensive summary of key concepts and main ideas...",
  "questions": [
    {
      "question": "Clear, specific question text...",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "answer": "C",
      "explanation": "Detailed explanation of why this answer is correct and others are wrong...",
      "topic": "${topics[i % topics.length] || 'General'}",
      "difficulty": "medium"
    }
  ]
}

Text to analyze:
"""${chunk}"""
                `.trim()
              }
            ]
          }
        ]
      };

      try {
        const geminiRes = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, prompt, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 second timeout per chunk
        });

        const raw = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extract JSON safely
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
          console.warn(`⚠️ No valid JSON found in chunk ${i + 1} response`);
          continue;
        }
        
        const cleanJSON = raw.slice(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(cleanJSON);

        if (parsed.summary) {
          summaryParts.push(parsed.summary);
        }
        
        if (parsed.questions && Array.isArray(parsed.questions)) {
          allQuestions.push(...parsed.questions);
        }

      } catch (chunkError) {
        console.error(`❌ Error processing chunk ${i + 1}:`, chunkError.message);
        // Continue with other chunks even if one fails
      }

      // Add delay between API calls to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Combine summaries
    const finalSummary = summaryParts.length > 1 
      ? `This document covers multiple key areas:\n\n${summaryParts.join('\n\n')}`
      : summaryParts[0] || 'Summary could not be generated.';

    // Ensure we have enough questions, but not too many
    const finalQuestions = allQuestions.slice(0, questionCount);
    
    // If we don't have enough questions, pad with simpler ones
    if (finalQuestions.length < Math.min(questionCount, 5)) {
      console.warn(`⚠️ Only generated ${finalQuestions.length} questions, expected ${questionCount}`);
    }

    console.log(`✅ Generated ${finalQuestions.length} questions across ${topics.length} topics`);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    const response = {
      summary: finalSummary,
      questions: finalQuestions,
      topics: topics,
      wordCount: wordCount,
      pageCount: pageCount,
      processingInfo: {
        chunksProcessed: chunks.length,
        questionsGenerated: finalQuestions.length,
        topicsIdentified: topics.length
      }
    };

    res.json(response);

  } catch (err) {
    console.error('❌ Error:', err.message);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    let errorMessage = 'Internal Server Error';
    if (err.message.includes('timeout')) {
      errorMessage = 'Processing timeout - document may be too large or complex';
    } else if (err.message.includes('ENOENT')) {
      errorMessage = 'File processing error - please try uploading again';
    } else if (err.message.includes('JSON')) {
      errorMessage = 'AI response parsing error - please try again';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    maxFileSize: '100MB',
    features: ['large-pdf-support', 'adaptive-questions', 'topic-analysis']
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Enhanced PDF Quiz Generator server running at http://localhost:${PORT}`);
  console.log(`📁 Max file size: 100MB`);
  console.log(`🧠 AI-powered adaptive question generation enabled`);
});