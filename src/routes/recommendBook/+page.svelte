<script lang="ts">
  import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';
  import { Modal, Input, Label, Button } from 'flowbite-svelte';

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  let title = "";
  let author = "";
  let genre = "";
  let description = "";
  let coverImage = "";
  let purchaseUrl = "";
  let recommendedBy = "";

  let formModalOpen = true;

  async function addRecommendation() {
    try {
      const user = auth.currentUser;
      recommendedBy = user ? user.email || "Unknown" : "Anonymous";

      const newRecommendation = {
        title,
        author,
        genre,
        description,
        coverImage: coverImage || undefined,
        purchaseUrl: purchaseUrl || undefined,
        createdAt: new Date(),
        recommendedBy,
        likesCount: 0,
        addedToReadlist: false,
      };

      const docRef = await addDoc(collection(db, "recommendedBooks"), newRecommendation);
      await updateDoc(docRef, { bookId: docRef.id });

      clearForm();
      formModalOpen = false;
      alert("Recommendation added successfully!");
    } catch (error) {
      console.error("Error adding recommendation:", error);
      alert("Failed to add recommendation. Please try again.");
    }
  }

  function clearForm() {
    title = "";
    author = "";
    genre = "";
    description = "";
    coverImage = "";
    purchaseUrl = "";
    recommendedBy = "";
  }
</script>

<main>
  <div class="modal-container w-full flex justify-center items-center bg-gray-100 p-6">
    <div class="modal-content max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">Add a Book Recommendation</h3>
  
      <form on:submit|preventDefault={addRecommendation} class="space-y-2">
        <div class="space-y-2">
          <Label for="title" class="block">Title</Label>
          <Input id="title" type="text" class="form-input w-full" placeholder="Enter book title" bind:value={title} required />

          <Label for="author" class="block">Author</Label>
          <Input id="author" type="text" class="form-input w-full" placeholder="Enter author's name" bind:value={author} required />

          <Label for="genre" class="block">Genre</Label>
          <Input id="genre" type="text" class="form-input w-full" placeholder="Enter genre" bind:value={genre} required />

          <Label for="description" class="block">Description</Label>
          <textarea id="description" class="form-textarea w-full p-3 border border-gray-300 rounded-md" placeholder="Enter a short description" bind:value={description} required></textarea>

          <Label for="coverImage" class="block">Cover Image URL</Label>
          <Input id="coverImage" type="text" class="form-input w-full" placeholder="Enter cover image URL" bind:value={coverImage} />

          <Label for="purchaseUrl" class="block">Purchase URL</Label>
          <Input id="purchaseUrl" type="text" class="form-input w-full" placeholder="Enter purchase URL" bind:value={purchaseUrl} />

          <div class="space-x-4">
            <Button type="submit" class="bg-blue-500 text-white">Submit</Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</main>

<style>
  .modal-container {
    background-color: transparent;
  }
  .modal-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .form-textarea {
    resize: vertical;
    min-height: 120px;
  }
  .space-y-2 > *:not(:last-child) {
    margin-bottom: 0.5rem; /* Reduce the spacing between form elements */
  }
</style>
