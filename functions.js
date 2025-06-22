import { podcasts, genres } from './data.js';
import { Modal } from './modal.js';

const grid = document.getElementById('podcastGrid');
const genreSelect = document.getElementById('genre');

const genreMap = {};
genres.forEach(g => {
  genreMap[g.id] = g.title;
});

const podcastModal = new Modal('podcastModal', {genreMap, podcasts});

/**
 * Creates a DOM element with given options.
 * @param {string} tag - HTML tag name.
 * @param {Object} [options={}] - Element options: className, content, attrs, children, events.
 * @returns {HTMLElement}
 */
function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.content) el.innerHTML = options.content;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      el.setAttribute(key, value);
    }
  }
  if (options.children) options.children.forEach(child => el.appendChild(child));
  if (options.events) {
    for (const [event, handler] of Object.entries(options.events)) {
      el.addEventListener(event, handler);
    }
  }
  return el;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Updated today';
  if (diff === 1) return 'Updated yesterday';
  if (diff <= 30) return `Updated ${diff} days ago`;

  return `Updated on ${date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}`;
}

function createTags(genreIds = []) {
  const tagContainer = createElement('div', { className: 'tags' });
  genreIds.forEach(id => {
    const name = genreMap[id] || `Genre ${id}`;
    const tag = createElement('span', { className: 'tag', content: name });
    tagContainer.appendChild(tag);
  });
  return tagContainer;
}

/**
 * Opens modal for given item.
 * @param {Object} item - Podcast or genre data.
 * @param {'podcast'|'genre'} [type='podcast']
 */
function openModal(item, type = 'podcast') {
  podcastModal.open(item, type === 'genre');
}

/**
 * Creates a podcast or genre card element.
 * @param {Object} item
 * @param {'podcast'|'genre'} [type='podcast']
 * @returns {HTMLElement}
 */
function createCard(item, type = 'podcast') {
  if (type === 'podcast') {
    const cover = createElement('div', {
      className: 'cover',
      children: [createElement('img', { attrs: { src: item.image, alt: `${item.title} Cover` } })]
    });
    const title = createElement('h3', { content: item.title });
    const meta = createElement('p', { className: 'meta', content: `📅 ${item.seasons} seasons` });
    const tags = createTags(item.genres);
    const updated = createElement('p', { className: 'updated', content: formatDate(item.updated) });

    return createElement('div', {
      className: 'card',
      children: [cover, title, meta, tags, updated],
      events: { click: () => openModal(item, 'podcast') }
    });
  } else {
    const title = createElement('h3', { content: item.title });
    const desc = createElement('p', { content: item.description });

    return createElement('div', {
      className: 'card genre-card',
      children: [title, desc],
      events: { click: () => openModal(item, 'genre') }
    });
  }
}

/**
 * Renders a list of items into the grid.
 * @param {Object[]} items
 * @param {'podcast'|'genre'} [type='podcast']
 */
function renderItems(items, type = 'podcast') {
  grid.innerHTML = '';
  if (items.length === 0) {
    grid.appendChild(createElement('p', { content: 'No items found.' }));
    return;
  }
  items.forEach(item => grid.appendChild(createCard(item, type)));
}

/**
 * Filters podcasts by genre.
 * @param {Object[]} items
 * @param {string} genreId
 * @returns {Object[]}
 */
function filterByGenre(items, genreId) {
  if (genreId === 'all') return items;
  const id = Number(genreId);
  if (isNaN(id)) return items;
  return items.filter(item => item.genres.includes(id));
}

function populateGenreFilter() {
  genreSelect.innerHTML = `<option value="all">All Genres</option>`;
  genres.forEach(g => {
    const option = createElement('option', { content: g.title, attrs: { value: g.id } });
    genreSelect.appendChild(option);
  });
}

genreSelect.addEventListener('change', (e) => {
  const filtered = filterByGenre(podcasts, e.target.value);
  renderItems(filtered, 'podcast');
});

// Initialize UI
populateGenreFilter();
renderItems(podcasts, 'podcast');
