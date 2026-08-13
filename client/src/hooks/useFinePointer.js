import { useSyncExternalStore } from 'react';

const finePointerQuery = '(hover: hover) and (pointer: fine)';
const subscribers = new Set();
let mediaQuery;
let listening = false;

const getMediaQuery = () => {
  if (typeof window === 'undefined') return null;
  if (!mediaQuery) mediaQuery = window.matchMedia(finePointerQuery);
  return mediaQuery;
};

const notifySubscribers = () => {
  subscribers.forEach((subscriber) => subscriber());
};

const subscribe = (subscriber) => {
  const query = getMediaQuery();
  subscribers.add(subscriber);

  if (query && !listening) {
    query.addEventListener('change', notifySubscribers);
    listening = true;
  }

  return () => {
    subscribers.delete(subscriber);

    if (query && listening && subscribers.size === 0) {
      query.removeEventListener('change', notifySubscribers);
      listening = false;
    }
  };
};

const getSnapshot = () => getMediaQuery()?.matches || false;
const getServerSnapshot = () => false;

export default function useFinePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
