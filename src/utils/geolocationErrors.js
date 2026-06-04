export const getGeolocationErrorMessage = (error) => {
  if (!error) return 'Unable to get your location.';

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied. Allow location access in your browser settings, then click Start Tracking again.';
    case error.POSITION_UNAVAILABLE:
      return 'Location unavailable. Check GPS/network and try again.';
    case error.TIMEOUT:
      return 'Location request timed out. Try again in a few seconds.';
    default:
      return error.message || 'Unable to get your location.';
  }
};
