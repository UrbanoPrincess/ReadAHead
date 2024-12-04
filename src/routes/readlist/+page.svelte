<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';
  import { onAuthStateChanged } from 'firebase/auth';
  import { CloseCircleSolid } from 'flowbite-svelte-icons';

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
  let currentUserEmail: string | null = null;
  let isLoading = true;

  onMount(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUserEmail = user.email;
        fetchReadlist();
      } else {
        console.error("User is not logged in.");
        isLoading = false;
      }
    });
  });

  async function fetchReadlist() {
    isLoading = true;
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
    } finally {
      isLoading = false;
    }
  }

  async function removeFromReadlist(bookId: string) {
    if (!currentUserEmail) {
      console.error("User is not logged in!");
      alert("User is not logged in!");
      return;
    }

    const userReadlistRef = doc(db, "userReadlists", currentUserEmail);

    try {
      await updateDoc(userReadlistRef, {
        bookIds: arrayRemove(bookId),
      });

      readlistBooks = readlistBooks.filter(book => book.id !== bookId);

      console.log("Book removed from readlist!");
      alert("Book removed from your readlist!");
    } catch (error) {
      console.error("Error removing book from readlist:", error);
      alert("Failed to remove book from the readlist.");
    }
  }
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .image-container {
    flex-shrink: 0;
    width: 100px;
  }

  .cover-image {
    width: 100%;
    height: auto;
    aspect-ratio: 2/3;
    object-fit: cover;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.9);
    border-radius: 4px;
  }

  .card {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 12px;
    border-radius: 12px;
  }

  .btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }

  .remove {
    color: #ef4444;
    font-weight: 500;
  }

  @media (min-width: 640px) {
    .image-container {
      width: 120px;
    }

    .card {
      padding: 16px;
    }
  }

  @media (max-width: 360px) {
    .image-container {
      width: 80px;
    }
  }

  .loader {
    width: 48px;
    height: 48px;
    border: 5px solid #FFF;
    border-bottom-color: #FF3D00;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-dots {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #FF3D00;
    animation: bounce 0.5s ease-in-out infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.1s;
    background-color: #FF6B00;
  }

  .dot:nth-child(3) {
    animation-delay: 0.2s;
    background-color: #FF9100;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .please-wait {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
  }
</style>

<div class="container mx-auto px-2 sm:px-4 lg:px-8">
  <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Your Readlist</h2>
  
  {#if isLoading}
    <div class="flex justify-center items-center min-h-[200px]">
      <div class="loading-dots">
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <span class="please-wait">Please wait...</span>
      </div>
    </div>
  {:else}
    <div class="flex flex-col space-y-4 sm:space-y-6">
      {#if readlistBooks.length > 0}
        {#each readlistBooks as book}
          <div class="card">
            <div class="flex flex-row gap-3 sm:gap-6">
              {#if book.coverImage}
                <div class="image-container">
                  <img 
                    src={book.coverImage} 
                    alt="{book.title} cover" 
                    class="cover-image" 
                  />
                </div>
              {/if}
              <div class="flex flex-col space-y-1 sm:space-y-2 flex-1 min-w-0">
                <h3 class="font-semibold text-lg sm:text-xl truncate">{book.title}</h3>
                <p class="text-sm sm:text-base m-0"><strong>By:</strong> {book.author}</p>
                <p class="text-sm sm:text-base m-0"><strong>Genre:</strong> {book.genre}</p>
                <p class="text-sm sm:text-base m-0 line-clamp-3">{book.description}</p>
          
                {#if book.purchaseUrl}
                  <p class="m-0">
                    <a href={book.purchaseUrl} 
                       target="_blank" 
                       class="text-sm sm:text-base text-blue-600 hover:underline block truncate">
                      {book.purchaseUrl}
                    </a>
                  </p>
                {/if}
              </div>
            </div>
      
            <div class="mt-3 sm:mt-4 flex justify-end items-center space-x-2">
              <button 
                class="btn remove flex items-center text-sm sm:text-base" 
                on:click={() => removeFromReadlist(book.id)}
              >
                <CloseCircleSolid class="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                <span class="ml-1">Remove</span>
              </button>
            </div>
          </div>
        {/each}
      {:else}
        <p class="text-center text-gray-500 text-sm sm:text-base">No books in your readlist.</p>
      {/if}
    </div>
  {/if}
</div>  
