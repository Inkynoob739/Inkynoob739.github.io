// Replace with your own API key, restricted to your GitHub Pages domain
// (Google Cloud Console → Credentials → API key → HTTP referrer restrictions)
const YOUTUBE_API_KEY = 'AIzaSyDKplaEm3XmZ20f_XCiVuX9khL3dHNcB6E';

const form = document.getElementById('yt-form');
const input = document.getElementById('yt-query');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const placeholder = document.getElementById('screen-placeholder');
const playerWrap = document.getElementById('player-wrap');
const player = document.getElementById('player');
const nowPlaying = document.getElementById('now-playing');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  resultsEl.innerHTML = '';
  statusEl.textContent = 'Searching…';

  try {
    const results = await searchVideos(query);
    renderResults(results);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Something went wrong. Check your API key and quota, then try again.';
  }
});

async function searchVideos(query) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '12');
  url.searchParams.set('q', query);
  url.searchParams.set('key', YOUTUBE_API_KEY);

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || `Request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.items || [];
}

function renderResults(items) {
  if (items.length === 0) {
    statusEl.textContent = 'No results found.';
    return;
  }

  statusEl.textContent = '';

  items.forEach((item) => {
    const videoId = item.id.videoId;
    const { title, channelTitle, thumbnails } = item.snippet;

    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'result';
    button.type = 'button';
    button.innerHTML = `
      <span class="result-thumb">
        <img src="${thumbnails.medium.url}" alt="" loading="lazy">
      </span>
      <span class="result-title">${escapeHtml(title)}</span>
      <p class="result-channel">${escapeHtml(channelTitle)}</p>
    `;

    button.addEventListener('click', () => playVideo(videoId, title));

    li.appendChild(button);
    resultsEl.appendChild(li);
  });
}

function playVideo(videoId, title) {
  player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  placeholder.style.display = 'none';
  playerWrap.classList.add('active');
  nowPlaying.textContent = `Now playing: ${title}`;
  document.getElementById('screen').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
