import { useState } from 'react';
import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  imageUrl?: string;
  type: 'multiple-choice' | 'drag-drop' | 'fill-blank';
}

export type LearningStyle = 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';

  const getAdaptivePrompt = (
    materialText: string,
    learningStyle: LearningStyle,
    contentType: 'summary' | 'flashcards' | 'quiz'
  ): string => {
    const styleGuidance = {
      visual: 'Use visual aids, mind maps, bullet points, and hierarchical structures. Create simple roadmap or flowchart-style explanations.',
      auditory: 'Use conversational, narrative tone. Explain as if talking to the learner. Include dialogue and storytelling elements.',
      reading_writing: 'Use detailed paragraphs, comprehensive notes, lists, and bullet points. Focus on written explanations and definitions.',
      kinesthetic: 'Focus on hands-on, practical "learn by doing" approach. Provide exercises, step-by-step instructions, and actionable tasks.',
    }[learningStyle];

    const contentGuidance = {
      summary: `Summarize this learning material into a concise, clear explanation suitable for a ${learningStyle} learner. Return only plain text with clean paragraphs - NO markdown formatting, NO headings, NO bold text, NO bullet points. Just straightforward, readable text. ${styleGuidance}`,
      flashcards: `Generate 5-10 flashcards from this material. Each card should have a clear question/term on the front and a concise explanation on the back. Format for ${learningStyle} learners: ${styleGuidance}`,
      quiz: `Generate a quiz from this material with 5-8 questions suitable for a ${learningStyle} learner. Return valid JSON only. ${styleGuidance}`,
    }[contentType];

    return contentGuidance;
  };

export const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClient = (): OpenAI => {
    if (!API_KEY) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env');
    }
    return new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true,
    });
  };

  // Helper function to clean markdown from AI output
  const cleanMarkdown = (text: string): string => {
    if (!text) return text;
    
    return text
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold
      .replace(/\*\*(.+?)\*\*/g, '$1')
      // Remove markdown italic
      .replace(/\*(.+?)\*/g, '$1')
      // Remove markdown links but keep text
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      // Clean up extra spaces
      .replace(/\n\n\n+/g, '\n\n')
      // Trim whitespace
      .trim();
  };

  const generateSummary = async (
    materialText: string,
    learningStyle: LearningStyle,
    summaryLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const lengthGuidance = {
        short: '1-2 paragraphs, very concise',
        medium: '2-4 paragraphs, moderate detail',
        long: '4-6 paragraphs or more, comprehensive coverage'
      }[summaryLength];

      const prompt = getAdaptivePrompt(materialText, learningStyle, 'summary');
      const enhancedPrompt = `${prompt}\n\nLength requirement: ${lengthGuidance}. Generate a ${summaryLength} summary with approximately ${lengthGuidance}.`;

      const tokenLimit = {
        short: 500,
        medium: 1000,
        long: 2000
      }[summaryLength];

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assistant that adapts explanations to different learning styles. Always return clean, readable text without markdown formatting.',
          },
          {
            role: 'user',
            content: `${enhancedPrompt}\n\nLearning Material:\n${materialText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: tokenLimit,
      });

      const rawSummary = completion.choices[0].message.content || 'Summary generation failed';
      return cleanMarkdown(rawSummary);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate summary';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlashcards = async (
    materialText: string,
    learningStyle: LearningStyle
  ): Promise<Flashcard[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const prompt = getAdaptivePrompt(materialText, learningStyle, 'flashcards');

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assistant. Generate flashcards in JSON format: [{ "front": "...", "back": "..." }]',
          },
          {
            role: 'user',
            content: `${prompt}\n\nLearning Material:\n${materialText}\n\nReturn only valid JSON array.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = completion.choices[0].message.content || '[]';
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || [null, content];
      const jsonText = jsonMatch[1] || jsonMatch[0] || content;
      
      const flashcards = JSON.parse(jsonText);
      
      return flashcards.map((card: any, index: number) => ({
        id: `card-${index}`,
        front: card.front || card.question,
        back: card.back || card.answer,
      }));
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate flashcards';
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuiz = async (
    materialText: string,
    learningStyle: LearningStyle
  ): Promise<QuizQuestion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const prompt = getAdaptivePrompt(materialText, learningStyle, 'quiz');

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assistant. Generate quiz questions in JSON format: [{ "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0 }]',
          },
          {
            role: 'user',
            content: `${prompt}\n\nLearning Material:\n${materialText}\n\nReturn only valid JSON array.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content || '[]';
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || [null, content];
      const jsonText = jsonMatch[1] || jsonMatch[0] || content;
      
      const questions = JSON.parse(jsonText);
      
      return questions.map((q: any, index: number) => ({
        id: `q-${index}`,
        question: q.question,
        options: q.options || q.choices || [],
        correctAnswer: q.correctAnswer || 0,
        type: learningStyle === 'kinesthetic' ? 'drag-drop' : 'multiple-choice',
      }));
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate quiz';
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSummary,
    generateFlashcards,
    generateQuiz,
    isLoading,
    error,
    cleanMarkdown,
  };
};

