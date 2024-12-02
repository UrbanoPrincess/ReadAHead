<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';

  // Initialize Firebase
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth();

  interface Book {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage?: string;
    purchaseUrl?: string;
    addedToReadlist: boolean;
  }

  let readlistBooks: Book[] = [];

  // Get current user email from Firebase Authentication
  const currentUserEmail = auth.currentUser?.email;

  // Ensure the email is a valid string before proceeding
  if (!currentUserEmail) {
    throw new Error('User is not logged in or email is unavailable');
  }

  // Fetch user's readlist
  async function fetchReadlist() {
    if (!currentUserEmail) {
      console.error("User is not logged in or email is undefined.");
      return;
    }

    const userReadlistRef = doc(db, "userReadlists", currentUserEmail);

    try {
      const docSnap = await getDoc(userReadlistRef);

      if (!docSnap.exists()) {
        console.error("No readlist found for this user.");
        return;
      }

      const readlist = docSnap.data()?.bookIds || [];
      console.log("Fetched book IDs:", readlist);

      // Fetch book details for each book in the readlist
      readlistBooks = await Promise.all(
        readlist.map(async (bookId: string) => {
          const bookRef = doc(db, "recommendedBooks", bookId);
          const bookSnap = await getDoc(bookRef);

          if (!bookSnap.exists()) {
            console.warn(`Book with ID ${bookId} does not exist.`);
          }

          return { id: bookSnap.id, ...bookSnap.data() } as Book;
        })
      );
    } catch (error) {
      console.error("Error fetching readlist:", error);
      alert("Failed to fetch readlist.");
    }
  }

  // Add book to readlist
  async function addToReadlist(bookId: string) {
    if (!currentUserEmail) {
      alert("User is not logged in!");
      return;
    }

    const userReadlistRef = doc(db, "userReadlists", currentUserEmail);

    try {
      await updateDoc(userReadlistRef, {
        bookIds: arrayUnion(bookId), // Adds the book ID to the array without duplicates
      });
      console.log("Book added to readlist!");
      fetchReadlist(); // Refetch to update the UI
    } catch (error) {
      console.error("Error adding book to readlist:", error);
      alert("Failed to add book to readlist.");
    }
  }

  // Remove book from readlist
  async function removeFromReadlist(bookId: string) {
    const userReadlistRef = doc(db, "userReadlists", currentUserEmail);

    try {
      await updateDoc(userReadlistRef, {
        bookIds: arrayRemove(bookId),
      });

      // Update local state to reflect removal
      readlistBooks = readlistBooks.filter(book => book.id !== bookId);

      console.log("Book removed from readlist!");
      alert("Book removed from your readlist!");
    } catch (error) {
      console.error("Error removing book from readlist:", error);
      alert("Failed to remove book from the readlist.");
    }
  }

  // Fetch the user's readlist when the component mounts
  onMount(() => {
    fetchReadlist();
  });
</script>

<style>
  .btn {
    background-color: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
</style>

<div class="container mx-auto p-8">
  <h2 class="text-3xl font-bold mb-6 text-center">Your Readlist</h2>
  <div class="flex flex-col space-y-8">
    {#each readlistBooks as book}
      <div class="card bg-white shadow-lg p-6 rounded-lg w-full">
        <div class="flex items-start space-x-6">
          {#if book.coverImage}
            <img src={book.coverImage} alt="{book.title} cover" class="w-32 h-auto" />
          {/if}
          <div class="flex flex-col space-y-1">
            <h3 class="font-semibold text-2xl">{book.title}</h3>
            <p class="m-0"><strong>Author:</strong> {book.author}</p>
            <p class="m-0"><strong>Genre:</strong> {book.genre}</p>
            <p class="m-0"><strong>Description:</strong> {book.description}</p>

            <div class="mt-6 flex justify-end space-x-4">
              <!-- Remove from Readlist Button -->
              <button class="btn" on:click={() => removeFromReadlist(book.id)}>
                ➖ Remove from Readlist
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
