// This file contains configuration constants for the Rail Delay Finder application.
// It is intended to be loaded by the main HTML file (index.html).

// --- API Endpoints ---
const METRICS_URL = 'https://localhost:3000/api/servicemetrics';
const DETAILS_URL = 'https://localhost:3000/api/servicedetails';

// --- Rate Limiting ---
// Time (in milliseconds) to wait between consecutive API calls.
// 1500ms (1.5s) is used to avoid hitting the strict 1 request per second limit (429 errors).
const RATE_LIMIT_DELAY = 1500;
const RETRY_DELAY = 1500;

// --- Calculation Constants ---
// The number of single journeys assumed for an annual season ticket (for refund calculation).
const JOURNEYS_PER_YEAR = 464;
