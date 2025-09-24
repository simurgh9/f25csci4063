export function chunkText(text: string, maxLength = 2000): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  const paragraphs = text.split(/\n\s*\n/);

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLength) {
      currentChunk = processLongParagraph(paragraph, maxLength, chunks, currentChunk);
    } else {
      currentChunk = processShortParagraph(paragraph, maxLength, chunks, currentChunk);
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export function processLongParagraph(paragraph: string, maxLength: number, chunks: string[], currentChunk: string): string {
  const sentences = paragraph.split(/(?<=[.?!])\s+/);
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + " ";
    } else {
      currentChunk += sentence + " ";
    }
  }
  return currentChunk;
}

export function processShortParagraph(paragraph: string, maxLength: number, chunks: string[], currentChunk: string): string {
  if ((currentChunk + paragraph).length > maxLength) {
    chunks.push(currentChunk.trim());
    currentChunk = paragraph + " ";
  } else {
    currentChunk += paragraph + " ";
  }
  return currentChunk;
}