// =============================================
// Watchlist App — Frontend API Layer
// Routes through backend proxy (no exposed keys)
// =============================================

const CONFIG = {
    IMG_URL: 'https://image.tmdb.org/t/p/w500',
    BACKDROP_URL: 'https://image.tmdb.org/t/p/original',
    PLACEHOLDER_IMG: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750'%3E%3Crect width='500' height='750' fill='%23222'/%3E%3Ctext x='250' y='370' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='36'%3ENo Image%3C/text%3E%3C/svg%3E"
};

// ── Session Token Management ──────────────────
const Session = {
    getToken() {
        return sessionStorage.getItem('access_token');
    },
    setToken(token) {
        sessionStorage.setItem('access_token', token);
    },
    clearToken() {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_info');
    },
    getUser() {
        const u = sessionStorage.getItem('user_info');
        return u ? JSON.parse(u) : null;
    },
    setUser(user) {
        sessionStorage.setItem('user_info', JSON.stringify(user));
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    authHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    }
};

// ── Auth API ──────────────────────────────────
const AuthAPI = {
    async login(email, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        Session.setToken(data.access_token);
        Session.setUser(data.user);
        return data;
    },
    
    async signup(name, email, password) {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        
        if (data.needsVerification) {
            return data; // User needs to verify email
        }
        
        Session.setToken(data.access_token);
        Session.setUser(data.user);
        return data;
    },
    
    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: Session.authHeaders()
            });
        } catch (e) {
            // Ignore server-side logout errors
        }
        Session.clearToken();
    },
    
    async getMe() {
        if (!Session.isLoggedIn()) return null;
        try {
            const res = await fetch('/api/auth/me', {
                headers: Session.authHeaders()
            });
            if (!res.ok) {
                Session.clearToken();
                return null;
            }
            const data = await res.json();
            Session.setUser(data.user);
            return data.user;
        } catch (e) {
            return null;
        }
    }
};

// ── Library API (Supabase-backed) ─────────────
const LibraryAPI = {
    async getItems(filter = 'all', mediaType = null) {
        if (!Session.isLoggedIn()) return [];
        
        const params = new URLSearchParams();
        if (filter && filter !== 'all') params.set('filter', filter);
        if (mediaType) params.set('media_type', mediaType);
        
        try {
            const res = await fetch(`/api/library?${params.toString()}`, {
                headers: Session.authHeaders()
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.items || [];
        } catch (e) {
            console.error('Library fetch error:', e);
            return [];
        }
    },
    
    async saveItem(tmdbId, mediaType, status, isFavorite, itemData) {
        if (!Session.isLoggedIn()) throw new Error('Not logged in');
        
        const res = await fetch('/api/library', {
            method: 'POST',
            headers: Session.authHeaders(),
            body: JSON.stringify({
                tmdb_id: tmdbId,
                media_type: mediaType,
                status: status,
                is_favorite: isFavorite,
                item_data: itemData
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save');
        return data;
    },
    
    async getItemStatus(tmdbId, mediaType) {
        if (!Session.isLoggedIn()) return null;
        
        try {
            const res = await fetch(`/api/library/status/${tmdbId}/${mediaType}`, {
                headers: Session.authHeaders()
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.item;
        } catch (e) {
            return null;
        }
    },
    
    async removeItem(tmdbId, mediaType) {
        if (!Session.isLoggedIn()) throw new Error('Not logged in');
        
        const res = await fetch(`/api/library/${tmdbId}/${mediaType}`, {
            method: 'DELETE',
            headers: Session.authHeaders()
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to remove');
        }
    }
};

// ── TMDB API (via backend proxy) ──────────────
const API = {
    async fetchTrending(mediaType = 'movie', timeWindow = 'week', page = 1) {
        try {
            const lang = typeof getTmdbLang === 'function' ? getTmdbLang() : 'en-US';
            const res = await fetch(`/api/tmdb/trending/${mediaType}/${timeWindow}?page=${page}&lang=${lang}`);
            const data = await res.json();
            return data.results || [];
        } catch (e) {
            console.error('Error fetching trending:', e);
            return [];
        }
    },

    async searchMulti(query) {
        try {
            const lang = typeof getTmdbLang === 'function' ? getTmdbLang() : 'en-US';
            const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&lang=${lang}`);
            const data = await res.json();
            return (data.results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
        } catch (e) {
            console.error('Error searching:', e);
            return [];
        }
    },

    async getTrailerKey(id, mediaType) {
        try {
            const lang = typeof getTmdbLang === 'function' ? getTmdbLang() : 'en-US';
            const res = await fetch(`/api/tmdb/videos/${mediaType}/${id}?lang=${lang}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                const teaser = data.results.find(v => v.type === 'Teaser' && v.site === 'YouTube');
                const clip = data.results.find(v => v.type === 'Clip' && v.site === 'YouTube');
                return trailer?.key || teaser?.key || clip?.key || null;
            }
        } catch (e) {
            console.error('Error fetching trailer:', e);
        }
        return null;
    },

    async getCredits(id, mediaType) {
        try {
            const lang = typeof getTmdbLang === 'function' ? getTmdbLang() : 'en-US';
            const res = await fetch(`/api/tmdb/credits/${mediaType}/${id}?lang=${lang}`);
            if (!res.ok) throw new Error('Credits fetch failed');
            return await res.json();
        } catch (e) {
            console.error('Error fetching credits:', e);
            return null;
        }
    }
};
