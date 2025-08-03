import {useMemo} from 'react';

/**
 * Retrieve multiple messages from a dictionary using provided keys.
 *
 * @param messageKeys - Array of keys to look up.
 * @param allMessages - Optional dictionary of messages.
 * @returns Array of resolved messages or `<key>` placeholder strings.
 */
export function loadMessages(
  messageKeys: string[],
  allMessages?: Record<string, string>
): string[] {
  const msgs: string[] = [];
  for (const key of messageKeys) {
    if (allMessages && key in allMessages) {
      msgs.push(allMessages[key]);
    } else {
      msgs.push(`<${key}>`);
    }
  }
  return msgs;
}

/**
 * Retrieve a single message from a dictionary.
 *
 * @param messageKey - Key to look up.
 * @param allMessages - Optional dictionary of messages.
 * @returns The resolved message or `<key>` placeholder string.
 */
export function loadMessage(
  messageKey: string,
  allMessages?: Record<string, string>
): string {
  return loadMessages([messageKey], allMessages)[0];
}

/**
 * React hook wrapper around {@link loadMessages} that memoizes the result.
 *
 * @param messageKeys - Array of keys.
 * @param allMessages - Optional dictionary of messages.
 * @returns Memoized array of messages.
 */
export default function useMessages(
  messageKeys: string[],
  allMessages?: Record<string, string>
): string[] {
  return useMemo(
    () => loadMessages(messageKeys, allMessages),
    [messageKeys, allMessages]
  );
}

