export const SESSION_EXPIRED_EVENT = 'tracker:session-expired';

export const emitSessionExpired = (reason = 'Session expired') => {
  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { reason } })
  );
};
