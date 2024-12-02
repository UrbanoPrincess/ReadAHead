<script lang="ts">
    import { Modal, Button, Label, Input, Checkbox } from 'flowbite-svelte';
    import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { goto } from '$app/navigation';
  
    // Firebase initialization
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
  
    let email = "";
    let password = "";
    let errorMessage = "";
    
  
    // Function to handle login
    async function loginUser() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        goto('./'); // Redirect to home page on successful login
      } catch (error) {
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = "An unknown error occurred";
        }
      }
    }
</script>
  
<main>
  <!-- Modal for Login -->
  <div class="modal-container w-full flex justify-center items-center bg-gray-100 p-6">
    <div class="modal-content max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
  
      <form on:submit|preventDefault={loginUser} class="flex flex-col space-y-6">
        <Label class="space-y-2">
          <span>Email</span>
          <Input type="email" bind:value={email} placeholder="name@company.com" required />
        </Label>
  
        <Label class="space-y-2">
          <span>Your password</span>
          <Input type="password" bind:value={password} placeholder="•••••" required />
        </Label>
  
        <!-- Display Error Message -->
        {#if errorMessage}
          <p class="text-red-500 text-sm">{errorMessage}</p>
        {/if}
  
        <div class="flex items-start">
          <Checkbox>Remember me</Checkbox>
        </div>
  
        <Button type="submit" class="w-full" style="background-color: blue; color: white;">Login</Button>
  
        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
          Not registered? 
          <a href="/register" class="text-primary-700 hover:underline dark:text-primary-500">Create account</a>
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
</style>