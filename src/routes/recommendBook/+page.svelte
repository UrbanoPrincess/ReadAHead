<script lang="ts">
  import { Toast } from 'flowbite-svelte';
  import { CheckCircleSolid } from 'flowbite-svelte-icons';
  import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';
  import { Modal, Input, Label, Button } from 'flowbite-svelte';

  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Form variables
  let title = "";
  let author = "";
  let genre = "";
  let description = "";
  let coverImage = "";
  let purchaseUrl = "";
  let recommendedBy = "";

  // Modal and Toast visibility
  let formModalOpen = true;
  let showToast = false;

  // Add recommendation function
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

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "recommendedBooks"), newRecommendation);
      await updateDoc(docRef, { bookId: docRef.id });

      clearForm();
      formModalOpen = false;
      showToast = true; // Show Toast
      setTimeout(() => (showToast = false), 3000); // Hide Toast after 3 seconds
    } catch (error) {
      console.error("Error adding recommendation:", error);
      alert("Failed to add recommendation. Please try again.");
    }
  }

  // Clear form function
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
  <div class="container mx-auto px-2 sm:px-4 lg:px-8 min-h-screen py-4 sm:py-6">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div class="p-3 sm:p-6 space-y-3 sm:space-y-4">
        <h3 class="text-lg sm:text-xl font-medium text-gray-900 dark:text-white text-center">Add Book Recommendation</h3>

        <!-- Form -->
        <form on:submit|preventDefault={addRecommendation} class="space-y-2 sm:space-y-3">
          <div class="space-y-2 sm:space-y-3">
            <Label for="title" class="block text-sm sm:text-base">Title</Label>
            <Input 
              id="title" 
              type="text" 
              class="form-input w-full text-sm sm:text-base" 
              placeholder="Enter book title" 
              bind:value={title} 
              required 
            />

            <Label for="author" class="block text-sm sm:text-base">Author</Label>
            <Input 
              id="author" 
              type="text" 
              class="form-input w-full text-sm sm:text-base" 
              placeholder="Enter author's name" 
              bind:value={author} 
              required 
            />

            <Label for="genre" class="block text-sm sm:text-base">Genre</Label>
            <Input 
              id="genre" 
              type="text" 
              class="form-input w-full text-sm sm:text-base" 
              placeholder="Enter genre" 
              bind:value={genre} 
              required 
            />

            <Label for="description" class="block text-sm sm:text-base">Description</Label>
            <textarea 
              id="description" 
              class="form-textarea w-full p-2 sm:p-3 border border-gray-300 rounded-md text-sm sm:text-base" 
              placeholder="Enter a short description" 
              bind:value={description} 
              required
            ></textarea>

            <Label for="coverImage" class="block text-sm sm:text-base">Cover Image URL</Label>
            <Input 
              id="coverImage" 
              type="text" 
              class="form-input w-full text-sm sm:text-base" 
              placeholder="Enter cover image URL" 
              bind:value={coverImage} 
            />

            <Label for="purchaseUrl" class="block text-sm sm:text-base">Purchase URL</Label>
            <Input 
              id="purchaseUrl" 
              type="text" 
              class="form-input w-full text-sm sm:text-base" 
              placeholder="Enter purchase URL" 
              bind:value={purchaseUrl} 
            />

            <div class="pt-2">
              <Button type="submit" class="w-full sm:w-auto bg-blue-500 text-white">Submit</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  {#if showToast}
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <Toast color="green" class="w-auto">
        <svelte:fragment slot="icon">
          <CheckCircleSolid class="w-5 h-5" />
          <span class="sr-only">Check icon</span>
        </svelte:fragment>
        Recommendation added successfully.
      </Toast>
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .form-textarea {
    resize: vertical;
    min-height: 100px;
    @media (min-width: 640px) {
      min-height: 120px;
    }
  }

  :global(.form-input),
  :global(.form-textarea) {
    font-size: 14px;
    @media (min-width: 640px) {
      font-size: 16px;
    }
  }


</style>
