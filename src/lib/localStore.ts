import { writable } from 'svelte/store';

// Create a writable store that persists data in localStorage
function createLocalStore(key: string, initialValue: any) {
  // Get stored data from localStorage (if it exists)
  const storedValue = localStorage.getItem(key);
  const value = storedValue ? JSON.parse(storedValue) : initialValue;

  const store = writable(value);

  // Update localStorage whenever the store changes
  store.subscribe((currentValue) => {
    localStorage.setItem(key, JSON.stringify(currentValue));
  });

  return store;
}

// Example stores: likedBooks and readlistBooks
export const likedBooks = createLocalStore('likedBooks', []);  // stores liked books
export const readlistBooks = createLocalStore('readlistBooks', []);  // stores readlist books
