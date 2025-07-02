# 🚀 Smart PDF Quiz Generator

A comprehensive web application that transforms PDF documents into interactive learning experiences with AI-generated summaries and adaptive quizzes.

## ✨ Features

- **Large PDF Support**: Process documents up to 100MB
- **AI-Powered Analysis**: Uses Google Gemini AI for content understanding
- **Adaptive Quiz Generation**: Question count based on document complexity
- **Topic Detection**: Automatically identifies key themes
- **Real-time Processing**: Live progress tracking with estimated completion times
- **Comprehensive Analytics**: Detailed performance breakdown by topic
- **Professional UI**: Modern, responsive design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **Multer** for file uploads
- **PDF-Parse** for text extraction
- **Google Gemini AI** for content analysis
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Extract the project files
# Navigate to the project directory
cd pdf-quiz-generator
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the backend server
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Start the development server
npm run dev
```

### 4. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a free account
3. Generate an API key
4. Add it to `backend/.env`

## 🎯 Usage

1. **Upload PDF**: Drag and drop or select a PDF file (up to 100MB)
2. **Processing**: Watch real-time progress as AI analyzes your document
3. **Review Summary**: Read the comprehensive summary and identified topics
4. **Take Quiz**: Answer adaptive questions based on content complexity
5. **View Results**: Get detailed performance analytics and topic breakdown

## 📁 Project Structure

```
pdf-quiz-generator/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Node.js backend server
│   ├── server.js           # Main server file
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## 🔧 Configuration

### Backend Configuration
- **Port**: 5000 (configurable via PORT environment variable)
- **File Size Limit**: 100MB
- **Processing Timeout**: 5 minutes per request
- **Chunk Size**: 12,000 characters for large documents

### Frontend Configuration
- **Development Port**: 5173 (Vite default)
- **API Endpoint**: http://localhost:5000
- **File Upload Limit**: 100MB

## 🎨 Key Components

### Frontend Components
- **FileUpload**: Drag-and-drop file upload with validation
- **ProcessingStatus**: Real-time progress tracking with stage indicators
- **SummaryDisplay**: Document summary with statistics and topic overview
- **QuizInterface**: Interactive quiz with multiple-choice questions
- **ScoreDisplay**: Comprehensive results with topic-based analytics

### Backend Features
- **Large File Processing**: Handles documents up to 100MB
- **Text Chunking**: Processes large documents in manageable segments
- **Topic Extraction**: Automatically identifies key themes and concepts
- **Adaptive Question Generation**: Creates 5-25 questions based on content
- **Error Handling**: Robust error management with user-friendly messages

## 🔍 API Endpoints

### POST /upload
Processes PDF files and generates summaries with quiz questions.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file

**Response:**
```json
{
  "summary": "Comprehensive document summary...",
  "questions": [
    {
      "question": "Question text...",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "answer": "C",
      "explanation": "Detailed explanation...",
      "topic": "Topic name",
      "difficulty": "medium"
    }
  ],
  "topics": ["Topic 1", "Topic 2", ...],
  "wordCount": 5000,
  "pageCount": 20,
  "processingInfo": {
    "chunksProcessed": 3,
    "questionsGenerated": 15,
    "topicsIdentified": 8
  }
}
```

### GET /health
Health check endpoint for monitoring server status.

## 🚨 Troubleshooting

### Common Issues

1. **File Too Large Error**
   - Ensure PDF is under 100MB
   - Check available disk space

2. **API Key Issues**
   - Verify Gemini API key is correct
   - Check API quota and billing

3. **Processing Timeout**
   - Try with smaller documents
   - Check internet connection

4. **CORS Errors**
   - Ensure backend is running on port 5000
   - Check frontend API endpoint configuration

### Performance Tips

- **Large Documents**: Processing time scales with document size (1-5 minutes for 50MB+ files)
- **Question Quality**: Longer documents generate more comprehensive questions
- **Topic Detection**: Works best with well-structured documents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for content analysis
- React and Vite communities
- Tailwind CSS for styling framework
- All contributors and testers

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue with detailed error information

---

**Happy Learning! 📚✨**