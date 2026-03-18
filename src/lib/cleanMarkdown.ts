export function cleanMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`([^`]+)`/g, '$1')    // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')   // italic
    .replace(/#{1,6}\s/g, '')        // headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[>\-|]/g, '')          // blockquotes, list markers, tables
    .replace(/\n{2,}/g, '. ')        // paragraph breaks → pauses
    .replace(/\n/g, ' ')
    .trim();
}
