<script lang="ts">
  import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from 'firebase/auth';  // Import Firebase Auth
  import { Modal, Input, Label, Button } from 'flowbite-svelte';  // Import Flowbite components

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);  // Initialize Firebase Auth

  let title = "";
  let author = "";
  let genre = "";
  let description = "";
  let coverImage = "";
  let purchaseUrl = "";
  let recommendedBy = "";

  let formModalOpen = true;  // Open the modal automatically on page load

  // Add a book recommendation to Firestore
  async function addRecommendation() {
    try {
      // Get the user's email from Firebase Authentication
      const user = auth.currentUser;
      if (user) {
        recommendedBy = user.email || "Unknown";  // If no email, set to "Unknown"
      } else {
        recommendedBy = "Anonymous";  // Fallback if no user is signed in
      }

      const newRecommendation = {
        title,
        author,
        genre,
        description,
        coverImage: coverImage || undefined,
        purchaseUrl: purchaseUrl || undefined,
        createdAt: new Date(),
        recommendedBy, // Use the email automatically here
        likesCount: 0,  // Initial likes count
        addedToReadlist: false,  // Initial readlist status
      };

      // Add the new book recommendation to Firestore
      const docRef = await addDoc(collection(db, "recommendedBooks"), newRecommendation);

      // Get the newly added document's ID
      const bookId = docRef.id;

      // Optionally, you can update the Firestore document with the bookId if needed
      await updateDoc(docRef, {
        bookId: bookId,  // Store the book ID in the document itself
      });

      // Clear form after successful submission
      clearForm();
      formModalOpen = false;  // Close the modal after successful submission
      alert("Recommendation added successfully!");
    } catch (error) {
      console.error("Error adding recommendation:", error);
      alert("Failed to add recommendation. Please try again.");
    }
  }

  // Clear the form inputs
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
  <!-- Modal for adding book recommendation -->
  <div class="modal-container w-full flex justify-center items-center bg-gray-100 p-6">
    <div class="modal-content max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">Add a Book Recommendation</h3>
  
      <form on:submit|preventDefault={addRecommendation} class="space-y-4">
        <div class="space-y-4">
          <div>
            <Label for="title" class="block">Title</Label>
            <Input id="title" type="text" class="form-input w-full" placeholder="Enter book title" bind:value={title} required />
          </div>

          <div>
            <Label for="author" class="block">Author</Label>
            <Input id="author" type="text" class="form-input w-full" placeholder="Enter author's name" bind:value={author} required />
          </div>

          <div>
            <Label for="genre" class="block">Genre</Label>
            <Input id="genre" type="text" class="form-input w-full" placeholder="Enter genre" bind:value={genre} required />
          </div>

          <!-- Custom description textarea with Flowbite styling -->
          <div>
            <Label for="description" class="block">Description</Label>
            <textarea id="description" class="form-textarea w-full p-3 border border-gray-300 rounded-md" placeholder="Enter a short description" bind:value={description} required></textarea>
          </div>

          <div>
            <Label for="coverImage" class="block">Cover Image URL</Label>
            <Input id="coverImage" type="text" class="form-input w-full" placeholder="Enter cover image URL" bind:value={coverImage} />
          </div>

          <div>
            <Label for="purchaseUrl" class="block">Purchase URL</Label>
            <Input id="purchaseUrl" type="text" class="form-input w-full" placeholder="Enter purchase URL" bind:value={purchaseUrl} />
          </div>

        <div class="space-x-4">
          <Button type="submit" class="bg-blue-500 text-white">Submit</Button>
        </div>
      </form>
    </div>
  </div>
</main>

<style>
    .modal-container {
      background-color: transparent; /* Set modal container background to transparent */
    }

    .modal-content {
      background-color: white; /* Keep modal content white */
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Customize textarea styling */
    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }
</style>
