// =============================================
// Watchlist App — Express Backend Server
// Handles: Auth, Library CRUD, TMDB Proxy
// =============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ── Supabase Admin Client (service role for user management) ──
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ── Helper: Create per-request Supabase client with user's JWT ──
function getSupabaseClient(accessToken) {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_ANON_KEY || 'placeholder',
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    }
  );
}

// ── Auth Middleware ──────────────────────────────
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    req.accessToken = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// ═══════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Use admin API to create user with auto-confirmed email (no verification needed)
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name || '' }
    });
    
    if (createError) {
      return res.status(400).json({ error: createError.message });
    }
    
    // Auto sign-in after signup
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      return res.status(500).json({ error: 'Account created but login failed: ' + signInError.message });
    }
    
    res.json({
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        name: signInData.user.user_metadata?.full_name || ''
      },
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || ''
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  try {
    await supabaseAdmin.auth.admin.signOut(req.user.id);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    // Even if signout fails server-side, client should clear its token
    res.json({ message: 'Logged out' });
  }
});

// GET /api/auth/me — get current user info
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.user_metadata?.full_name || ''
    }
  });
});

// ═══════════════════════════════════════════════
// LIBRARY ROUTES (CRUD for user's movie/TV library)
// ═══════════════════════════════════════════════

// GET /api/library?filter=watched&media_type=movie
app.get('/api/library', requireAuth, async (req, res) => {
  const { filter, media_type } = req.query;
  const supabase = getSupabaseClient(req.accessToken);
  
  try {
    let query = supabase
      .from('user_library')
      .select('*')
      .eq('user_id', req.user.id);
    
    // Filter by media type
    if (media_type) {
      query = query.eq('media_type', media_type);
    }
    
    // Filter by status/favorites
    if (filter === 'favorites') {
      query = query.eq('is_favorite', true);
    } else if (filter && filter !== 'all') {
      query = query.eq('status', filter);
    }
    
    query = query.order('updated_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Library fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch library' });
    }
    
    res.json({ items: data || [] });
  } catch (err) {
    console.error('Library error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/library — upsert a library item
app.post('/api/library', requireAuth, async (req, res) => {
  const { tmdb_id, media_type, status, is_favorite, item_data } = req.body;
  
  if (!tmdb_id || !media_type) {
    return res.status(400).json({ error: 'tmdb_id and media_type are required' });
  }
  
  const supabase = getSupabaseClient(req.accessToken);
  
  try {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('user_library')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('tmdb_id', tmdb_id)
      .eq('media_type', media_type)
      .single();
    
    if (existing) {
      // Update existing item
      const updateData = {};
      if (status !== undefined) updateData.status = status;
      if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
      if (item_data) updateData.item_data = item_data;
      
      const { data, error } = await supabase
        .from('user_library')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('Library update error:', error);
        return res.status(500).json({ error: 'Failed to update library item' });
      }
      
      res.json({ item: data, action: 'updated' });
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('user_library')
        .insert({
          user_id: req.user.id,
          tmdb_id,
          media_type,
          status: status || null,
          is_favorite: is_favorite || false,
          item_data: item_data || {}
        })
        .select()
        .single();
      
      if (error) {
        console.error('Library insert error:', error);
        return res.status(500).json({ error: 'Failed to add library item' });
      }
      
      res.json({ item: data, action: 'created' });
    }
  } catch (err) {
    console.error('Library upsert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/library/:tmdb_id/:media_type
app.delete('/api/library/:tmdb_id/:media_type', requireAuth, async (req, res) => {
  const { tmdb_id, media_type } = req.params;
  const supabase = getSupabaseClient(req.accessToken);
  
  try {
    const { error } = await supabase
      .from('user_library')
      .delete()
      .eq('user_id', req.user.id)
      .eq('tmdb_id', parseInt(tmdb_id))
      .eq('media_type', media_type);
    
    if (error) {
      console.error('Library delete error:', error);
      return res.status(500).json({ error: 'Failed to delete library item' });
    }
    
    res.json({ message: 'Item removed from library' });
  } catch (err) {
    console.error('Library delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/library/status/:tmdb_id/:media_type — get single item status
app.get('/api/library/status/:tmdb_id/:media_type', requireAuth, async (req, res) => {
  const { tmdb_id, media_type } = req.params;
  const supabase = getSupabaseClient(req.accessToken);
  
  try {
    const { data, error } = await supabase
      .from('user_library')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('tmdb_id', parseInt(tmdb_id))
      .eq('media_type', media_type)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows, that's OK
      console.error('Status fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch status' });
    }
    
    res.json({ item: data || null });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════
// TMDB PROXY ROUTES (hides API key from client)
// ═══════════════════════════════════════════════

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.TMDB_API_KEY;

// GET /api/tmdb/trending/:mediaType/:timeWindow
app.get('/api/tmdb/trending/:mediaType/:timeWindow', async (req, res) => {
  const { mediaType, timeWindow } = req.params;
  const page = req.query.page || 1;
  const lang = req.query.lang || 'en-US';
  
  try {
    const response = await fetch(
      `${TMDB_BASE}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_KEY}&language=${lang}&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB trending error:', err);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// GET /api/tmdb/search?query=...&lang=en-US
app.get('/api/tmdb/search', async (req, res) => {
  const { query, lang = 'en-US' } = req.query;
  
  try {
    const response = await fetch(
      `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=${lang}&include_adult=false`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB search error:', err);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// GET /api/tmdb/videos/:mediaType/:id
app.get('/api/tmdb/videos/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  const lang = req.query.lang || 'en-US';
  const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
  
  try {
    const response = await fetch(
      `${TMDB_BASE}/${endpoint}/${id}/videos?api_key=${TMDB_KEY}&language=${lang}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB videos error:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// GET /api/tmdb/credits/:mediaType/:id
app.get('/api/tmdb/credits/:mediaType/:id', async (req, res) => {
  const { mediaType, id } = req.params;
  const lang = req.query.lang || 'en-US';
  const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
  
  try {
    const response = await fetch(
      `${TMDB_BASE}/${endpoint}/${id}/credits?api_key=${TMDB_KEY}&language=${lang}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB credits error:', err);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// ═══════════════════════════════════════════════
// ADMIN ROUTES (Dashboard Management)
// ═══════════════════════════════════════════════

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const crypto = require('crypto');

// Generate a simple admin token from the password
function generateAdminToken(password) {
  return crypto.createHash('sha256').update(`admin:${password}:watchlist`).digest('hex');
}

// Admin auth middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const expectedToken = generateAdminToken(ADMIN_PASSWORD);
  
  if (!token || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
  }
  next();
}

// POST /api/admin/verify — verify admin password and return token
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
  
  const token = generateAdminToken(password);
  res.json({ token, message: 'Admin access granted' });
});

// GET /api/admin/stats — aggregate statistics
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    const totalUsers = usersData?.users?.length || 0;
    
    // Get all library items using service role (bypasses RLS)
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('user_library')
      .select('*');
    
    if (itemsError) {
      console.error('Admin stats error:', itemsError);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    
    const allItems = items || [];
    const totalItems = allItems.length;
    const totalMovies = allItems.filter(i => i.media_type === 'movie').length;
    const totalTV = allItems.filter(i => i.media_type === 'tv').length;
    const totalFavorites = allItems.filter(i => i.is_favorite).length;
    
    // Status breakdown
    const statusBreakdown = {
      watched: allItems.filter(i => i.status === 'watched').length,
      watching: allItems.filter(i => i.status === 'watching').length,
      'to-watch': allItems.filter(i => i.status === 'to-watch').length,
      no_status: allItems.filter(i => !i.status).length
    };
    
    res.json({
      totalUsers,
      totalItems,
      totalMovies,
      totalTV,
      totalFavorites,
      statusBreakdown
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users — list all users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Admin users error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    const users = (data?.users || []).map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at
    }));
    
    // Sort by most recent first
    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/library — list all library items across all users
app.get('/api/admin/library', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_library')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Admin library error:', error);
      return res.status(500).json({ error: 'Failed to fetch library' });
    }
    
    res.json({ items: data || [] });
  } catch (err) {
    console.error('Admin library error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id — delete a user account
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // First delete all library items for this user (using service role)
    await supabaseAdmin
      .from('user_library')
      .delete()
      .eq('user_id', id);
    
    // Then delete the user from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Failed to delete user: ' + error.message });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id/password — reset user password
app.put('/api/admin/users/:id/password', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: password
    });
    
    if (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: 'Failed to reset password: ' + error.message });
    }
    
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Catch-all: serve index.html for SPA (local dev only) ──────
app.get('*', (req, res) => {
  if (process.env.VERCEL) {
    // On Vercel, static files are handled by vercel.json routing
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Start Server ────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🎬 Watchlist Server running at http://localhost:${PORT}`);
        console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✓ Connected' : '✗ Not configured'}`);
        console.log(`   TMDB API: ${TMDB_KEY ? '✓ Key loaded' : '✗ Missing key'}\n`);
    });
}
module.exports = app;
