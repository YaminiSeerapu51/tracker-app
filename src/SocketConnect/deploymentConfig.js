const trimSlash = (url) => url.trim().replace(/\/+$/, '');

/** Ensures API base ends with /api (Vercel env often omits or duplicates it). */
export const normalizeApiUrl = (raw) => {
  if (!raw) return null;
  let url = trimSlash(raw);
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

/** Socket URL must be origin only — no /api suffix. */
export const normalizeSocketUrl = (raw) => {
  if (!raw) return null;
  return trimSlash(raw).replace(/\/api$/i, '');
};

const isLocalhost = (url) => /localhost|127\.0\.0\.1/i.test(url || '');

const validateUrls = (apiUrl, socketUrl) => {
  const errors = [];

  if (!apiUrl) {
    errors.push('VITE_API_URL is missing.');
  }
  if (!socketUrl) {
    errors.push('VITE_SOCKET_URL is missing.');
  }

  if (import.meta.env.PROD) {
    if (isLocalhost(apiUrl)) {
      errors.push('VITE_API_URL points to localhost. Use your Railway backend URL.');
    }
    if (isLocalhost(socketUrl)) {
      errors.push('VITE_SOCKET_URL points to localhost. Use your Railway backend URL.');
    }
    if (apiUrl && socketUrl && !apiUrl.startsWith('https://')) {
      errors.push('VITE_API_URL must use HTTPS in production.');
    }
    if (socketUrl && !socketUrl.startsWith('https://') && !socketUrl.startsWith('ws')) {
      errors.push('VITE_SOCKET_URL must use HTTPS in production.');
    }
  }

  if (apiUrl && socketUrl) {
    const apiOrigin = apiUrl.replace(/\/api$/i, '');
    if (apiOrigin !== socketUrl) {
      errors.push(
        `API and socket origins do not match (API: ${apiOrigin}, Socket: ${socketUrl}). ` +
          'Use the same Railway host; API URL should end with /api.'
      );
    }
  }

  return errors;
};

const rawApi = import.meta.env.VITE_API_URL;
const rawSocket = import.meta.env.VITE_SOCKET_URL;

const apiUrl = normalizeApiUrl(rawApi || (import.meta.env.DEV ? 'http://localhost:3000' : ''));
const socketUrl = normalizeSocketUrl(rawSocket || (import.meta.env.DEV ? 'http://localhost:3000' : ''));

const configErrors = import.meta.env.PROD ? validateUrls(apiUrl, socketUrl) : [];

export const deploymentConfig = {
  apiUrl,
  socketUrl,
  isValid: configErrors.length === 0,
  errors: configErrors,
  isProduction: import.meta.env.PROD,
};

export const config = {
  apiUrl: deploymentConfig.apiUrl,
  socketUrl: deploymentConfig.socketUrl,
};

if (import.meta.env.DEV) {
  console.info('[config] API:', config.apiUrl, '| Socket:', config.socketUrl);
}
