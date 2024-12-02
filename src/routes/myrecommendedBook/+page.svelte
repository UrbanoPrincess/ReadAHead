<script lang="ts">
    import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth, onAuthStateChanged } from 'firebase/auth';
    import { onMount } from 'svelte';
  
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
  </script>
  
  <main>
    <h2 class="text-2xl font-bold mb-4">My Recommended Books</h2>
    {#if loading}
      <p>Loading...</p>
    {:else if userRecommendations.length > 0}
      <ul class="space-y-4">
        {#each userRecommendations as recommendation}
          <li class="p-4 bg-white shadow rounded-lg">
            <h3 class="text-xl font-semibold">{recommendation.title}</h3>
            <p class="text-gray-700">Author: {recommendation.author}</p>
            <p class="text-gray-700">Genre: {recommendation.genre}</p>
            <p class="text-gray-700">Description: {recommendation.description}</p>
            {#if recommendation.coverImage}
              <!-- svelte-ignore a11y_img_redundant_alt -->
              <img src={recommendation.coverImage} alt="Cover Image" class="w-32 h-48 object-cover mt-2" />
            {/if}
            {#if recommendation.purchaseUrl}
              <a href={recommendation.purchaseUrl} target="_blank" class="text-blue-500 hover:underline mt-2 inline-block">view</a>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p>No recommendations found.</p>
    {/if}
  </main>
  
  <style>
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
  