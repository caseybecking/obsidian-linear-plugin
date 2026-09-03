import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            // The obsidian package ships types only; tests run against a small runtime mock.
            obsidian: fileURLToPath(new URL('./tests/mocks/obsidian.ts', import.meta.url))
        }
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.ts']
    }
});
