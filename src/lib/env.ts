/**
 * Centralized environment variable configuration.
 * Using process.env for Gemini (as required) and default values for public keys.
 */

// Google Maps API Key provided by user
// This is injected by Vite's define in vite.config.ts
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || 'AIzaSyDNEYu5SM2Elb2vqv33U_Pehp33QIg1iB8';

export const ENV = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GOOGLE_MAPS_PLATFORM_KEY: GOOGLE_MAPS_KEY,
  IS_PROD: import.meta.env.PROD,
};
