// =============================================
// Watchlist App — Main Application Logic
// Supabase-backed, with fixed sidebar filtering
// =============================================

window.cachedItems = {};
let currentFilter = 'all';

// ── Toast Notification System ─────────────────
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning'
    };
    const colors = {
        success: 'from-green-600/90 to-green-800/90 border-green-500/30',
        error: 'from-red-600/90 to-red-800/90 border-red-500/30',
        info: 'from-blue-600/90 to-blue-800/90 border-blue-500/30',
        warning: 'from-yellow-600/90 to-yellow-800/90 border-yellow-500/30'
    };

    toast.className = `flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${colors[type]} border rounded-xl shadow-2xl backdrop-blur-md text-white animate-fade-in mb-3 min-w-[300px]`;
    toast.innerHTML = `
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${icons[type]}</span>
        <span class="font-body text-sm font-medium">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ── Initialization ────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in (session persistence)
    if (Session.isLoggedIn()) {
        const user = await AuthAPI.getMe();
        if (user) {
            // User is authenticated, load main app
            await loadTrendingData();
            setupSearch();
            updateUserDisplay(user);
            switchToView('home');
        } else {
            // Token expired
            Session.clearToken();
            switchToView('landing');
        }
    } else {
        switchToView('landing');
    }

    // Set up filter handler
    window.setFilter = applyFilter;

    // Global click listener to close dropdown
    document.addEventListener('click', (e) => {
        const drop = document.getElementById('watchlist-dropdown');
        const btn = document.getElementById('details-add-btn');
        if (drop && !drop.classList.contains('hidden')) {
            if (btn && !btn.contains(e.target) && !drop.contains(e.target)) {
                drop.classList.add('hidden');
            }
        }
    });
});

// ── Auth Functions ────────────────────────────
window.login = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Please enter both email and password', 'warning');
        return;
    }

    // Show loading state
    const loginBtn = document.querySelector('#view-landing button[onclick="login()"]');
    const originalText = loginBtn ? loginBtn.innerHTML : '';
    if (loginBtn) {
        loginBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Signing In...';
        loginBtn.disabled = true;
    }

    try {
        const data = await AuthAPI.login(email, password);
        showToast(`Welcome back, ${data.user.name || data.user.email}!`, 'success');
        updateUserDisplay(data.user);
        await loadTrendingData();
        setupSearch();
        switchToView('home');
    } catch (err) {
        showToast(err.message || 'Login failed', 'error');
    } finally {
        if (loginBtn) {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }
};

window.signup = async () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }

    const signupBtn = document.querySelector('#view-signup button[onclick="signup()"]');
    const originalText = signupBtn ? signupBtn.innerHTML : '';
    if (signupBtn) {
        signupBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Creating...';
        signupBtn.disabled = true;
    }

    try {
        const data = await AuthAPI.signup(name, email, password);
        if (data.needsVerification) {
            showToast('Account created! Check your email to verify, then sign in.', 'info');
            switchToView('landing');
        } else {
            showToast(`Welcome, ${data.user.name || data.user.email}!`, 'success');
            updateUserDisplay(data.user);
            await loadTrendingData();
            setupSearch();
            switchToView('home');
        }
    } catch (err) {
        showToast(err.message || 'Signup failed', 'error');
    } finally {
        if (signupBtn) {
            signupBtn.innerHTML = originalText;
            signupBtn.disabled = false;
        }
    }
};

window.logout = async () => {
    await AuthAPI.logout();
    showToast('Signed out successfully', 'info');
    switchToView('landing');
};

function updateGreeting(nameFallback) {
    const hr = new Date().getHours();
    let greeting = 'Good evening';
    let sub = "Tonight's mood suggests something <span class=\"text-secondary italic\">noir and contemplative</span>. Ready for more?";
    
    if (hr >= 5 && hr < 12) {
        greeting = 'Good morning';
        sub = "Start your day with some <span class=\"text-secondary italic\">light and inspiring</span> cinema. What's on today's watchlist?";
    } else if (hr >= 12 && hr < 18) {
        greeting = 'Good afternoon';
        sub = "Take a midday break with some <span class=\"text-secondary italic\">engaging storytelling</span>. Ready to dive in?";
    }
    
    const textNode = document.getElementById('greeting-text');
    if (textNode) textNode.textContent = greeting;
    
    const subNode = document.getElementById('greeting-subtext');
    if (subNode) subNode.innerHTML = sub;
    
    const nameNode = document.getElementById('greeting-name');
    if (nameNode) nameNode.textContent = nameFallback;
}

function updateUserDisplay(user) {
    // Update settings page email
    const emailInput = document.querySelector('#subview-settings input[type="email"]');
    if (emailInput) emailInput.value = user.email || '';

    const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Auteur');
    updateGreeting(displayName);
}

// ── Trending Data Loading ─────────────────────
function populateTrendingMarquee(items) {
    const marquee = document.getElementById('home-trending-marquee');
    if (!marquee) return;
    
    let html = '';
    // Duplicate items to create a seamless infinite scroll effect
    const displayItems = [...items, ...items];
    
    displayItems.forEach(item => {
        const title = item.mediaType === 'tv' ? item.name : item.title;
        html += `
            <div class="flex-shrink-0 relative group rounded-md overflow-hidden cursor-pointer shadow-lg w-24 h-36" onclick="openDetails('${item.id}', '${item.mediaType}')">
                <img src="${getImageUrl(item.poster_path)}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p class="text-[9px] font-bold text-white px-2 pb-2 leading-tight truncate w-full shadow-black drop-shadow-md">${title}</p>
                </div>
            </div>
        `;
    });
    
    marquee.innerHTML = html;
}

async function loadTrendingData() {
    const pM = window.currentTrendingPage ? window.currentTrendingPage['movie'] : 1;
    const pT = window.currentTrendingPage ? window.currentTrendingPage['tv'] : 1;
    const trendingMovies = await API.fetchTrending('movie', 'day', pM);
    const trendingTV = await API.fetchTrending('tv', 'week', pT);

    // Cache items globally
    trendingMovies.forEach(m => { m.mediaType = 'movie'; window.cachedItems[`${m.id}_movie`] = m; });
    trendingTV.forEach(t => { t.mediaType = 'tv'; window.cachedItems[`${t.id}_tv`] = t; });

    renderMoviesView(trendingMovies);
    renderTVView(trendingTV);
    
    const combined = [...trendingMovies.slice(0, 5), ...trendingTV.slice(0, 5)];
    renderHomeGallery(combined);
    // Shuffle array for better mix
    const shuffle = [...trendingMovies.slice(0, 10), ...trendingTV.slice(0, 10)].sort(() => 0.5 - Math.random());
    populateTrendingMarquee(shuffle);
}

window.currentTrendingPage = { movie: 1, tv: 1 };

window.refreshTrending = async () => {
    if (typeof currentLevel1 === 'undefined') return;

    const isTv = currentLevel1 === 'tv';
    const media = isTv ? 'tv' : 'movie';
    const timeWin = isTv ? 'week' : 'day';

    window.currentTrendingPage[media] += 1;
    if (window.currentTrendingPage[media] > 10) window.currentTrendingPage[media] = 1;

    const data = await API.fetchTrending(media, timeWin, window.currentTrendingPage[media]);
    data.forEach(x => { x.mediaType = media; window.cachedItems[`${x.id}_${media}`] = x; });

    if (isTv) {
        renderTVView(data);
    } else {
        renderMoviesView(data);
    }
};

function getImageUrl(path, size = 'w500') {
    return path ? (size === 'original' ? CONFIG.BACKDROP_URL + path : CONFIG.IMG_URL + path) : CONFIG.PLACEHOLDER_IMG;
}

// ── Details Modal Logic ───────────────────────
let currentDetailItem = null;
window.currentHeroIds = { movie: null, tv: null };

window.openHeroDetails = (category, forceDropdown = false) => {
    const postfix = category === 'tv' ? 'tv' : 'movie';
    const idStr = window.currentHeroIds[postfix];
    if (idStr) {
        openDetails(idStr, postfix);
        if (forceDropdown) document.getElementById('watchlist-dropdown').classList.remove('hidden');
    }
};

window.openDetails = async (id, mediaType) => {
    const item = window.cachedItems[`${id}_${mediaType}`];
    if (!item) return;
    currentDetailItem = item;

    const isTv = mediaType === 'tv';

    document.body.style.overflow = 'hidden';
    document.getElementById('details-modal').style.display = 'flex';
    document.getElementById('details-bg').src = getImageUrl(item.backdrop_path, 'original');
    document.getElementById('details-type').textContent = mediaType;
    document.getElementById('details-rating').textContent = (item.vote_average || 0).toFixed(1);
    document.getElementById('details-title').textContent = isTv ? item.name : item.title;

    const date = isTv ? item.first_air_date : item.release_date;
    document.getElementById('details-meta').textContent = date ? date.split('-')[0] : 'Unknown Year';
    document.getElementById('details-desc').textContent = item.overview || 'No description available.';

    const watchBtn = document.getElementById('details-watch-btn');
    if (watchBtn) {
        watchBtn.onclick = () => openTrailer(item.id, mediaType);
    }

    // Load current status from backend
    await updateWatchlistDropdownUI();

    // Fetch and render Cast
    document.getElementById('details-cast').innerHTML = '<span class="text-xs text-outline">Loading cast...</span>';
    const credits = await API.getCredits(item.id, mediaType);
    if (credits && credits.cast && credits.cast.length > 0) {
        let castHtml = '';
        const topCast = credits.cast.slice(0, 4);
        for (let act of topCast) {
            const img = act.profile_path ? getImageUrl(act.profile_path) : 'https://via.placeholder.com/150x150/222222/777777?text=No+Photo';
            castHtml += `
                <div class="flex items-center gap-4 bg-surface-container-low p-2 rounded-lg border border-outline-variant/10">
                    <img src="${img}" class="w-12 h-12 rounded-full object-cover shadow-lg border border-outline-variant/20">
                    <div class="flex flex-col">
                       <span class="text-sm font-headline text-on-surface line-clamp-1">${act.name}</span>
                       <span class="text-[10px] text-on-surface-variant line-clamp-1 uppercase tracking-wider">${act.character}</span>
                    </div>
                </div>
            `;
        }
        document.getElementById('details-cast').innerHTML = castHtml;
    } else {
        document.getElementById('details-cast').innerHTML = '<span class="text-xs text-outline">Cast not available</span>';
    }
};

window.closeDetails = () => {
    document.body.style.overflow = '';
    document.getElementById('details-modal').style.display = 'none';
    currentDetailItem = null;
    document.getElementById('watchlist-dropdown').classList.add('hidden');
    // Refresh current filtered view
    applyFilter(currentFilter);
};

window.toggleWatchlistDropdown = (e) => {
    if (e) e.stopPropagation();
    document.getElementById('watchlist-dropdown').classList.toggle('hidden');
};

// ── Library Save/Toggle (Supabase-backed) ─────
window.toggleFavorite = async () => {
    if (!Session.isLoggedIn()) return showToast('Please sign in first', 'warning');
    if (!currentDetailItem) return;

    try {
        // Get current status
        const existing = await LibraryAPI.getItemStatus(currentDetailItem.id, currentDetailItem.mediaType);
        const newFav = existing ? !existing.is_favorite : true;
        const currentStatus = existing ? existing.status : null;

        // Build item data for storage
        const itemData = buildItemData(currentDetailItem);

        await LibraryAPI.saveItem(
            currentDetailItem.id,
            currentDetailItem.mediaType,
            currentStatus,
            newFav,
            itemData
        );

        showToast(newFav ? '❤️ Added to Favorites!' : 'Removed from Favorites', newFav ? 'success' : 'info');
        await updateWatchlistDropdownUI();
    } catch (err) {
        showToast('Failed to update favorite', 'error');
        console.error(err);
    }
};

window.saveToLibrary = async (status) => {
    if (!Session.isLoggedIn()) return showToast('Please sign in first', 'warning');
    if (!currentDetailItem) return;

    try {
        // Get current status
        const existing = await LibraryAPI.getItemStatus(currentDetailItem.id, currentDetailItem.mediaType);

        // Toggle: if same status already set, remove it (set null)
        const newStatus = (existing && existing.status === status) ? null : status;
        const currentFav = existing ? existing.is_favorite : false;

        const itemData = buildItemData(currentDetailItem);

        await LibraryAPI.saveItem(
            currentDetailItem.id,
            currentDetailItem.mediaType,
            newStatus,
            currentFav,
            itemData
        );

        const statusLabels = {
            'watched': '✅ Marked as Watched',
            'watching': '▶️ Marked as Watching',
            'to-watch': '🔖 Added to Watch Later'
        };

        showToast(
            newStatus ? statusLabels[newStatus] : 'Status removed',
            newStatus ? 'success' : 'info'
        );

        await updateWatchlistDropdownUI();
    } catch (err) {
        showToast('Failed to update status', 'error');
        console.error(err);
    }
};

function buildItemData(item) {
    const isTv = item.mediaType === 'tv';
    return {
        id: item.id,
        mediaType: item.mediaType,
        title: isTv ? item.name : item.title,
        name: item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date
    };
}

async function updateWatchlistDropdownUI() {
    if (!currentDetailItem || !Session.isLoggedIn()) return;

    const data = await LibraryAPI.getItemStatus(currentDetailItem.id, currentDetailItem.mediaType);
    const status = data ? data.status : null;
    const isFav = data ? data.is_favorite : false;

    const r = (id, condition) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (condition) {
            el.classList.remove('text-outline');
            el.classList.add('text-primary');
            el.style.fontVariationSettings = "'FILL' 1";
        } else {
            el.classList.remove('text-primary');
            el.classList.add('text-outline');
            el.style.fontVariationSettings = "'FILL' 0";
        }
    };
    r('icon-watched', status === 'watched');
    r('icon-watching', status === 'watching');
    r('icon-to-watch', status === 'to-watch');
    r('icon-fav', isFav);
}

// ── Filtering Core Logic (FIXED) ─────────────
window.applyFilter = async (filterType, element = null) => {
    currentFilter = filterType;

    // Scroll to top for visual feedback
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sidebar highlight update
    document.querySelectorAll('.filter-item').forEach(item => {
        item.classList.remove('text-primary', 'bg-primary/5', 'border-primary');
        item.classList.add('text-outline', 'border-transparent');
    });
    if (element) {
        element.classList.add('text-primary', 'bg-primary/5', 'border-primary');
        element.classList.remove('text-outline', 'border-transparent');
    } else {
        const escFilter = filterType.replace(/'/g, "\\'");
        const e = document.querySelector(`.filter-item[onclick*="'${escFilter}'"]`);
        if (e) {
            e.classList.add('text-primary', 'bg-primary/5', 'border-primary');
            e.classList.remove('text-outline', 'border-transparent');
        }
    }

    // Figure out which view we are on
    let level = typeof currentLevel1 !== 'undefined' ? currentLevel1 : 'home';

    // If on 'home' and user clicks a filter, jump to movies view to show results
    if (level === 'home' && filterType !== 'all') {
        switchToView('movies');
        level = 'movies';
        // Wait for view switch to complete
        await new Promise(r => setTimeout(r, 100));
    }

    // Toggle refresh button visibility
    const refreshM = document.getElementById('refresh-btn-movies');
    if (refreshM) refreshM.style.display = filterType === 'all' ? 'flex' : 'none';
    const refreshT = document.getElementById('refresh-btn-tv');
    if (refreshT) refreshT.style.display = filterType === 'all' ? 'flex' : 'none';

    // Label mappings
    const namesM = { 'all': 'Movies', 'watched': 'Watched Movies', 'watching': 'Watching Now', 'to-watch': 'Must Watch', 'favorites': 'Favorite Films' };
    const namesT = { 'all': 'TV Shows', 'watched': 'Watched TV Shows', 'watching': 'Watching Now', 'to-watch': 'Must Watch', 'favorites': 'Favorite Shows' };

    if (level === 'movies') {
        const titleM = document.getElementById('library-title');
        if (titleM) titleM.textContent = namesM[filterType] || 'Movies';

        if (filterType === 'all') {
            const data = await API.fetchTrending('movie', 'day', window.currentTrendingPage['movie']);
            data.forEach(x => { x.mediaType = 'movie'; window.cachedItems[`${x.id}_movie`] = x; });
            renderMoviesView(data);
        } else {
            // Fetch from Supabase
            const libraryItems = await LibraryAPI.getItems(filterType, 'movie');
            const movies = libraryItems.map(li => {
                const d = li.item_data;
                d.mediaType = 'movie';
                d.id = li.tmdb_id;
                d._status = li.status;
                d._isFav = li.is_favorite;
                window.cachedItems[`${d.id}_movie`] = d;
                return d;
            });
            renderMoviesView(movies, true);
        }
    }
    else if (level === 'tv') {
        const titleT = document.getElementById('library-title-tv');
        if (titleT) titleT.textContent = namesT[filterType] || 'TV Shows';

        if (filterType === 'all') {
            const data = await API.fetchTrending('tv', 'week', window.currentTrendingPage['tv']);
            data.forEach(x => { x.mediaType = 'tv'; window.cachedItems[`${x.id}_tv`] = x; });
            renderTVView(data);
        } else {
            const libraryItems = await LibraryAPI.getItems(filterType, 'tv');
            const shows = libraryItems.map(li => {
                const d = li.item_data;
                d.mediaType = 'tv';
                d.id = li.tmdb_id;
                d._status = li.status;
                d._isFav = li.is_favorite;
                window.cachedItems[`${d.id}_tv`] = d;
                return d;
            });
            renderTVView(shows, true);
        }
    }
    else {
        // Home/Explore view
        if (filterType === 'all') {
            loadTrendingData();
        } else {
            const libraryItems = await LibraryAPI.getItems(filterType, null);
            const allSaved = libraryItems.map(li => {
                const d = li.item_data;
                d.mediaType = li.media_type;
                d.id = li.tmdb_id;
                window.cachedItems[`${d.id}_${d.mediaType}`] = d;
                return d;
            });
            renderHomeGallery(allSaved);
        }
    }
};


// ── RENDERERS ─────────────────────────────────

function getEmptyMessage(filterType) {
    const messages = {
        'watched': {
            icon: 'visibility',
            title: 'No watched titles yet',
            subtitle: 'Start marking films and shows you\'ve already seen!',
            cta: 'Browse & Discover'
        },
        'watching': {
            icon: 'play_circle',
            title: 'Not watching anything right now',
            subtitle: 'Find your next binge-worthy obsession.',
            cta: 'Explore Trending'
        },
        'to-watch': {
            icon: 'bookmark_add',
            title: 'Your watchlist is empty',
            subtitle: 'Save titles you want to see later!',
            cta: 'Build Your List'
        },
        'favorites': {
            icon: 'favorite',
            title: 'No favorites yet',
            subtitle: 'Heart the titles you absolutely love ❤️',
            cta: 'Find Your Favorites'
        }
    };
    return messages[filterType] || {
        icon: 'explore',
        title: 'Nothing here yet',
        subtitle: 'Start exploring and curating your personal collection.',
        cta: 'Start Exploring'
    };
}

function renderEmptyState(gridContainer, filterType = 'all') {
    const msg = getEmptyMessage(filterType);
    gridContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center p-16 md:p-24 text-center animate-fade-in">
            <div class="relative mb-8">
                <div class="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150"></div>
                <span class="material-symbols-outlined text-8xl text-primary/60 relative z-10 p-8" style="font-variation-settings: 'wght' 200, 'FILL' 0;">
                    ${msg.icon}
                </span>
            </div>
            <h2 class="text-3xl md:text-4xl font-headline italic text-on-surface mb-3">${msg.title}</h2>
            <p class="text-on-surface-variant font-body text-lg max-w-md leading-relaxed mb-8">${msg.subtitle}</p>
            <button onclick="applyFilter('all')" class="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-body font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">explore</span>
                ${msg.cta}
            </button>
        </div>
    `;
}

