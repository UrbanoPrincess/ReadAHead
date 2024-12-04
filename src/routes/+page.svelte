<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore, collection, query, getDocs, orderBy, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc, setDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { HeartSolid, CirclePlusSolid, CheckCircleSolid } from 'flowbite-svelte-icons';
  import { onAuthStateChanged } from "firebase/auth";
  import { Modal } from 'flowbite-svelte';

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  interface Recommendation {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    coverImage?: string;
    purchaseUrl?: string;
    createdAt: Date;
    recommendedBy: string;
    likesCount: number;
    addedToReadlist: boolean;
    likedBy: (string | null)[]; 
  }

  let recommendations: Recommendation[] = [];
  let currentUserEmail: string | null = null;
  let isLoading = true;
  let isModalOpen = false;
  let modalMessage = '';

  onMount(async () => {
    updateCurrentUserEmail();
    await fetchRecommendations();
    isLoading = false;
  });

  function updateCurrentUserEmail() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUserEmail = user.email;
      } else {
        currentUserEmail = null;
      }
    });
  }

  async function fetchRecommendations() {
    try {
      const q = query(collection(db, "recommendedBooks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const readlistDocSnap = currentUserEmail
        ? await getDoc(doc(db, "userReadlists", currentUserEmail))
        : null;
      const userReadlist = readlistDocSnap?.exists() ? readlistDocSnap.data().bookIds || [] : [];

      recommendations = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          likedBy: data.likedBy || [],
          likesCount: data.likesCount || 0,
          addedToReadlist: userReadlist.includes(doc.id), // Check if the book is in the user's readlist
        } as Recommendation;
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      showAlert("Failed to fetch recommendations. Please try again later.");
    }
  }

  function showAlert(message: string) {
    modalMessage = message;
    isModalOpen = true;

    // Close the alert after 3 seconds
    setTimeout(() => {
        isModalOpen = false;
    }, 3000);
  }

  async function toggleLike(bookId: string, isLiking: boolean) {
    if (!currentUserEmail) {
      showAlert("Please log in first!");
      return;
    }

    const bookRef = doc(db, "recommendedBooks", bookId);
    try {
      // Get current book data first
      const bookSnap = await getDoc(bookRef);
      const currentLikes = bookSnap.data()?.likesCount || 0;

      // Check if unliking would result in negative likes
      if (!isLiking && currentLikes <= 0) {
        return; // Don't proceed if unliking would make likes negative
      }

      await updateDoc(bookRef, {
        likedBy: isLiking ? arrayUnion(currentUserEmail) : arrayRemove(currentUserEmail),
        likesCount: increment(isLiking ? 1 : -1),
      });

      // Update local state
      recommendations = recommendations.map((rec) =>
        rec.id === bookId
          ? {
              ...rec,
              likedBy: isLiking
                ? [...rec.likedBy, currentUserEmail]
                : rec.likedBy.filter((email) => email !== currentUserEmail),
              likesCount: Math.max(0, rec.likesCount + (isLiking ? 1 : -1)), // Ensure likesCount never goes below 0
            }
          : rec
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      showAlert("Failed to update likes. Please try again later.");
    }
  }

  async function toggleReadlist(bookId: string, currentStatus: boolean) {
    if (!currentUserEmail) {
      showAlert("Please log in first!");
      return;
    }

    const readlistRef = doc(db, "userReadlists", currentUserEmail);

    try {
      if (!currentStatus) {
        await updateDoc(readlistRef, {
          bookIds: arrayUnion(bookId),
        });
        recommendations = recommendations.map((rec) =>
          rec.id === bookId ? { ...rec, addedToReadlist: true } : rec
        );
        
      } else {
        await updateDoc(readlistRef, {
          bookIds: arrayRemove(bookId),
        });
        recommendations = recommendations.map((rec) =>
          rec.id === bookId ? { ...rec, addedToReadlist: false } : rec
        );
        
      }
    } catch (error) {
      console.error("Error toggling readlist:", error);
      showAlert("Failed to update readlist. Please try again later.");
    }
  }
</script>

<Modal open={isModalOpen} on:close={() => isModalOpen = false}>
  <div class="p-4">
    <h2 class="text-lg font-bold">Hi there!</h2>
    <p class="text-sm sm:text-base">{modalMessage}</p> <!-- Adjusted text size -->
    <div class="mt-4">
    </div>
  </div>
</Modal>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .image-container {
    flex-shrink: 0;
    width: 80px;
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
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 12px;
  }

  .btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  @media (min-width: 640px) {
    .image-container {
      width: 100px;
    }

    .card {
      padding: 16px;
    }
  }

  @media (min-width: 1024px) {
    .image-container {
      width: 120px;
    }
  }

  .loading-dots {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
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

{#if isLoading}
  <div class="loading-dots">
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <p class="please-wait">Please wait...</p>
  </div>
{:else}
  <div class="container mx-auto px-1 sm:px-4 lg:px-8 py-4 sm:py-6">
    <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center">Book Recommendations</h2>
    <div class="flex flex-col space-y-4 sm:space-y-6">
      {#each recommendations as recommendation}
        <div class="card px-2 sm:px-4">
          <div class="flex flex-col h-full">
            <!-- Content Section -->
            <div class="flex flex-row gap-3 sm:gap-6 flex-grow">
              {#if recommendation.coverImage}
                <div class="image-container">
                  <img 
                    src={recommendation.coverImage} 
                    alt="{recommendation.title} cover" 
                    class="cover-image" 
                  />
                </div>
              {/if}
              <div class="flex flex-col space-y-1 sm:space-y-2 flex-1 min-w-0">
                <h3 class="font-semibold text-[13px] sm:text-lg lg:text-xl truncate">{recommendation.title}</h3>
                <p class="text-[11px] sm:text-sm lg:text-base m-0 truncate"><strong>By:</strong> {recommendation.author}</p>
                <p class="text-[11px] sm:text-sm lg:text-base m-0 truncate"><strong>Genre:</strong> {recommendation.genre}</p>
                <p class="text-[11px] sm:text-sm lg:text-base m-0 line-clamp-2 sm:line-clamp-3">{recommendation.description}</p>
                <p class="text-[11px] sm:text-sm lg:text-base m-0 truncate"><strong>Recommended By:</strong> {recommendation.recommendedBy}</p>
                
                {#if recommendation.purchaseUrl}
                  <p class="m-0">
                    <a href={recommendation.purchaseUrl} 
                       target="_blank" 
                       class="text-[11px] sm:text-sm lg:text-base text-blue-600 hover:underline block truncate">
                      {recommendation.purchaseUrl}
                    </a>
                  </p>
                {/if}
              </div>
            </div>

            <!-- Buttons Section -->
            <div class="mt-3 sm:mt-4 flex justify-end items-center space-x-3 sm:space-x-4 pt-2 border-t">
              <!-- Like Button -->
              <button
                class="btn flex items-center"
                on:click={() => toggleLike(recommendation.id, !recommendation.likedBy.includes(currentUserEmail))}
              >
                {#if recommendation.likedBy.includes(currentUserEmail)}
                  <HeartSolid class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-500" />
                {:else}
                  <HeartSolid class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-500" />
                {/if}
                <span class="ml-1 text-xs sm:text-sm lg:text-base">{recommendation.likesCount}</span>
              </button>

              <!-- Add to Readlist Button -->
              <button
                class="btn flex items-center"
                on:click={() => toggleReadlist(recommendation.id, recommendation.addedToReadlist)}
              >
                {#if recommendation.addedToReadlist}
                  <CheckCircleSolid class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-500" />
                  <span class="ml-1 text-xs sm:text-sm lg:text-base">In Readlist</span>
                {:else}
                  <CirclePlusSolid class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-500" />
                  <span class="ml-1 text-xs sm:text-sm lg:text-base">Add to Readlist</span>
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
