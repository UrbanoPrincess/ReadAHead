<script lang="ts">
	import '../app.css';
	import { Drawer, CloseButton, Button, Modal } from 'flowbite-svelte';
	import { 
		BarsOutline,
		HomeOutline,
		BookOpenOutline,
		BookmarkOutline,
		CirclePlusOutline,
		ArrowRightToBracketOutline,
		ArrowLeftToBracketOutline,
		
	} from 'flowbite-svelte-icons';
	import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
	import { firebaseConfig } from "$lib/firebaseConfig";
	import { initializeApp, getApps, getApp } from "firebase/app";
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
  
	// Firebase initialization
	const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
	const auth = getAuth(app);
  
	let drawerVisible = false;
	let isAuthenticated = false;
	let showLoginMessage = false; 
	let logoutModalOpen = false;
  
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
	function logoutUser() {
	  logoutModalOpen = false; // Close modal after confirmation
	  signOut(auth)
		.then(() => {
		  isAuthenticated = false;
		  goto('/');
		})
		.catch((error) => {
		  console.error("Error during logout:", error);
		});
	}
  </script>
  <main class="min-h-screen">
	<!-- Header with Logo and Navigation -->
	<header class="fixed top-0 left-0 right-0 z-50">
	  <div class="header-container">
		<div class="flex items-center justify-between w-full">
		  <!-- Logo -->
		  <a href="/" class="logo-container">
			<img 
				src="/images/logo1.png" 
				alt="Logo" 
				class="logo"
			/>
		</a>
		
  
		  <!-- Navigation -->
		  <nav class="nav-container">
			<Button 
			  class="menu-button"
			  on:click={toggleDrawer} 
			  aria-label="Open Navigation"
			>
			  <BarsOutline class="w-6 h-6 text-white hover:text-gray-200" />
			</Button>
		  </nav>
		</div>
	  </div>
	</header>
  
	<!-- Spacer for fixed header -->
	<div class="header-spacer"></div>
  
	{#if drawerVisible}
	<Drawer 
	  hidden={!drawerVisible} 
	  placement="right" 
	  transitionType="fly" 
	  class="drawer-custom"
	>
	  <div class="flex items-center justify-between p-3 sm:p-4 border-b">
		<h5 class="text-lg sm:text-xl font-semibold text-gray-900">Navigation</h5>
		<CloseButton on:click={toggleDrawer} class="dark:text-gray-400" />
	  </div>
  
	  <div class="px-3 sm:px-4 py-2">
		<!-- Home Link -->
		<a 
		  href="/" 
		  class="flex items-center p-2 sm:p-3 text-gray-900 rounded-lg hover:bg-gray-100 group"
		  on:click={toggleDrawer}
		>
		  <HomeOutline class="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
		  <span class="ml-3 text-sm sm:text-base">Home</span>
		</a>
  
		<!-- My Stuff Section -->
		<div class="pt-3 sm:pt-4 pb-2">
		  <div class="flex items-center p-2">
			<span class="text-base sm:text-lg font-semibold text-gray-900">My Stuff</span>
		  </div>
		  
		  <button 
			class="flex items-center w-full p-2 sm:p-3 text-gray-900 rounded-lg hover:bg-gray-100 group"
			on:click={() => handleDrawerClick('/myrecommendedBook')} 
			disabled={!isAuthenticated}
		  >
			<BookOpenOutline class="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
			<span class="ml-3 text-sm sm:text-base">
			  <span class="hidden sm:inline">My Books</span>
			  <span class="sm:hidden">My Books</span>
			</span>
		  </button>
  
		  <button 
			class="flex items-center w-full p-2 sm:p-3 text-gray-900 rounded-lg hover:bg-gray-100 group"
			on:click={() => handleDrawerClick('/recommendBook')} 
			
			disabled={!isAuthenticated}
		  >
			<CirclePlusOutline class="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
			<span class="ml-3 text-sm sm:text-base">
			  <span class="hidden sm:inline">Add Book</span>
			  <span class="sm:hidden">Add Book</span>
			</span>
		  </button>
  
		  <button 
			class="flex items-center w-full p-2 sm:p-3 text-gray-900 rounded-lg hover:bg-gray-100 group"
			on:click={() => handleDrawerClick('/readlist')} 
			disabled={!isAuthenticated}
		  >
			<BookmarkOutline class="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
			<span class="ml-3 text-sm sm:text-base">My Reading List</span>
		  </button>
		</div>
  
		<!-- Account Section -->
		<div class="pt-3 sm:pt-4 pb-2">
		  <div class="flex items-center p-2">
			<span class="text-base sm:text-lg font-semibold text-gray-900">Account</span>
		  </div>
		  
		  {#if isAuthenticated}
			<button 
			  class="flex items-center w-full p-2 sm:p-3 text-gray-900 rounded-lg hover:bg-gray-100 group"
			  on:click={() => logoutModalOpen = true}
			>
			  <ArrowLeftToBracketOutline class="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
			  <span class="ml-3 text-sm sm:text-base">Logout</span>
			</button>
		  {:else}
			<button 
			  class="flex items-center w-full p-2 sm:p-3 text-gray-900 rounded-lg hover:bg-gray-100 group"
			  on:click={() => handleDrawerClick('/login')}
			>
			  <ArrowRightToBracketOutline class="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
			  <span class="ml-3 text-sm sm:text-base">Login</span>
			</button>
		  {/if}
		</div>
	  </div>
	</Drawer>
	{/if}
  
	<!-- Login Message -->
	{#if showLoginMessage}
	  <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
		<p>Please log in to access this section.</p>
	  </div>
	{/if}
  
	<Modal
	  bind:open={logoutModalOpen}
	  size="xs"
	  autoclose
	  class="w-full"
	>
	  <div class="text-center">
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
		  Are you sure you want to logout?
		</h3>
		<div class="flex justify-center gap-4">
		  <Button
			color="red"
			on:click={logoutUser}
		  >
			Yes, I'm sure
		  </Button>
		  <Button
			color="alternative"
			on:click={() => logoutModalOpen = false}
		  >
			No, cancel
		  </Button>
		</div>
	  </div>
	</Modal>
  
	<slot />
  </main>
  
  
  <style>
	/* Header Styles */
	header {
		background-color: #800000;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.header-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 1rem;
	}

	.logo-container {
		display: flex;
		align-items: center;
		transition: opacity 0.2s;
	}

	.logo-container:hover {
		opacity: 0.9;
	}

	.logo {
		height: 40px;
		width: auto;
	}

	.nav-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Menu Button Styles */
	:global(.menu-button) {
		background-color: transparent !important;
		border: none !important;
		padding: 0.5rem !important;
		border-radius: 0.375rem !important;
		transition: background-color 0.2s !important;
	}

	:global(.menu-button:hover) {
		background-color: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.menu-button:focus) {
		outline: 2px solid white !important;
		outline-offset: 2px !important;
	}

	/* Header Spacer */
	.header-spacer {
		height: calc(40px + 1.5rem);
	}

	/* Drawer Backdrop */
	:global(.drawer-backdrop) {
		background-color: rgba(0, 0, 0, 0.5);
	}

	/* Drawer Styles */
	:global(.drawer-custom) {
		width: 280px !important;
	}

	/* Drawer Link Styles */
	
	:global(body) {
	  background-color: #faf1e8;
	}
	

	/* Disabled button styles */
	button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}

	button[disabled]:hover {
		background-color: transparent;
	}

	/* Media Queries */
	@media (min-width: 640px) {
		:global(.drawer-custom) {
			width: 240px !important;
		}

		
	}

	@media (max-width: 640px) {
		.header-container {
			padding: 0.5rem 0.75rem;
		}

		.logo {
			height: 32px;
		}

		:global(.drawer-custom) {
			width: 240px !important;
		}
	}

	@media (max-width: 360px) {
		.header-container {
			padding: 0.5rem;
		}

		.logo {
			height: 28px;
		}

		:global(.drawer-custom) {
			width: 220px !important;
		}

		
	}

	/* Dark Mode Support */
	@media (prefers-color-scheme: dark) {
		header {
			background-color: #800000;
		}

		:global(.menu-button:hover) {
			background-color: rgba(255, 255, 255, 0.05) !important;
		}
	}

	/* Tooltip for mobile */
	@media (max-width: 639px) {
		
	}
</style>