function renderMoviesView(movies, hideHero = false) {
    const heroSection = document.getElementById('movies-hero-bg')?.closest('section');
    if (hideHero) {
        if (heroSection) heroSection.style.display = 'none';
    } else {
        if (heroSection) heroSection.style.display = 'flex';
    }

    if (!movies || movies.length === 0) {
        renderEmptyState(document.getElementById('movies-grid'), currentFilter);
        return;
    }

    // 1. Hero
    if (!hideHero) {
        const heroContent = movies[0];
        window.currentHeroIds['movie'] = heroContent.id;

        const heroBg = document.getElementById('movies-hero-bg');
        if (heroBg) heroBg.src = getImageUrl(heroContent.backdrop_path, 'original');
        const heroTitle = document.getElementById('movies-hero-title');
        if (heroTitle) heroTitle.textContent = heroContent.title;
        const heroDesc = document.getElementById('movies-hero-desc');
        if (heroDesc) heroDesc.textContent = heroContent.overview || "Classic cinema brought to life.";
        const watchBtn = document.getElementById('movies-hero-watch');
        if (watchBtn) watchBtn.onclick = () => { if (!window.overrideHeroPlay) openTrailer(heroContent.id, 'movie'); window.overrideHeroPlay = false; };
    }

    // 2. Grid
    const gridContainer = document.getElementById('movies-grid');
    if (!gridContainer) return;

    let gridHtml = '';
    const startIndex = hideHero ? 0 : 1;
    for (let i = startIndex; i < movies.length; i++) {
        const item = movies[i];
        const title = item.title || item.name || 'Untitled';
        const date = item.release_date ? item.release_date.split('-')[0] : '';
        const statusBadge = item._status ? getStatusBadge(item._status) : '';
        const favBadge = item._isFav ? '<span class="material-symbols-outlined text-sm text-red-400" style="font-variation-settings: \'FILL\' 1;">favorite</span>' : '';

        gridHtml += `
            <div class="group cursor-pointer" onclick="openDetails('${item.id}', 'movie')">
                <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-4 bg-surface-container-low transition-all group-hover:scale-[1.02]">
                    <img src="${getImageUrl(item.poster_path)}" class="w-full h-full object-cover" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span class="font-label text-xs text-secondary mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span> ${(item.vote_average || 0).toFixed(1)}
                        </span>
                    </div>
                    ${statusBadge || favBadge ? `
                    <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        ${favBadge}
                        ${statusBadge}
                    </div>` : ''}
                </div>
                <h3 class="text-on-surface font-body font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">${title}</h3>
                <p class="text-on-surface-variant text-sm mt-1">Movie • ${date}</p>
            </div>
        `;
    }
    gridContainer.innerHTML = gridHtml;
}

