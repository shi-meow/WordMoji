import { defineConfig } from 'vite';

export default defineConfig({
  base: '/new-game-project/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        game: 'game.html'
      }
    }
  }
});