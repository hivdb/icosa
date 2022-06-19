import {useMemo} from 'react';


export function loadMessages(messageKeys, allMessages) {
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
}


export default function useMessages(messageKeys, allMessages) {
  return useMemo(
    () => loadMessages(messageKeys, allMessages),
    [messageKeys, allMessages]
  );
}
