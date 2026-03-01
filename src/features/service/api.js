import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const envLabel = baseURL?.includes("localhost") ? "LOCAL" : "PROD";

// Solo log en desarrollo
if (import.meta.env.DEV) {
  console.log(`[API] Conectando a: ${envLabel} -> ${baseURL}`);
}

export const api = axios.create({ baseURL });
