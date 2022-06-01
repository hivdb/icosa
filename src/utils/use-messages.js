import {useMemo} from 'react';

export default function useMessages(messageKeys, allMessages) {
  return useMemo(
    () => {
      const msgs = [];
      for (const key of messageKeys) {
        if (allMessages && key in allMessages) {
          msgs.push(allMessages[key]);
        }
        else {
          msgs.push(`<${key}>`);
        }
      }
      return msgs;
    },
    [messageKeys, allMessages]
  );
}
