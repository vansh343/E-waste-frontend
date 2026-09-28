// Single source of truth for where the backend lives. Change VITE_API_BASE_URL
// in .env — nothing else needs to be touched.
//
// Two URL shapes are supported:
//
//   VITE_API_BASE_URL set
//     Calls go straight to the backend, cross-origin. The browser sends
//     credentials, so the backend must allow this origin via CORS and must
//     issue SameSite=None; Secure cookies.
//
//   VITE_API_BASE_URL empty
//     Requests stay relative and are resolved by the Vite dev proxy in
//     vite.config.js, which strips the /api prefix. Same-origin, so no CORS
//     and the cookie can stay SameSite=Lax.
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE = RAW_BASE.replace(/\/+$/, '');

export const CROSS_ORIGIN = API_BASE !== '';

// The dev proxy strips a leading /api, but a direct call must NOT send it —
// the backend serves these routes from the root context path.
export const API_PREFIX = CROSS_ORIGIN ? API_BASE : '/api';

// No rewrite is applied to the /ws proxy, so both shapes keep the same path.
export const WS_URL = CROSS_ORIGIN ? `${API_BASE}/ws` : '/ws';
