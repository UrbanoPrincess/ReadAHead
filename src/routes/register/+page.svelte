<script lang="ts">
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { getAuth } from 'firebase/auth';
  import { Button, Label, Input, Toast } from 'flowbite-svelte';
  import { CheckCircleSolid, EnvelopeSolid, LockSolid, UserSolid } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';

  // Firebase initialization
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  let email = "";
  let password = "";
  let confirmPassword = "";
  let username = "";  // New variable for the username
  let errorMessage = "";
  let showToast = false; // State variable for Toast visibility

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
      showToast = true; // Show the Toast

      // Navigate to home page after 3 seconds
      setTimeout(() => {
        showToast = false; // Hide the Toast
        goto('/'); // Navigate to home page
      }, 3000);

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

<main class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-4 bg-white rounded-xl shadow-lg p-6 sm:p-8">
    <!-- Logo/Brand section -->
    <div class="text-center space-y-1">
      <img 
        class="h-14 w-auto mx-auto" 
        src="images/logo.png" 
        alt="Logo" 
      />
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
      <p class="text-sm text-gray-600">Please fill in the details below</p>
    </div>

    <form on:submit|preventDefault={registerUser} class="space-y-4">
      <!-- Email Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-gray-700" for="email">
          Email Address
        </Label>
        <div class="relative">
          <EnvelopeSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            bind:value={email}
            class="pl-10"
            placeholder="name@example.com"
            required
          />
        </div>
      </div>

      <!-- Username Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-gray-700" for="username">
          Username
        </Label>
        <div class="relative">
          <UserSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="username"
            type="text"
            bind:value={username}
            class="pl-10"
            placeholder="Enter your username"
            required
          />
        </div>
      </div>

      <!-- Password Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-gray-700" for="password">
          Password
        </Label>
        <div class="relative">
          <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type="password"
            bind:value={password}
            class="pl-10"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <!-- Confirm Password Input -->
      <div class="space-y-1">
        <Label class="block text-sm font-medium text-gray-700" for="confirmPassword">
          Confirm Password
        </Label>
        <div class="relative">
          <LockSolid class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            class="pl-10"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <!-- Error Messages -->
      {#if errorMessage}
        <div class="bg-red-50 border-l-4 border-red-500 p-4">
          <p class="text-red-700 text-sm">{errorMessage}</p>
        </div>
      {/if}

      <!-- Register Button -->
      <Button
        type="submit"
        class="w-full"
        color="red"
      >
        Create Account
      </Button>

      <!-- Login Link -->
      <div class="text-center pt-2">
        <span class="text-sm text-gray-600">Already have an account?</span>
        <a href="/login" class="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </div>
    </form>
  </div>
</main>

{#if showToast}
  <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
    <Toast color="green">
      <svelte:fragment slot="icon">
        <CheckCircleSolid class="w-5 h-5" />
        <span class="sr-only">Check icon</span>
      </svelte:fragment>
      registered successfully!
    </Toast>
  </div>
{/if}

<style>
  :global(body) {
    background-color: #faf1e8;
  }
</style>