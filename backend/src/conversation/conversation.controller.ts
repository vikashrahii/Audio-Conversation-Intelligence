// conversation.controller.ts
import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import Groq from 'groq-sdk';

@Controller('conversations')
export class ConversationController {
  private groq: Groq;
  constructor(
    private readonly conversationService: ConversationService,
    private readonly configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  @Get()
  findAll() {
    return this.conversationService.findAll();
  }

  @Post('upload-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          cb(null, uniqueSuffix);
        },
      }),
    }),
  )
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const audioUrl = file.path;
    const conversation = await this.conversationService.create({ audioUrl });
    return { id: conversation.id, audioUrl };
  }

  @Post('transcribe')
  async transcribe(@Body('conversationId') conversationId: number) {
    const conversation = await this.conversationService.findOne(conversationId);
    if (!conversation) return { error: 'Conversation not found' };
    if (!fs.existsSync(conversation.audioUrl))
      return { error: 'Audio file not found on server.' };

    try {
      const audioFilePath = conversation.audioUrl;
      const transcription = await this.groq.audio.transcriptions.create({
        model: 'whisper-large-v3-turbo',
        file: fs.createReadStream(audioFilePath),
      });
      const transcriptText = transcription.text;
      await this.conversationService.update(conversationId, { transcriptText });
      return { id: conversationId, transcriptText };
    } catch (err) {
      console.error('Groq Whisper transcription error:', err);
      return {
        error: 'Transcription failed',
        details: err.message || 'Unknown error',
      };
    }
  }

  @Post('analyze')
  async analyze(@Body('conversationId') conversationId: number) {
    const conversation = await this.conversationService.findOne(conversationId);
    if (!conversation) return { error: 'Conversation not found' };
    if (!conversation.transcriptText)
      return { error: 'No transcript available for analysis' };

    try {
      const prompt = `
You are a conversation analyzer. Analyze the transcript and extract:
- Speaker roles (rep vs customer, or narrator, etc.)
- Talk ratio
- Number of questions asked
- Number of objections raised
- Sentiment per section (list each section/sentence and its sentiment: POSITIVE, NEGATIVE, NEUTRAL)
- Summary
- Key entities (products, organizations, people)

Respond ONLY with a valid JSON object with these keys:
speakerRoles, talkRatio, questionsAsked, objectionsRaised, sentiment, summary, entities.

If a key is not applicable, set its value to null or an empty object, but always include all keys.

Do not include any explanation, markdown, or code block. Only output the JSON object.

Transcript:
"""
${conversation.transcriptText}
"""
`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a conversation analyst.' },
          { role: 'user', content: prompt },
        ],
        model: 'llama3-70b-8192',
      });
      let content = chatCompletion.choices[0].message.content;
      // Remove code block markers if present
      content = content.replace(/```(json)?/g, '').trim();
      let analysisJson;
      try {
        analysisJson = JSON.parse(content);
      } catch (e) {
        analysisJson = { summary: content };
      }
      await this.conversationService.update(conversationId, { analysisJson });
      return { id: conversationId, analysis: analysisJson };
    } catch (err) {
      console.error('Groq Analysis Error:', err);
      return {
        error: 'Analysis failed',
        details: err.message || 'Groq returned invalid data',
      };
    }
  }

  @Post('chat')
  async chat(@Body('message') message: string, @Body('conversationId') conversationId?: number) {
    if (!message || typeof message !== 'string') {
      return { error: 'Message is required.' };
    }
    let systemPrompt = 'You are a helpful AI assistant for a voice intelligence app.';
    if (conversationId) {
      const conversation = await this.conversationService.findOne(conversationId);
      if (conversation && conversation.transcriptText) {
        systemPrompt += `\n\nHere is the transcript of the uploaded audio for context:\n"""${conversation.transcriptText}"""`;
      }
    }
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        model: 'llama3-70b-8192',
      });
      const content = chatCompletion.choices[0].message.content;
      return { response: content };
    } catch (err) {
      console.error('Groq Chat Error:', err);
      return { error: 'Chat failed', details: err.message || 'Groq returned invalid data' };
    }
  }
}
