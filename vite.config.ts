import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    ssr: {
        noExternal: ["@firebase/analytics"],
    },
    build: {
        chunkSizeWarningLimit: 1000, // Adjust the limit as needed
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['svelte', 'svelte/internal']
                }
            }
        }
    }
});