function renderTVView(tvShows, hideHero = false) {
    const heroSection = document.getElementById('tv-hero-bg')?.closest('section');
    if (hideHero) {
        if (heroSection) heroSection.style.display = 'none';
    } else {
        if (heroSection) heroSection.style.display = 'flex';
    }

    if (!tvShows || tvShows.length === 0) {
        renderEmptyState(document.getElementById('tv-grid'), currentFilter);
        return;
    }

    // 1. Hero
    if (!hideHero) {
        const item = tvShows[0];
        window.currentHeroIds['tv'] = item.id;
        document.getElementById('tv-hero-bg').style.backgroundImage = `url('${getImageUrl(item.backdrop_path, 'original')}')`;
        const titleEl = document.getElementById('tv-hero-title');
        if (titleEl) titleEl.textContent = item.name;
        const descEl = document.getElementById('tv-hero-desc');
        if (descEl) descEl.textContent = item.overview || "";
        const wBtn = document.getElementById('tv-hero-watch');
        if (wBtn) wBtn.onclick = () => { if (!window.overrideHeroPlay) openTrailer(item.id, 'tv'); window.overrideHeroPlay = false; };
    }

    // 2. Grid
    const gridContainer = document.getElementById('tv-grid');
    if (!gridContainer) return;

    let gridHtml = '';
    const startIndex = hideHero ? 0 : 1;
    for (let i = startIndex; i < tvShows.length; i++) {
        const item = tvShows[i];
        const title = item.name || item.title || 'Untitled';
        const date = item.first_air_date ? item.first_air_date.split('-')[0] : '';
        const statusBadge = item._status ? getStatusBadge(item._status) : '';
        const favBadge = item._isFav ? '<span class="material-symbols-outlined text-sm text-red-400" style="font-variation-settings: \'FILL\' 1;">favorite</span>' : '';

        gridHtml += `
            <div class="group cursor-pointer" onclick="openDetails('${item.id}', 'tv')">
                <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-4 bg-surface-container-low transition-all group-hover:scale-[1.02]">
                    <img src="${getImageUrl(item.poster_path)}" class="w-full h-full object-cover" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span class="font-label text-xs text-secondary mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span> ${(item.vote_average || 0).toFixed(1)}
                        </span>
                    </div>
                    ${statusBadge || favBadge ? `
                    <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        ${favBadge}
                        ${statusBadge}
                    </div>` : ''}
                </div>
                <h3 class="text-on-surface font-body font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">${title}</h3>
                <p class="text-on-surface-variant text-sm mt-1">TV Show • ${date}</p>
            </div>
        `;
    }
    gridContainer.innerHTML = gridHtml;
}

