<script lang="ts">
  import { onMount } from 'svelte';
  import { getFirestore, collection, query, getDocs, orderBy, updateDoc, doc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
  import { firebaseConfig } from "$lib/firebaseConfig";
  import { initializeApp, getApps, getApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getDoc, setDoc } from 'firebase/firestore';

  // Initialize Firebase
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  interface Recommendation {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverImage?: string;
  purchaseUrl?: string;
  createdAt: Date;
  recommendedBy: string;
  likesCount: number;
  addedToReadlist: boolean;
  likedBy: (string | null)[]; // Allow null values in likedBy array
}

let recommendations: Recommendation[] = [];
let currentUserEmail: string | null = null;

// Function to fetch book recommendations
async function fetchRecommendations() {
  try {
    const q = query(collection(db, "recommendedBooks"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    recommendations = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        likedBy: data.likedBy || [],
        likesCount: data.likesCount || 0, // Default to 0 if missing
      } as Recommendation;
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    alert("Failed to fetch recommendations. Please try again later.");
  }
}

// Function to update current user email from Firebase authentication
function updateCurrentUserEmail() {
  currentUserEmail = auth.currentUser?.email || null;
  if (!currentUserEmail) {
    alert("Please log in to interact with the book recommendations.");
  }
}

// Toggle Like Function
async function toggleLike(bookId: string, isLiking: boolean) {
  if (!currentUserEmail) {
    alert("Please log in first!");
    return;
  }

  const bookRef = doc(db, "recommendedBooks", bookId);
  try {
    if (isLiking) {
      await updateDoc(bookRef, {
        likedBy: arrayUnion(currentUserEmail),
        likesCount: increment(1),
      });
    } else {
      await updateDoc(bookRef, {
        likedBy: arrayRemove(currentUserEmail),
        likesCount: increment(-1),
      });
    }

    // Update local state
    recommendations = recommendations.map((rec) =>
      rec.id === bookId
        ? {
            ...rec,
            likedBy: isLiking
              ? [...rec.likedBy, currentUserEmail]
              : rec.likedBy.filter((email) => email !== currentUserEmail),
            likesCount: Math.max(rec.likesCount + (isLiking ? 1 : -1), 0),
          }
        : rec
    );
  } catch (error) {
    console.error("Error toggling like:", error);
    alert("Failed to update likes. Please try again later.");
  }
}

// Add to Readlist Function
// Add to Readlist Function
async function toggleReadlist(bookId: string, currentStatus: boolean) {
  if (!currentUserEmail) {
    alert("Please log in first!");
    return;
  }

  const readlistRef = doc(db, "userReadlists", currentUserEmail);

  try {
    // Check if the user's readlist document exists
    const docSnap = await getDoc(readlistRef);

    if (!docSnap.exists()) {
      // If it doesn't exist, create a new document with an empty array for bookIds
      await setDoc(readlistRef, {
        bookIds: [bookId],
      });
      recommendations = recommendations.map((rec) =>
        rec.id === bookId ? { ...rec, addedToReadlist: true } : rec
      );
      alert("Book added to your readlist!");
    } else {
      // If the document exists, update the bookIds array
      if (!currentStatus) {
        await updateDoc(readlistRef, {
          bookIds: arrayUnion(bookId),
        });

        recommendations = recommendations.map((rec) =>
          rec.id === bookId ? { ...rec, addedToReadlist: true } : rec
        );

        alert("Book added to your readlist!");
      }
    }
  } catch (error) {
    console.error("Error adding book to readlist:", error);
    alert("Failed to add book to the readlist.");
  }
}

onMount(() => {
  updateCurrentUserEmail(); // Update user email on mount
  fetchRecommendations();
});

</script>

<style>
  .btn {
    background-color: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  .btn.liked {
    color: red;
  }
  .btn.unliked {
    color: grey;
  }
  .btn span {
    font-size: 16px;
    font-weight: bold;
    margin-left: 4px;
    color: black;
  }
</style>

<div class="container mx-auto p-8">
  <h2 class="text-3xl font-bold mb-6 text-center">Book Recommendations</h2>
  <div class="flex flex-col space-y-8">
    {#each recommendations as recommendation}
      <div class="card bg-white shadow-lg p-6 rounded-lg w-full">
        <div class="flex items-start space-x-6">
          {#if recommendation.coverImage}
            <img src={recommendation.coverImage} alt="{recommendation.title} cover" class="w-32 h-auto" />
          {/if}
          <div class="flex flex-col space-y-1">
            <h3 class="font-semibold text-2xl">{recommendation.title}</h3>
            <p class="m-0"><strong>Author:</strong> {recommendation.author}</p>
            <p class="m-0"><strong>Genre:</strong> {recommendation.genre}</p>
            <p class="m-0"><strong>Description:</strong> {recommendation.description}</p>
            <p class="m-0"><strong>Recommended By:</strong> {recommendation.recommendedBy}</p>

            {#if recommendation.purchaseUrl}
            <p class="m-0">
              <a href={recommendation.purchaseUrl} target="_blank" class="text-blue-600 hover:underline mt-4 block">
                {recommendation.purchaseUrl.length > 30 ? recommendation.purchaseUrl.slice(0, 30) + '...' : recommendation.purchaseUrl}
              </a>
            </p>
            {/if}

            <div class="mt-6 flex justify-end space-x-4">
              <!-- Like Button -->
              <button
                class="btn {recommendation.likedBy.includes(currentUserEmail) ? 'liked' : 'unliked'}"
                on:click={() => toggleLike(recommendation.id, !recommendation.likedBy.includes(currentUserEmail))}
              >
                {recommendation.likedBy.includes(currentUserEmail) ? "❤️" : "🤍"}
                <span class="ml-1">({recommendation.likesCount || 0})</span>
              </button>
              
              <!-- Add to Readlist Button -->
              <button class="btn" on:click={() => toggleReadlist(recommendation.id, recommendation.addedToReadlist)}>
                {recommendation.addedToReadlist ? '✔️ In Readlist' : '➕ Add to Readlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
