import { Router } from 'express';


const router = Router();

// In-memory cache
let cachedRates: { [key: string]: number } | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

router.get('/rates', async (req, res, next) => {
    try {
        const now = Date.now();

        // Return cached rates if valid
        if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
            return res.json({
                success: true,
                data: cachedRates
            });
        }

        // Fetch new rates (Base: GBP. Targets: USD, EUR)
        const response = await fetch('https://api.frankfurter.app/latest?from=GBP&to=USD,EUR');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as any;

        if (data && data.rates) {
            // Include GBP as 1.0 for reference
            cachedRates = {
                GBP: 1.0,
                ...data.rates
            };
            lastFetchTime = now;

            return res.json({
                success: true,
                data: cachedRates
            });
        } else {
            throw new Error('Invalid response from exchange rate API');
        }
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);

        // If API fails but we have stale cache, return it rather than breaking the site
        if (cachedRates) {
            return res.json({
                success: true,
                data: cachedRates,
                stale: true
            });
        }

        // Absolute fallback if everything fails
        const fallbackRates = {
            GBP: 1.0,
            USD: 1.25,
            EUR: 1.15
        };

        return res.json({
            success: true,
            data: fallbackRates,
            error: 'Using fallback rates due to API failure'
        });
    }
});

export default router;
