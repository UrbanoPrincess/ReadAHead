<script lang="ts">
  import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { onMount } from 'svelte';
  import { TrashBinSolid, EditSolid } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  interface BookRecommendation {
    id?: string;
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
  }

  let userEmail: string = "";
  let userRecommendations: BookRecommendation[] = [];
  let loading: boolean = true;

  onMount(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userEmail = user.email || "Anonymous";
        await fetchUserRecommendations(userEmail);
      } else {
        userEmail = "Anonymous";
        loading = false;
      }
    });
  });

  async function fetchUserRecommendations(email: string): Promise<void> {
    loading = true;
    try {
      const q = query(collection(db, "recommendedBooks"), where("recommendedBy", "==", email));
      const querySnapshot = await getDocs(q);
      userRecommendations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as BookRecommendation)
      }));
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
    }
    loading = false;
  }

  async function deleteRecommendation(id: string | undefined): Promise<void> {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "recommendedBooks", id));
      userRecommendations = userRecommendations.filter(recommendation => recommendation.id !== id);
      console.log("Recommendation deleted successfully");
    } catch (error) {
      console.error("Error deleting recommendation:", error);
    }
  }

  function editRecommendation(id: string | undefined) {
    if (id) {
        goto(`/editrecommendedBook1/${id}`);
    }
}

</script>

<div class="container mx-auto px-1 sm:px-4 lg:px-8 py-4 sm:py-6">
  <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">My Recommended Books</h2>
  {#if loading}
    <div class="loading-dots">
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <p class="please-wait">Please wait...</p>
    </div>
  {:else if userRecommendations.length > 0}
    <div class="grid grid-cols-1 gap-4 sm:gap-6">
      {#each userRecommendations as recommendation}
        <div class="card p-3 sm:p-6 flex flex-col h-full">
          <div class="flex flex-row gap-3 sm:gap-6 flex-grow">
            {#if recommendation.coverImage}
              <div class="image-container">
                <img src={recommendation.coverImage} alt="{recommendation.title} cover" class="cover-image" />
              </div>
            {/if}
            <div class="flex flex-col space-y-1 sm:space-y-2 flex-1 min-w-0">
              <h3 class="font-semibold text-lg sm:text-xl truncate">{recommendation.title}</h3>
              <p class="text-sm sm:text-base m-0"><strong>By:</strong> {recommendation.author}</p>
              <p class="text-sm sm:text-base m-0"><strong>Genre:</strong> {recommendation.genre}</p>
              <p class="text-sm sm:text-base m-0 line-clamp-3"><strong>Description:</strong> {recommendation.description}</p>

              {#if recommendation.purchaseUrl}
              <p class="m-0">
                <a href={recommendation.purchaseUrl} 
                   target="_blank" 
                   class="text-sm sm:text-base text-blue-600 hover:underline block truncate">
                  {recommendation.purchaseUrl}
                </a>
              </p>
              {/if}
            </div>
          </div>
          <div class="flex justify-end mt-auto space-x-2 border-t pt-2">
            <button 
              class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              on:click={() => editRecommendation(recommendation.id)}
              aria-label="Edit recommendation"
            >
              <EditSolid class="w-5 h-5" />
            </button>

            <button 
              class="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              on:click={() => deleteRecommendation(recommendation.id)}
              aria-label="Delete recommendation"
            >
              <TrashBinSolid class="w-5 h-5" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-center">No recommendations found.</p>
  {/if}
</div>

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

  @media (min-width: 640px) {
    .image-container {
      width: 100px;
    }
  }

  @media (min-width: 1024px) {
    .image-container {
      width: 120px;
    }
  }

  .card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 100%;
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


</style>
