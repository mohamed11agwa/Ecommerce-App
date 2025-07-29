# ChatGPT Clone - Day 4 Lab Assignment

A comprehensive ChatGPT clone built with Next.js, TypeScript, and Tailwind CSS, featuring advanced OpenAI API integrations including vision capabilities, file processing, AI reminder agent, embeddings, fine-tuning, and RAG (Retrieval-Augmented Generation) system.

## 🚀 Features

### ✅ Core Chat Functionality
- **Modern Chat Interface**: Clean, responsive design with dark mode support
- **Real-time Messaging**: Seamless conversation flow with typing indicators
- **Message History**: Persistent chat history with timestamps
- **New Chat**: Start fresh conversations anytime

### 🔍 Vision Capabilities
- **Image Upload**: Drag & drop or click to upload images
- **Image Analysis**: GPT-4 Vision API integration for detailed image analysis
- **Multiple Images**: Support for multiple image uploads per message
- **Image Preview**: Thumbnail previews with remove functionality

### 📁 File Upload & Processing
- **Document Support**: PDF, Word documents, text files, Markdown, JSON, CSV
- **Drag & Drop**: Intuitive file upload interface
- **File Preview**: Display uploaded files with metadata
- **Content Extraction**: Extract and analyze document content

### 🤖 AI Reminder Agent
- **Smart Scheduling**: Set reminders with natural language
- **Email Notifications**: Automated email reminders at scheduled times
- **Quick Actions**: Pre-defined reminder templates
- **Cron Scheduling**: Precise timing with node-cron integration

### 🧠 OpenAI Embeddings API
- **Text Embeddings**: Generate vector representations of text
- **Document Storage**: Store documents with embeddings for search
- **Semantic Search**: Find relevant content using cosine similarity
- **Vector Operations**: Complete embedding workflow demonstration

### ⚙️ Fine-tuning API
- **Training Data Upload**: JSONL format training data support
- **Job Management**: Create, monitor, and cancel fine-tuning jobs
- **Model Deployment**: Use fine-tuned models in production
- **Progress Tracking**: Real-time job status monitoring

### 📚 RAG System (Chat with Files)
- **Document Chunking**: Intelligent text splitting for better retrieval
- **Embedding Storage**: Vector database for document chunks
- **Contextual Retrieval**: Find most relevant document sections
- **AI-Powered Answers**: Generate responses based on retrieved context
- **Source Citations**: Track which documents inform each answer

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **AI Integration**: OpenAI API (GPT-4, GPT-4 Vision, Embeddings, Fine-tuning)
- **File Handling**: React Dropzone, File processing utilities
- **Email**: Nodemailer for reminder notifications
- **Scheduling**: Node-cron for reminder timing
- **Development**: ESLint, TypeScript strict mode

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatgpt-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Email Configuration (for reminder agent)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Next.js Configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 API Endpoints

### Chat API (`/api/chat`)
- **POST**: Send messages with support for images and files
- Handles vision analysis and document processing
- Returns AI-generated responses

### Reminder API (`/api/reminder`)
- **POST**: Create new reminders
- **GET**: List active reminders
- **DELETE**: Cancel specific reminders

### Embeddings API (`/api/embeddings`)
- **POST**: Create embeddings, store documents, search
- **GET**: List stored documents
- **DELETE**: Clear document store

### Fine-tuning API (`/api/fine-tuning`)
- **POST**: Upload training data, create jobs
- **GET**: List jobs and files
- **DELETE**: Delete training files

### RAG API (`/api/rag`)
- **POST**: Upload documents, query knowledge base
- **GET**: List processed documents
- **DELETE**: Clear document store

## 🎨 Usage Examples

### 1. Vision Analysis
1. Click the image icon in the chat input
2. Upload one or more images
3. Ask questions about the images
4. Get detailed AI analysis

### 2. Document Chat
1. Click the paperclip icon
2. Upload documents (PDF, Word, text files)
3. Ask questions about the document content
4. Receive AI-powered answers with source citations

### 3. AI Reminders
1. Click the clock icon in the header
2. Enter your reminder task
3. Set date and time
4. Provide email address
5. Receive automated email notifications

### 4. API Testing
1. Click the settings icon to open API Dashboard
2. Test embeddings, fine-tuning, and RAG features
3. View real-time results and responses

## 🔧 Configuration

### OpenAI API Key
Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Email Configuration
For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASS`

### Supported File Types
- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT, MD, JSON, CSV

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Add environment variables and deploy
- **Docker**: Use the included Dockerfile for containerization

## 🧪 Testing the Features

### Vision Capabilities
```bash
# Upload an image and ask:
"What do you see in this image?"
"Describe the colors and composition"
"What objects are present?"
```

### Document Processing
```bash
# Upload a PDF and ask:
"Summarize this document"
"What are the key points?"
"Find information about [specific topic]"
```

### Embeddings Demo
```bash
# In API Dashboard > Embeddings:
1. Create embedding for: "The weather is sunny today"
2. Store documents: "It's raining outside" / "Beautiful sunny weather"
3. Search for: "weather conditions"
```

### RAG System
```bash
# In API Dashboard > RAG:
1. Upload documents separated by "---"
2. Ask: "What is the main topic of these documents?"
3. Get AI-powered answers with source citations
```

## 📝 Project Structure

```
chatgpt-clone/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── chat/      # Main chat API
│   │   │   ├── reminder/  # Reminder agent
│   │   │   ├── embeddings/# Embeddings API
│   │   │   ├── fine-tuning/# Fine-tuning API
│   │   │   └── rag/       # RAG system
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   └── components/
│       ├── ChatInterface.tsx    # Main chat component
│       ├── MessageList.tsx      # Message display
│       ├── FileUpload.tsx       # File upload modal
│       ├── ReminderAgent.tsx    # Reminder interface
│       └── ApiDashboard.tsx     # API testing dashboard
├── .env.local             # Environment variables
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the environment variables are correctly set
2. Ensure your OpenAI API key has sufficient credits
3. Verify email configuration for reminders
4. Check the console for error messages

## 🎉 Acknowledgments

- OpenAI for providing the powerful APIs
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first styling
- React Dropzone for file upload functionality
- Lucide React for beautiful icons

---

**Day 4 Lab Assignment Completed** ✅

All requested features have been implemented:
- ✅ Vision capability (image attachment and analysis)
- ✅ File input functionality (document upload and analysis)
- ✅ AI reminder agent with email notifications
- ✅ OpenAI Embedding API integration
- ✅ OpenAI Fine-tuning API demonstration
- ✅ Simple RAG system for chat with files

The application is ready for testing and deployment!