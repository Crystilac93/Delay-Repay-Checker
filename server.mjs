import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';

// --- Configuration ---
// Make sure to replace these with your new credentials
const CONSUMER_KEY = "DKxUSPBIKGI4oGxB9bdHmarNnTLPhbxXE6Ji3QePYdx2TBEU";
// --------------------------------------------------

// API URLs
const METRICS_URL = "https://api1.raildata.org.uk/1010-historical-service-performance-_hsp_v1/api/v1/serviceMetrics";
const DETAILS_URL = "https://api1.raildata.org.uk/1010-historical-service-performance-_hsp_v1/api/v1/serviceDetails";

// Server Port
const PORT = 3000;

// HTTPS Options
const httpsOptions = {
    key: fs.readFileSync('key.pem'), // Assumes key.pem is in the same folder
    cert: fs.readFileSync('cert.pem') // Assumes cert.pem is in the same folder
};

// --- App Setup ---
const app = express();

// Middleware
app.use(cors()); // Allow requests from any origin (replace with specific origin in production)
app.use(express.json()); // Parse JSON bodies

/**
 * Proxy endpoint for /serviceMetrics
 */
app.post('/api/servicemetrics', async (req, res) => {
    console.log("Received request for /api/servicemetrics");

    // --- FIX for 'to_date may not be null' ---
    const payload = req.body;
    if (!payload.to_date && payload.from_date) {
        console.log("Warning: to_date was missing. Setting to from_date.");
        payload.to_date = payload.from_date;
    }
    // --- END FIX ---

    try {
        const apiResponse = await fetch(METRICS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': CONSUMER_KEY // Use x-apikey header
            },
            body: JSON.stringify(payload) // Forward the corrected body
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("ServiceMetrics API Error:", apiResponse.status, data);
            // Forward the error structure from the API
             res.status(apiResponse.status).json(data);
        } else {
            console.log("Successfully fetched metrics from API. Sending to frontend.");
            res.status(200).json(data);
        }

    } catch (error) {
        console.error("Error in /api/servicemetrics proxy:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

/**
 * Proxy endpoint for /serviceDetails
 */
app.post('/api/servicedetails', async (req, res) => {
    console.log(`Received request for /api/servicedetails for RID: ${req.body.rid}`);
    try {
        const apiResponse = await fetch(DETAILS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': CONSUMER_KEY // Use x-apikey header
            },
            body: JSON.stringify(req.body) // Forward the RID from the frontend
        });

        const data = await apiResponse.json(); // Attempt to parse JSON regardless of status

        if (!apiResponse.ok) {
            console.error(`ServiceDetails API Error for RID ${req.body.rid}:`, apiResponse.status, data);
             // Forward the error structure from the API
             res.status(apiResponse.status).json(data);
        } else {
             // --- NEW: Extract reason code ---
            const serviceDetails = data.serviceAttributesDetails;
            if (serviceDetails && serviceDetails.locations) {
                 // We need the original 'to_loc' to find the correct reason code.
                 // Since the server doesn't know it, we'll send the whole locations array
                 // and let the frontend find the reason for its specific arrival station.
                 // No changes needed here, the frontend will handle it.
            }
             // --- End New ---
            console.log(`Successfully fetched details for RID ${req.body.rid}. Sending to frontend.`);
            res.status(200).json(data); // Send full details data back
        }

    } catch (error) {
        console.error(`Error in /api/servicedetails proxy for RID ${req.body.rid}:`, error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// --- Start Server ---
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Rail API proxy server listening on https://localhost:${PORT}`);
});

// Basic error handling for server start
process.on('uncaughtException', (err) => {
  if (err.code === 'ENOENT' && err.path?.includes('.pem')) {
    console.error(`\nFATAL ERROR: Could not find SSL certificate file (${err.path}).`);
    console.error("Please ensure 'key.pem' and 'cert.pem' exist in the same directory as server.mjs.");
    console.error("You may need to generate them using the 'openssl' command.\n");
  } else {
    console.error('Uncaught Exception:', err);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

