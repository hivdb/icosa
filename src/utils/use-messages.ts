import {useMemo} from 'react';

/**
 * Retrieve an array of localized messages by keys.
 *
 * @param messageKeys - Keys to retrieve from the message dictionary.
 * @param allMessages - Dictionary containing localized strings.
 * @returns Array of resolved messages; missing keys are wrapped in brackets.
 */
export function loadMessages(
  messageKeys: string[],
  allMessages?: Record<string, string>
): string[] {
  const msgs: string[] = [];
  for (const key of messageKeys) {
    if (allMessages && key in allMessages) {
      msgs.push(allMessages[key]);
    }
    else {
      msgs.push(`<${key}>`);
    }
  }
  return msgs;
}

/**
 * Retrieve a single localized message.
 *
 * @param messageKey - Key to retrieve.
 * @param allMessages - Dictionary containing localized strings.
 * @returns Resolved message string.
 */
export function loadMessage(
  messageKey: string,
  allMessages?: Record<string, string>
): string {
  return loadMessages([messageKey], allMessages)[0];
}

/**
 * React hook to memoize resolved messages.
 *
 * @param messageKeys - Keys to retrieve from the dictionary.
 * @param allMessages - Dictionary containing localized strings.
 * @returns Array of resolved messages.
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
