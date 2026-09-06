// The free fallback image renderer rate-limits concurrent requests: firing all
// of a storyboard's frames at once gets most of them rejected with a 429, so
// only the first frame would ever appear. Everything here funnels image loads
// through a single-file queue with retries so each frame gets its own turn.

const GAP_MS = 900;
const MAX_RETRIES = 3;
// The free renderer draws each new image on demand and regularly takes 40s or
// more, so allow a generous window - but still cap it, otherwise one stuck
// frame would hold up every frame queued behind it.
const TIMEOUT_MS = 90000;

// Tail of the queue. Each new request chains onto it so only one image is in
// flight at a time, in the order frames were requested.
let chain = Promise.resolve();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function preload(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error(`Timed out loading ${url}`));
    }, TIMEOUT_MS);

    const finish = (fn, value) => {
      clearTimeout(timer);
      fn(value);
    };

    img.onload = () => finish(resolve, url);
    img.onerror = () => finish(reject, new Error(`Could not load ${url}`));
    img.src = url;
  });
}

async function attemptLoad(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    // A rejected request can be cached by the browser, so vary the URL on
    // retries to force a genuinely new fetch.
    const target = attempt === 0 ? url : `${url}&retry=${attempt}`;
    try {
      await preload(target);
      return target;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      // Back off before trying again so we are not hammering a limiter.
      await delay(GAP_MS * 2 ** attempt);
    }
  }
  throw new Error(`Could not load ${url}`);
}

export function enqueueImage(url) {
  // Inline images are already in memory - no need to queue or throttle them.
  if (url.startsWith('data:')) return Promise.resolve(url);

  const task = chain.then(async () => {
    const resolved = await attemptLoad(url);
    // Small breather between frames keeps us under the limiter's threshold.
    await delay(GAP_MS);
    return resolved;
  });

  // Keep the chain alive even when a frame ultimately fails, so later frames
  // still get their turn.
  chain = task.then(
    () => undefined,
    () => undefined
  );

  return task;
}
