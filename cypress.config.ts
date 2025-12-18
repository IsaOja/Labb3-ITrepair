import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      on('dev-server:start', async (options) => {
        // Start a Vite dev server programmatically and return an object Cypress understands.
        const { createServer } = await import('vite');
        const reactPlugin = (await import('@vitejs/plugin-react')).default;

        const server = await createServer({
          root: process.cwd(),
          configFile: false,
          plugins: [reactPlugin()],
          server: { port: 5173 },
        });

        await server.listen();
        const port = server.config.server && (server.config.server as any).port || 5173;

        return {
          port,
          close: async () => {
            await server.close();
          },
        };
      });
      return config;
    },
  },
});
