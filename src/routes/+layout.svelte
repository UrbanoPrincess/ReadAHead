<script lang="ts">
	import '../app.css';
	import { Drawer, CloseButton, Button } from 'flowbite-svelte';
	import { BarsOutline } from 'flowbite-svelte-icons';
	import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
	import { firebaseConfig } from "$lib/firebaseConfig";
	import { initializeApp, getApps, getApp } from "firebase/app";
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
  
	// Firebase initialization
	const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
	const auth = getAuth(app);
  
	let email = "";
	let password = "";
	let errorMessage = "";
	let drawerVisible = false;
	let isAuthenticated = false;
	let showLoginMessage = false;  // Variable for showing login message
  
	// Check authentication state
	onMount(() => {
	  onAuthStateChanged(auth, (user) => {
		if (user) {
		  isAuthenticated = true;
		} else {
		  isAuthenticated = false;
		}
	  });
	});
  
	// Function to toggle the drawer
	function toggleDrawer() {
	  drawerVisible = !drawerVisible;
	}
  
	// Function to handle drawer link clicks
	function handleDrawerClick(path: string) {
	  if (!isAuthenticated && path !== '/login') {
		showLoginMessage = true;  // Show login message if not authenticated
		setTimeout(() => {
		  showLoginMessage = false;  // Hide the message after a short time
		}, 3000);
	  } else {
		goto(path); // Navigate to the specified path
	  }
	}
  
	// Function to logout
	function logoutUser() { if (confirm("Are you sure you want to logout?")) 
	{ signOut(auth).then(() => { isAuthenticated = false; goto('/'); }).catch((error) => { console.error("Error during logout:", error); }); } }
  </script>
  <main>
	<!-- Header with Logo and Navigation -->
	<header>
	  <a href="./">
		<img src="images/logo1.png" alt="Logo" class="logo" />
	  </a>
  
	  <nav class="tabs">
		<Button on:click={toggleDrawer} aria-label="Open Navigation">
		  <BarsOutline class="w-6 h-6" />
		</Button>
	  </nav>
	</header>
  
	{#if drawerVisible}
	<Drawer hidden={!drawerVisible} placement="right" transitionType="fly">
	  <div class="flex items-center justify-between p-4" style="color: black;">
		<CloseButton on:click={toggleDrawer} />
	  </div>
	  <ul>
		<li>
		  <h5 style="font-weight: bold; color: black; margin-top: 10px; text-align: center;">My Stuff</h5>
		  <ul>
			<!-- These buttons are always visible, but only clickable if authenticated -->
			<li><button style="color: black;" on:click={() => handleDrawerClick('/myrecommendedBook')} disabled={!isAuthenticated}>My Book Recommendations</button></li>
			<li><button style="color: black;" on:click={() => handleDrawerClick('/recommendBook')} disabled={!isAuthenticated}>Add Book Recommendations</button></li>
			<li><button style="color: black;" on:click={() => handleDrawerClick('/readlist')} disabled={!isAuthenticated}>My Reading List</button></li>
		  </ul>
		</li>
		<li>
		  <h5 style="font-weight: bold; color: black; margin-top: 10px; text-align: center;">Account</h5>
		  <ul>
			{#if isAuthenticated}
			  <!-- When authenticated, show Logout -->
			  <li><Button on:click={logoutUser} style="color: black;">Logout</Button></li>
			{:else}
			  <!-- When not authenticated, show Login and make it clickable -->
			  <li><button style="color: black;" on:click={() => handleDrawerClick('/login')}>Login</button></li>
			{/if}
		  </ul>
		</li>
	  </ul>
	</Drawer>
	{/if}
  
	<!-- Display Login Message if the user is not authenticated and clicks the restricted button -->
	{#if showLoginMessage}
	  <div class="login-message" style="text-align: center; color: red;">
		<p>Please log in to access this section.</p>
	  </div>
	{/if}
  
	<slot />
  </main>
  
  
  <style>
	header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  background-color: #800000;
	  padding: 15px;
	  flex-wrap: wrap;
	}
  
	.logo {
	  height: 40px;
	  cursor: pointer;
	}
  
	nav.tabs {
	  display: flex;
	  flex-wrap: wrap;
	  margin-left: auto;
	}
  
	.login-message {
	  background-color: #fdd;
	  padding: 15px;
	  margin-top: 20px;
	  border: 1px solid red;
	  border-radius: 5px;
	}
  
	:global(body) {
	  background-color: #faf1e8;
	}
  
	@media (max-width: 500px) {
	  header {
		flex-direction: column;
		align-items: flex-start;
	  }
	}
  </style>
  