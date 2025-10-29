import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import { pdfjsLib } from './pdfWorker';

export interface ParsedContent {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'ppt' | 'txt';
}

export const parseFile = async (file: File): Promise<ParsedContent> => {
  const fileName = file.name;
  const fileType = getFileType(fileName);

  switch (fileType) {
    case 'pdf':
      return await parsePDF(file);
    case 'ppt':
      return await parsePPTX(file);
    case 'txt':
      return await parseTXT(file);
    default:
      throw new Error('Unsupported file type');
  }
};

const getFileType = (fileName: string): 'pdf' | 'ppt' | 'txt' => {
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'ppt' || ext === 'pptx') return 'ppt';
  if (ext === 'txt') return 'txt';
  throw new Error('Unsupported file type');
};

const parsePDF = async (file: File): Promise<ParsedContent> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Extract text from all pages
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str || '')
        .join(' ');
      text += pageText + '\n\n';
    }

    return {
      text: text.trim() || 'No text content found in PDF',
      fileName: file.name,
      fileType: 'pdf',
    };
  } catch (error) {
    throw new Error('Failed to parse PDF file');
  }
};

const parsePPTX = async (file: File): Promise<ParsedContent> => {
  try {
    const zip = new JSZip();
    const arrayBuffer = await file.arrayBuffer();
    const pptx = await zip.loadAsync(arrayBuffer);

    const slides: string[] = [];

    // Extract text from all slides
    for (const [path, entry] of Object.entries(pptx.files)) {
      if (path.startsWith('ppt/slides/slide') && path.endsWith('.xml')) {
        try {
          const xml = await entry.async('text');
          const parsed = await parseStringPromise(xml);
          
          // Extract text from the parsed XML structure
          const textNodes = parsed['p:sld']?.['p:cSld']?.[0]?.['p:spTree']?.[0]?.['p:sp'] || [];
          
          for (const node of textNodes) {
            const text = node['p:txBody']?.[0]?.['a:p']
              ?.map((p: any) =>
                p['a:r']?.map((r: any) => r['a:t']?.[0]).join(' ')
              )
              ?.join(' ') || '';
            
            if (text.trim()) {
              slides.push(text);
            }
          }
        } catch (error) {
          // Failed to parse slide - continue with next slide
          continue;
        }
      }
    }

    const text = slides.length > 0 
      ? slides.join('\n\n') 
      : 'No text content found in presentation';

    return {
      text: text,
      fileName: file.name,
      fileType: 'ppt',
    };
  } catch (error) {
    throw new Error('Failed to parse PowerPoint file');
  }
};

const parseTXT = async (file: File): Promise<ParsedContent> => {
  try {
    const text = await file.text();
    return {
      text: text,
      fileName: file.name,
      fileType: 'txt',
    };
  } catch (error) {
    throw new Error('Failed to parse text file');
  }
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF, PPT, PPTX, and TXT files are supported' };
  }

  return { valid: true };
};

