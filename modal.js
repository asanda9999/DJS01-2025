export class Modal {
  static SELECTORS = {
    modalCover: '#modalCover',
    modalTitle: '#modalTitle',
    modalDesc: '#modalDescription',
    modalGenres: '#modalGenres',
    modalUpdated: '#modalUpdated',
    modalSeasons: '#modalSeasons',
    closeBtn: '.close-btn',
    sectionTitle: '#modalSectionTitle',
  };

  /**
   * Creates a Modal instance for displaying podcast or genre details.
   * @param {string} modalId - The ID of the modal element.
   * @param {Object} [options] - Optional config.
   * @param {Object.<string, string>} [options.genreMap={}] - Map of genre IDs to names.
   * @param {Array<Object>} [options.podcasts=[]] - Array of podcast data.
   */
  constructor(modalId, { genreMap = {}, podcasts = [] } = {}) {
    this.genreMap = genreMap;
    this.podcasts = podcasts;

    this.modal = document.getElementById(modalId);
    this.modalCover = this.modal.querySelector(Modal.SELECTORS.modalCover);
    this.modalTitle = this.modal.querySelector(Modal.SELECTORS.modalTitle);
    this.modalDesc = this.modal.querySelector(Modal.SELECTORS.modalDesc);
    this.modalGenres = this.modal.querySelector(Modal.SELECTORS.modalGenres);
    this.modalUpdated = this.modal.querySelector(Modal.SELECTORS.modalUpdated);
    this.modalSeasons = this.modal.querySelector(Modal.SELECTORS.modalSeasons);
    this.sectionTitle = this.modal.querySelector(Modal.SELECTORS.sectionTitle);
    this.closeBtn = this.modal.querySelector(Modal.SELECTORS.closeBtn);

    this._bindEvents();
  }

  /** Bind modal close event listeners. @private */
  _bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    window.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });
  }

  /**
   * Open the modal to display a genre or podcast.
   * @param {Object} data - Genre or podcast data object.
   * @param {boolean} [isGenre=false] - True if `data` is a genre.
   */
  open(data, isGenre = false) {
    this.modalSeasons.innerHTML = '';
    this._setSectionTitle(isGenre ? 'Shows' : 'Seasons');

    if (isGenre) {
      this._openGenre(data);
    } else {
      this._openPodcast(data);
    }
  }

  close() {
    this.modal.classList.add('hidden');
  }

  /**
   * Show genre info and related shows.
   * @param {Object} genre - Genre data object.
   * @private
   */
  _openGenre(genre) {
    this._setCover('', '');
    this._setTitle(genre.title);
    this._setDescription(genre.description);
    this._setGenres([genre.id]);
    this._setUpdated('');
    this._setShowsForGenre(genre);
    this.modal.classList.remove('hidden');
  }

  /**
   * Show podcast info.
   * @param {Object} podcast - Podcast data object.
   * @private
   */
  _openPodcast(podcast) {
    this._setCover(podcast.image, podcast.title);
    this._setTitle(podcast.title);
    this._setDescription(podcast.description);
    this._setUpdated(podcast.updated);
    this._setGenres(podcast.genres);
    this._setSeasons(podcast.seasons);
    this.modal.classList.remove('hidden');
  }

  _setCover(imageUrl, title) {
    this.modalCover.innerHTML = '';
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = `${title} Cover`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      this.modalCover.appendChild(img);
    }
  }

  _setTitle(title) {
    this.modalTitle.textContent = title || '';
  }

  _setDescription(description) {
    this.modalDesc.textContent = description || '';
  }

  _setUpdated(updated) {
    if (!updated) {
      this.modalUpdated.textContent = '';
      return;
    }
    this.modalUpdated.textContent = `📅 Last updated: ${new Date(updated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
  }

  _setGenres(genreIds) {
    this.modalGenres.innerHTML = '';
    genreIds.forEach(id => {
      const tag = document.createElement('span');
      tag.className = 'tag';
  tag.textContent = this.genreMap[String(id)] || this.genreMap[Number(id)] || `Genre ${id}`;
      this.modalGenres.appendChild(tag);
    });
  }

  _setSeasons(seasons) {
    this.modalSeasons.innerHTML = '';
    if (seasons) {
      this.modalSeasons.textContent = `Seasons: ${seasons}`;
    }
  }

  _setShowsForGenre(genre) {
    this.modalSeasons.innerHTML = '';

    const showsContainer = document.createElement('div');
    showsContainer.className = 'shows-list';

    const shows = this.podcasts.filter(p =>
      genre.shows?.includes(p.id) || genre.shows?.includes(String(p.id))
    );

    if (shows.length === 0) {
      showsContainer.textContent = 'No shows available for this genre.';
    } else {
      shows.forEach(show => {
        const showDiv = document.createElement('div');
        showDiv.className = 'show-item';
        showDiv.textContent = show.title;
        showDiv.addEventListener('click', () => this.open(show, false));
        showsContainer.appendChild(showDiv);
      });
    }

    this.modalSeasons.appendChild(showsContainer);
  }

  _setSectionTitle(title) {
    if (this.sectionTitle) {
      this.sectionTitle.textContent = title;
    }
  }
}
