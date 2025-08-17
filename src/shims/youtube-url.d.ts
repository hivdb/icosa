declare module 'youtube-url' {
  export function extractId(url: string): string | null;
  export function valid(url: string): boolean;
}