function getStatusBadge(status) {
    const badges = {
        'watched': '<span class="bg-green-600/80 text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold backdrop-blur-md">Watched</span>',
        'watching': '<span class="bg-blue-600/80 text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold backdrop-blur-md">Watching</span>',
        'to-watch': '<span class="bg-amber-600/80 text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold backdrop-blur-md">To Watch</span>'
    };
    return badges[status] || '';
}

function renderHomeGallery(mixed) {
    if (!mixed || mixed.length === 0) {
        const bg = document.getElementById('home-gallery-bg');
        if (bg) bg.src = CONFIG.PLACEHOLDER_IMG;
        return;
    }
    const personalGalBg = document.getElementById('home-gallery-bg');
    const first = mixed[Math.floor(Math.random() * mixed.length)];
    if (personalGalBg && first) {
        personalGalBg.src = getImageUrl(first.backdrop_path, 'original');
        const parentGroup = personalGalBg.closest('.group');
        if (parentGroup) {
            parentGroup.onclick = () => openDetails(first.id, first.mediaType);
        }
    }
}

// ── SEARCH ────────────────────────────────────
function setupSearch() {
    const searchInput = document.getElementById('searchInputView');
    const ghostInput = document.getElementById('searchInputGhost');
    const hint = document.getElementById('search-autocomplete-hint');
    if (!searchInput) return;

    let timeout = null;
    let currentPrediction = '';

    // Handle Tab key for auto-complete
    searchInput.addEventListener('keydown', (e) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && currentPrediction) {
            e.preventDefault();
            searchInput.value = currentPrediction;
            if (ghostInput) ghostInput.value = '';
            if (hint) hint.style.opacity = '0';
            currentPrediction = '';
            searchInput.dispatchEvent(new Event('input')); // trigger search with new word
        }
    });

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value;
        const queryTrimmed = query.trim();
        
        // Clear ghost typing if input is empty or just spaces
        if (query.length < 1) {
            if (ghostInput) ghostInput.value = '';
            if (hint) hint.style.opacity = '0';
            currentPrediction = '';
        } else if (ghostInput && currentPrediction && currentPrediction.toLowerCase().startsWith(query.toLowerCase())) {
            // Keep ghost text aligned while typing the exact same prefix
            ghostInput.value = query + currentPrediction.slice(query.length);
        } else {
            if (ghostInput) ghostInput.value = '';
            if (hint) hint.style.opacity = '0';
            currentPrediction = '';
        }

        if (queryTrimmed.length < 2) {
            document.getElementById('search-results-list').innerHTML = '<p class="text-outline text-center py-10">Start typing to search TMDB...</p>';
            document.getElementById('search-feature').style.display = 'none';
            return;
        }

        timeout = setTimeout(async () => {
            const results = await API.searchMulti(queryTrimmed);
            results.forEach(x => { x.mediaType = x.media_type; window.cachedItems[`${x.id}_${x.mediaType}`] = x; });
            
            // Check for autocomplete on the first result
            if (results.length > 0 && queryTrimmed.length >= 2) {
                const first = results[0];
                const title = first.media_type === 'tv' ? (first.name || first.original_name) : (first.title || first.original_title);
                
                // If the user's current exact input string is a prefix of the result's title (case-insensitive)
                if (title && title.toLowerCase().startsWith(query.toLowerCase())) {
                    currentPrediction = title;
                    if (ghostInput) {
                        // Preserve the exact case of what the user typed so far, then append the rest of the suggestion
                        ghostInput.value = query + title.slice(query.length);
                    }
                    if (hint) hint.style.opacity = '1';
                }
            }
            
            renderSearchResults(results);
        }, 500);
    });
}

