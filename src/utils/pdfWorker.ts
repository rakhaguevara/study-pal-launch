import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite-specific worker import
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

// Configure PDF.js to use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export { pdfjsLib };





