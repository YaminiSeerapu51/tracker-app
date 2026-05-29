export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  socketUrl: import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
  baseUrl: (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace('/api', '')
};
