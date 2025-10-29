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

export interface SummaryResult {
  summary: string;
  insights: string[];
  studyPath?: string; // Suggested study path for kinesthetic learners
  ttsOptimizedText?: string; // TTS-optimized version for auditory learners
}

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

  // Helper function to parse summary response with insights, study path, and TTS text
  const parseSummaryResponse = (text: string, learningStyle: LearningStyle): SummaryResult => {
    if (!text) {
      return { summary: '', insights: [] };
    }

    // Try to extract structured sections
    const detailedSummaryMatch = text.match(/##\s*Detailed\s*Summary\s*\n\n?([\s\S]*?)(?=\n##\s*(?:Key\s*Insights|Suggested\s*Study\s*Path|TTS\s*Optimized|$))/i);
    const keyInsightsMatch = text.match(/##\s*Key\s*Insights\s*\n\n?([\s\S]*?)(?=\n##\s*(?:Suggested\s*Study\s*Path|TTS\s*Optimized|$))/i);
    const studyPathMatch = text.match(/##\s*Suggested\s*Study\s*Path\s*\n\n?([\s\S]*?)(?=\n##\s*TTS\s*Optimized|$)/i);
    const ttsOptimizedMatch = text.match(/##\s*TTS\s*Optimized\s*Text\s*\n\n?([\s\S]*?)$/i);

    let summary = '';
    let insights: string[] = [];
    let studyPath: string | undefined;
    let ttsOptimizedText: string | undefined;

    if (detailedSummaryMatch) {
      summary = cleanMarkdown(detailedSummaryMatch[1].trim());
    } else {
      // Fallback: use the whole text
      summary = cleanMarkdown(text);
    }

    if (keyInsightsMatch) {
      const insightsText = keyInsightsMatch[1].trim();
      insights = insightsText
        .split(/[-•* Kramer:]\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 6);
    }

    if (studyPathMatch && learningStyle === 'kinesthetic') {
      studyPath = cleanMarkdown(studyPathMatch[1].trim());
    }

    if (ttsOptimizedMatch && learningStyle === 'auditory') {
      ttsOptimizedText = cleanMarkdown(ttsOptimizedMatch[1].trim());
    }

    return { summary, insights, studyPath, ttsOptimizedText };
  };

  const generateSummary = async (
    materialText: string,
    learningStyle: LearningStyle,
    summaryLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<SummaryResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      // Exact word count requirements
      const wordCountRequirements = {
        short: '150-200 words (2-3 concise paragraphs)',
        medium: '400-600 words (5-6 well-developed paragraphs)',
        long: '1000+ words (comprehensive explanation with subheadings and logical flow, structured like a complete learning module)'
      }[summaryLength];

      // Learning style adaptations
      const styleAdaptations = {
        visual: `Adapt for VISUAL learners:
- Use clear structure with logical flow
- Emphasize conceptual explanations, hierarchical relationships, and systems thinking
- Use descriptive language that helps visualize concepts
- Create mental models and frameworks
- Explain processes step-by-step with clear visual metaphors`,
        auditory: `Adapt for AUDITORY learners:
- Use conversational, narrative tone - write as if you're talking directly to the learner
- Use smooth, flowing sentences that sound natural when spoken
- Avoid long lists or complex bullet points - integrate information into paragraphs
- Use storytelling elements, examples, and analogies
- Write in a way that's optimized for Text-to-Speech playback (avoid code blocks, use plain English descriptions instead)`,
        reading_writing: `Adapt for READING/WRITING learners:
- Use detailed paragraphs with comprehensive explanations
- Include definitions, lists, and structured notes
- Focus on written explanations and proper terminology
- Use clear headings and subheadings for organization
- Provide extensive context and background information`,
        kinesthetic: `Adapt for KINESTHETIC learners:
- Focus on hands-on, practical "learn by doing" approach
- Provide real-world examples, analogies, and concrete scenarios
- Include actionable steps and practical applications
- Explain how concepts are used in practice
- Connect abstract ideas to physical actions and experiences`
      }[learningStyle];

      // Content quality instructions
      const qualityInstructions = `CRITICAL QUALITY REQUIREMENTS:
- Preserve the original meaning, tone, and technical depth of the material
- Write in fluent, academic English with clear, logical flow
- Retain technical accuracy (especially for IT, programming, or data-related content)
- If material includes code or procedural steps (Docker, Ansible, etc.), rewrite them clearly and sequentially in plain language
- Ensure educational usefulness and clarity
- Make the summary feel complete and comprehensive for the chosen length`;

      // Build the prompt
      const basePrompt = `You are an expert academic summarization assistant integrated into the StudyPal learning app.

TASK: Generate a high-quality, context-aware summary from the provided educational material.

SUMMARY LENGTH: ${summaryLength.toUpperCase()}
WORD COUNT REQUIREMENT: ${wordCountRequirements}
${summaryLength === 'long' ? '- Must include subheadings and structured sections\n- Should feel like a complete, comprehensive learning module' : ''}

LEARNING STYLE: ${learningStyle.toUpperCase()}
${styleAdaptations}

${qualityInstructions}

SOURCE MATERIAL:
${materialText}

OUTPUT FORMAT (use this EXACT structure):

## Detailed Summary
${summaryLength === 'long' ? '<Write a comprehensive explanation with subheadings (use ### for subheadings). Include deep explanations, context, examples, and cover all important details. Structure should have logical flow between sections.>\n\n' : '<Write the complete summary here in paragraph form, maintaining the original meaning and technical depth. '}
${summaryLength === 'short' ? 'Write 2-3 concise paragraphs (150-200 words total) that capture the essence of the material.' : summaryLength === 'medium' ? 'Write 5-6 well-developed paragraphs (400-600 words total) with balanced detail covering key concepts and processes.' : 'Write a comprehensive, detailed explanation (1000+ words) structured with subheadings. Each section should deeply explain concepts, provide context, use examples, and explain relationships between ideas.'}

## Key Insights
<Provide 3-6 critical takeaways in bullet point format. Each insight should be concise, actionable, and capture essential lessons from the material.>
${summaryLength === 'short' ? '- [Insight 1]\n- [Insight 2]\n- [Insight 3]' : '- [Insight 1]\n- [Insight 2]\n- [Insight 3]\n- [Insight 4]\n- [Insight 5]\n- [Insight 6]'}

${learningStyle === 'kinesthetic' ? `## Suggested Study Path
<Provide a simple interactive activity or step-by-step practice guide based on the material. Include hands-on exercises, actionable tasks, or real-world applications that help the learner practice the concepts. Format as clear, numbered steps or actionable tasks.>` : ''}

${learningStyle === 'auditory' ? `## TTS Optimized Text
<Generate a Text-to-Speech optimized version of the Detailed Summary. Requirements:
- Use smooth, spoken-friendly sentences (avoid long lists)
- Convert any bullet points or structured content into flowing prose
- Avoid technical jargon without explanation
- Use natural pauses (periods, commas) for better speech rhythm
- Remove code blocks and convert procedural steps into conversational explanations
- Make it sound natural when read aloud>
` : ''}`;

      const tokenLimit = {
        short: 1200,   // Enough for 200 words + insights
        medium: 3000,  // Enough for 600 words + insights + formatting
        long: 6000     // Enough for 1000+ words + insights + study path + formatting
      }[summaryLength];

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional academic summarization assistant that creates high-quality, context-aware summaries for educational materials. You excel at:
- Preserving original meaning, tone, and technical depth
- Adapting content to different learning styles (visual, auditory, reading/writing, kinesthetic)
- Creating fluent, academic English with clear logical flow
- Maintaining technical accuracy while improving clarity
- Generating structured, educational content that serves as complete learning modules`,
          },
          {
            role: 'user',
            content: basePrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: tokenLimit,
      });

      const rawResponse = completion.choices[0].message.content || 'Summary generation failed';
      return parseSummaryResponse(rawResponse, learningStyle);
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

