<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { getAuth } from 'firebase/auth';
    import { Button, Label, Input, Toast } from 'flowbite-svelte';
    import { CheckCircleSolid } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
  
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
  
    let bookId = "";
    let title = "";
    let author = "";
    let genre = "";
    let description = "";
    let coverImage = "";
    let purchaseUrl = "";
    let recommendedBy = "";
    let showToast = false;
  
    function initializeForm(bookData: any) {
      title = bookData.title;
      author = bookData.author;
      genre = bookData.genre;
      description = bookData.description;
      coverImage = bookData.coverImage || "";
      purchaseUrl = bookData.purchaseUrl || "";
      bookId = bookData.bookId;
      recommendedBy = bookData.recommendedBy;
    }
  
    onMount(async () => {
      bookId = $page.params.id;
  
      if (bookId) {
        const bookDoc = await getDoc(doc(db, "recommendedBooks", bookId));
        if (bookDoc.exists()) {
          initializeForm({ ...bookDoc.data(), bookId: bookDoc.id });
        } else {
          console.error("No such document!");
        }
      }
    });
  
    async function saveChanges() {
      try {
        const docRef = doc(db, "recommendedBooks", bookId);
        await updateDoc(docRef, {
          title,
          author,
          genre,
          description,
          coverImage,
          purchaseUrl,
          recommendedBy,
        });
  
        showToast = true;
        setTimeout(() => {
          showToast = false;
          goto('/myrecommendedBook');
        }, 3000);
      } catch (error) {
        console.error("Error updating recommendation:", error);
        alert("Failed to save changes. Please try again.");
      }
    }
  </script>
  
  <main>
    <div class="container mx-auto px-2 sm:px-4 lg:px-8 min-h-screen py-4 sm:py-6">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <div class="p-3 sm:p-6 space-y-3 sm:space-y-4">
          <h3 class="text-lg sm:text-xl font-medium text-gray-900 dark:text-white text-center">
            Edit Book Recommendation
          </h3>
  
          <!-- Form -->
          <form on:submit|preventDefault={saveChanges} class="space-y-2 sm:space-y-3">
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
  
              <div class="pt-2 flex flex-col sm:flex-row justify-between">
                <Button type="submit" class="w-full sm:w-auto bg-blue-500 text-white">Save Changes</Button>
                <Button type="button" class="w-full sm:w-auto bg-gray-500 text-white mt-2 sm:mt-0" on:click={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  
    {#if showToast}
      <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <Toast color="green">
          <svelte:fragment slot="icon">
            <CheckCircleSolid class="w-5 h-5" />
            <span class="sr-only">Check icon</span>
          </svelte:fragment>
          Book recommendation updated successfully!
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
    }
  
    :global(.form-input),
    :global(.form-textarea) {
      font-size: 14px;
    }
  
    @media (min-width: 640px) {
      .form-textarea {
        min-height: 120px;
      }
  
      :global(.form-input),
      :global(.form-textarea) {
        font-size: 16px;
      }
    }
  </style>
  