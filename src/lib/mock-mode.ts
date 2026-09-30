// Sample/seed data is only shown when explicitly enabled for local development.
// Production builds never fall back to mock data.
export const MOCK_DATA_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'
