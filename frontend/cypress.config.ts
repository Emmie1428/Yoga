import { defineConfig } from "cypress";
import registerCodeCoverageTasks from '@cypress/code-coverage/task'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config)
      return config
    },
    baseUrl: 'http://localhost:3000/',
  },
})