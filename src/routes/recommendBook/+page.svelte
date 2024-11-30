<script lang="ts">
  import { db } from '../firebaseConfig';
  import { collection, addDoc, query, getDocs, orderBy } from "firebase/firestore";

  // Define an interface for the recommendation object
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

  // Define the recommendation array with the Recommendation type
  let recommendations: Recommendation[] = [];

  let title = '';
  let author = '';
  let genre = '';
  let description = '';
  let ISBN = '';
  let publishDate = '';
  let rating = '';
  let coverImage = '';
  let purchaseUrl = '';
  let recommendedBy = '';

  // Function to add a book recommendation to Firestore
  async function addRecommendation() {
    try {
      await addDoc(collection(db, 'recommendedBooks'), {
        title,
        author,
        genre,
        description,
        ISBN,
        publishDate: new Date(publishDate),
        rating: parseFloat(rating),
        coverImage,
        purchaseUrl,
        createdAt: new Date(),
        recommendedBy
      });

      clearForm();
      await fetchRecommendations();
      alert('Recommendation added successfully');
    } catch (error) {
      console.error('Error adding recommendation:', error);
    }
  }

  // Function to fetch all book recommendations from Firestore
  async function fetchRecommendations() {
    const q = query(collection(db, "recommendedBooks"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    recommendations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Recommendation[];
  }

  // Function to clear the form after submission
  function clearForm() {
    title = '';
    author = '';
    genre = '';
    description = '';
    ISBN = '';
    publishDate = '';
    rating = '';
    coverImage = '';
    purchaseUrl = '';
    recommendedBy = '';
  }

  // Fetch recommendations when the component is first mounted
  fetchRecommendations();
</script>

<style>
  /* Add your styles here */
  form {
    margin-bottom: 20px;
  }
  .recommendation {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
  }
</style>

<h2>Add a Book Recommendation</h2>
<form on:submit|preventDefault={addRecommendation}>
  <input type="text" placeholder="Title" bind:value={title} required>
  <input type="text" placeholder="Author" bind:value={author} required>
  <input type="text" placeholder="Genre" bind:value={genre} required>
  <textarea placeholder="Description" bind:value={description} required></textarea>
  <input type="text" placeholder="ISBN" bind:value={ISBN} required>
  <input type="date" placeholder="Publish Date" bind:value={publishDate} required>
  <input type="number" placeholder="Rating" bind:value={rating} step="0.1" required>
  <input type="text" placeholder="Cover Image URL" bind:value={coverImage}>
  <input type="text" placeholder="Purchase URL" bind:value={purchaseUrl}>
  <input type="text" placeholder="Recommended By" bind:value={recommendedBy} required>
  <button type="submit">Add Recommendation</button>
</form>

<h2>Book Recommendations</h2>
{#each recommendations as recommendation}
  <div class="recommendation">
    <h3>{recommendation.title}</h3>
    <p><strong>Author:</strong> {recommendation.author}</p>
    <p><strong>Genre:</strong> {recommendation.genre}</p>
    <p><strong>Description:</strong> {recommendation.description}</p>
    <p><strong>ISBN:</strong> {recommendation.ISBN}</p>
    <p><strong>Publish Date:</strong> {new Date(recommendation.publishDate).toLocaleDateString()}</p>
    <p><strong>Rating:</strong> {recommendation.rating}</p>
    <p><strong>Recommended By:</strong> {recommendation.recommendedBy}</p>
    {#if recommendation.coverImage}
      <p><img src="{recommendation.coverImage}" alt="{recommendation.title} cover" width="100"></p>
    {/if}
    {#if recommendation.purchaseUrl}
      <p><a href="{recommendation.purchaseUrl}" target="_blank">Purchase Link</a></p>
    {/if}
  </div>
{/each}
