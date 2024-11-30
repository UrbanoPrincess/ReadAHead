<script lang="ts">
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { getFirestore, collection, addDoc, query, getDocs, orderBy } from "firebase/firestore";

  // Initialize Firebase app
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);

  interface Recommendation {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    ISBN: string;
    publishDate: Date;
    rating: number;
    coverImage?: string;
    purchaseUrl?: string;
    createdAt: Date;
    recommendedBy: string;
  }

  let recommendations: Recommendation[] = [];
  let title = "";
  let author = "";
  let genre = "";
  let description = "";
  let ISBN = "";
  let publishDate = "";
  let rating = "";
  let coverImage = "";
  let purchaseUrl = "";
  let recommendedBy = "";

  // Add a book recommendation to Firestore
  async function addRecommendation() {
    try {
      const newRecommendation = {
        title,
        author,
        genre,
        description,
        ISBN,
        publishDate: new Date(publishDate),
        rating: parseFloat(rating),
        coverImage: coverImage || undefined,
        purchaseUrl: purchaseUrl || undefined,
        createdAt: new Date(),
        recommendedBy,
      };

      await addDoc(collection(db, "recommendedBooks"), newRecommendation);
      clearForm();
      await fetchRecommendations();
      alert("Recommendation added successfully!");
    } catch (error) {
      console.error("Error adding recommendation:", error);
      alert("Failed to add recommendation. Please try again.");
    }
  }

  // Fetch all book recommendations from Firestore
  async function fetchRecommendations() {
    try {
      const q = query(collection(db, "recommendedBooks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      recommendations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Recommendation[];
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to fetch recommendations. Please try again later.");
    }
  }

  // Clear the form inputs
  function clearForm() {
    title = "";
    author = "";
    genre = "";
    description = "";
    ISBN = "";
    publishDate = "";
    rating = "";
    coverImage = "";
    purchaseUrl = "";
    recommendedBy = "";
  }

  // Fetch recommendations on component mount
  fetchRecommendations();
</script>

<div class="container mx-auto p-8">
  <h2 class="text-2xl font-bold mb-6 text-center">Add a Book Recommendation</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Form Card -->
    <div class="card bg-white shadow-md p-6 rounded-lg">
      <form on:submit|preventDefault={addRecommendation} class="space-y-4">
        <div class="container space-y-4">
          <input type="text" class="form-input w-full" placeholder="Title" bind:value={title} required>
          <input type="text" class="form-input w-full" placeholder="Author" bind:value={author} required>
          <input type="text" class="form-input w-full" placeholder="Genre" bind:value={genre} required>
          <textarea class="form-input w-full" placeholder="Description" bind:value={description} required></textarea>
          <input type="text" class="form-input w-full" placeholder="ISBN" bind:value={ISBN} required>
          <input type="date" class="form-input w-full" placeholder="Publish Date" bind:value={publishDate} required>
          <input type="number" class="form-input w-full" placeholder="Rating" bind:value={rating} step="0.1" required>
          <input type="text" class="form-input w-full" placeholder="Cover Image URL" bind:value={coverImage}>
          <input type="text" class="form-input w-full" placeholder="Purchase URL" bind:value={purchaseUrl}>
          <input type="text" class="form-input w-full" placeholder="Recommended By" bind:value={recommendedBy} required>
        </div>
        <button type="submit" class="btn btn-primary w-full">Add Recommendation</button>
      </form>
    </div>
    <!-- Recommendations Card -->
    <div class="card bg-white shadow-md p-6 rounded-lg">
      <h2 class="text-2xl font-bold mb-4">Book Recommendations</h2>
      {#each recommendations as recommendation}
        <div class="card border border-gray-200 p-4 rounded-md mb-4">
          <h3 class="font-semibold text-lg">{recommendation.title}</h3>
          <p><strong>Author:</strong> {recommendation.author}</p>
          <p><strong>Genre:</strong> {recommendation.genre}</p>
          <p><strong>Description:</strong> {recommendation.description}</p>
          <p><strong>ISBN:</strong> {recommendation.ISBN}</p>
          <p><strong>Publish Date:</strong> {new Date(recommendation.publishDate).toLocaleDateString()}</p>
          <p><strong>Rating:</strong> {recommendation.rating}</p>
          <p><strong>Recommended By:</strong> {recommendation.recommendedBy}</p>
          {#if recommendation.coverImage}
            <img src="{recommendation.coverImage}" alt="{recommendation.title} cover" class="w-20 h-auto mt-2">
          {/if}
          {#if recommendation.purchaseUrl}
            <p><a href="{recommendation.purchaseUrl}" target="_blank" class="text-blue-600 hover:underline">Purchase Link</a></p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