function renderSearchResults(results) {
    const resultsList = document.getElementById('search-results-list');
    const featurePanel = document.getElementById('search-feature');

    if (!results || results.length === 0) {
        resultsList.innerHTML = '<p class="text-outline text-center py-10">No results found.</p>';
        featurePanel.style.display = 'none';
        return;
    }

    const first = results[0];
    const isFirstTv = first.media_type === 'tv';
    featurePanel.style.display = 'block';

    document.getElementById('search-feat-bg').src = getImageUrl(first.backdrop_path, 'original');
    document.getElementById('search-feat-title').textContent = isFirstTv ? first.name : first.title;
    document.getElementById('search-feat-desc').textContent = first.overview || '';
    document.getElementById('search-feat-poster').src = getImageUrl(first.poster_path);
    document.getElementById('search-feat-poster-title').textContent = isFirstTv ? first.name : first.title;

    if (featurePanel) {
        featurePanel.onclick = () => openDetails(first.id, first.media_type);
    }
    featurePanel.classList.add('cursor-pointer');

    let listHtml = '';
    for (let i = 1; i < Math.min(results.length, 5); i++) {
        const res = results[i];
        const isTv = res.media_type === 'tv';
        listHtml += `
             <div onclick="openDetails('${res.id}', '${res.media_type}')" class="flex gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer border-transparent hover:border-outline-variant/20 border">
                <img src="${getImageUrl(res.poster_path)}" class="w-16 h-24 rounded object-cover shadow" loading="lazy">
                <div class="flex flex-col justify-center">
                    <h4 class="font-headline text-lg leading-tight text-on-surface">${isTv ? res.name : res.title}</h4>
                    <p class="text-xs text-on-surface-variant uppercase tracking-widest mt-1">${res.media_type}</p>
                </div>
            </div>
        `;
    }
    resultsList.innerHTML = listHtml;
}

// ── TRAILER MODAL ─────────────────────────────
window.openTrailer = async (id, mediaType) => {
    const key = await API.getTrailerKey(id, mediaType);
    if (!key) { showToast('No trailer available on YouTube', 'info'); return; }

    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1`;
    modal.style.display = 'flex';
};

window.closeTrailer = () => {
    document.getElementById('trailer-modal').style.display = 'none';
    document.getElementById('trailer-iframe').src = '';
};
