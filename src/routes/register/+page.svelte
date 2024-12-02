<script lang="ts">
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { getAuth } from 'firebase/auth';
  import { Button, Label, Input } from 'flowbite-svelte';

  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  let email = "";
  let password = "";
  let confirmPassword = "";
  let username = "";  // New variable for the username
  let errorMessage = "";
  let successMessage = "";

  // Validation function
  function isEmailValid(email: string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  async function registerUser() {
    if (!isEmailValid(email)) {
      errorMessage = "Please enter a valid email address.";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = "Passwords do not match!";
      return;
    }

    // Firebase authentication logic
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user to Firestore (including username)
      await addDoc(collection(db, "users"), {
        email,
        username,  // Save the username
        createdAt: new Date(),
        uid: user.uid,
      });

      // Clear the form and provide feedback
      email = "";
      password = "";
      confirmPassword = "";
      username = ""; 
      errorMessage = "";
      successMessage = "User registered successfully!";
    } catch (error: unknown) {
      console.error("Error during registration:", error);

      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = "This email is already in use. Please use a different email.";
        } else if (error.message.includes('weak-password')) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = "An unknown error occurred.";
      }
    }
  }
</script>

<!-- Register Form Modal -->
<div class="modal-container w-full flex justify-center items-center bg-gray-100 p-6">
  <div class="modal-content max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
    <h3 class="text-xl font-medium text-gray-900 dark:text-white">Register on our platform</h3>
    <form on:submit|preventDefault={registerUser} class="flex flex-col space-y-6">
      <Label class="space-y-2">
        <span>Email</span>
        <Input type="email" bind:value={email} placeholder="name@company.com" required />
      </Label>
      <Label class="space-y-2">
        <span>Username</span> <!-- New username field -->
        <Input type="text" bind:value={username} placeholder="Enter your username" required />
      </Label>
      <Label class="space-y-2">
        <span>Create password</span>
        <Input type="password" bind:value={password} placeholder="•••••" required />
      </Label>
      <Label class="space-y-2">
        <span>Confirm password</span>
        <Input type="password" bind:value={confirmPassword} placeholder="•••••" required />
      </Label>
      
      {#if errorMessage}
        <p class="text-red-500 text-sm">{errorMessage}</p>
      {/if}

      {#if successMessage}
        <p class="text-green-500 text-sm">{successMessage}</p>
      {/if}
      
      <Button type="submit" class="w-full" style="background-color: blue; color: white;">Register</Button>

      <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
        Already have an account? <a href="/login" class="text-primary-700 hover:underline dark:text-primary-500">Sign in</a>
      </div>
    </form>
  </div>
</div>
<style>
  .modal-container {
  background-color: transparent; /* Set modal container background to transparent */
     }

  .modal-content {
  background-color: white; /* Keep modal content white */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  </style>