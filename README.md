# Voice Intelligence App

A modern web application to upload, transcribe, and analyze audio conversations with AI-powered insights.

## Features
- Upload audio files (MP3, WAV, etc.)
- Automatic transcription using Groq Whisper
- AI-powered analysis: sentiment, summary, speaker roles, talk ratio, and more
- Dashboard to view and download transcripts and insights
- Clean, modern UI (Next.js + Tailwind CSS)

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** NestJS, Groq SDK, Multer (file uploads)
- **AI/Transcription:** Groq Whisper, Groq LLMs
- **Database:** SQLite (default, can be swapped)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd voice-app
```

### 2. Setup Backend
```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in `backend/` with:
```
GROQ_API_KEY=your_groq_api_key_here
```

#### Run Backend
```bash
npm run start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

#### Run Frontend
```bash
npm run dev
```

- Frontend: http://localhost:3001 (or as configured)
- Backend: http://localhost:3000

## Usage
1. Go to the Upload page and upload an audio file.
2. After upload, you will be redirected to the dashboard.
3. View, download, or analyze transcripts and AI insights.

## Project Structure
```
voice-app/
  backend/      # NestJS API, file uploads, Groq integration
  frontend/     # Next.js app, UI, dashboard
```

## Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License
MIT 