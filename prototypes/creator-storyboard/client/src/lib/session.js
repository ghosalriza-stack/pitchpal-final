// The gateway app (Script-experiment-5) signs a creator in and then links here
// with their details in the query string. It runs on a different port, so it
// cannot share localStorage with this app - the URL is the handoff channel.
// Once read, the details are cached here so a refresh keeps you signed in.

const STORAGE_KEY = 'storyboard_studio_creator';

const EMPTY = {
  creatorName: '',
  creatorNiche: '',
  followers: '',
  handle: '',
  fromGateway: false,
};

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const creatorName = params.get('creator') || '';
  const handle = params.get('handle') || '';

  // Only treat it as a handoff if the gateway actually identified someone.
  if (!creatorName && !handle) return null;

  return {
    creatorName,
    handle,
    creatorNiche: params.get('niche') || '',
    followers: params.get('followers') || '',
    fromGateway: true,
  };
}

export function loadSignedInCreator() {
  const fromUrl = readParams();

  if (fromUrl) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      // Storage can be unavailable (private windows, blocked site data); the
      // session still works for this page load.
    }
    // Clear the query string so the details are not left sitting in the address
    // bar or copied into a shared link.
    window.history.replaceState({}, '', window.location.pathname);
    return fromUrl;
  }

  return readStored() || EMPTY;
}

export function signOutCreator() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
