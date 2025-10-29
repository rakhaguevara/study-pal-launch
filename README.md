# StudyPal Launch - AI-Powered Study Companion

An intelligent study companion that adapts to different learning styles (Visual, Auditory, Reading/Writing, Kinesthetic) and provides personalized learning experiences through AI-generated content.

## 🚀 Features

- **Adaptive Learning Styles**: Supports Visual, Auditory, Reading/Writing, and Kinesthetic learning preferences
- **AI-Powered Content Generation**: 
  - Smart summaries tailored to your learning style
  - Interactive flashcards with adaptive formatting
  - Dynamic quiz generation with multiple question types
- **Study Material Management**: Upload and process PDF, PPT, PPTX, and TXT files
- **Session Tracking**: Persistent study sessions with Supabase integration
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI Components
- **State Management**: Zustand
- **Database**: Supabase
- **AI Integration**: OpenAI GPT-4
- **File Processing**: PDF.js, JSZip
- **Drag & Drop**: @dnd-kit

## 📁 Project Structure

```
study-pal-launch/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── DashboardCards.tsx
│   │   ├── FlashcardViewer.tsx
│   │   ├── QuizRenderer.tsx
│   │   └── ...
│   ├── pages/              # Route components
│   │   ├── Dashboard.tsx
│   │   ├── Quiz.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useOpenAI.ts
│   │   └── use-mobile.tsx
│   ├── integrations/       # External service integrations
│   │   └── supabase/
│   ├── lib/                # Utility libraries
│   ├── store/              # State management
│   └── utils/              # Helper functions
├── supabase/               # Database schema and functions
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Docker orchestration
└── env.template            # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker (optional)
- Supabase account
- OpenAI API key

### Environment Setup

1. Copy the environment template:
   ```bash
   cp env.template .env
   ```

2. Fill in your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=sk-proj-your-openai-api-key
   ```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Development

#### Production Build
```bash
npm run docker:build
```

#### Development with Hot Reload
```bash
npm run docker:dev
```

## 🐳 Docker Commands

### Build and Run Production
```bash
docker-compose down
docker-compose up --build
# App will be available at http://localhost:3001
```

### Development Mode with Hot Reload
```bash
docker-compose down
docker-compose --profile dev up --build
# App will be available at http://localhost:3001 with hot reload
```

### Stop Containers
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f study-pal-app
```

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run docker:build` - Build and run with Docker
- `npm run docker:dev` - Run development mode with Docker

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Update your `.env` with the project URL and anon key

### OpenAI Integration
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

## 🎯 Key Features Explained

### Learning Style Adaptation
The app adapts content generation based on your selected learning style:
- **Visual**: Mind maps, diagrams, bullet points
- **Auditory**: Conversational tone, storytelling
- **Reading/Writing**: Detailed paragraphs, comprehensive notes
- **Kinesthetic**: Hands-on exercises, step-by-step instructions

### AI Content Generation
- **Summaries**: Tailored explanations based on learning style
- **Flashcards**: Adaptive question/answer formats
- **Quizzes**: Dynamic question types (multiple choice, drag-drop, fill-blank)

### File Processing
Supports multiple file formats with intelligent parsing:
- PDF documents
- PowerPoint presentations (.ppt, .pptx)
- Text files (.txt)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include environment details and error logs

---

**Happy Studying! 🎓**