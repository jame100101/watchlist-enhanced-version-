// =============================================
// Watchlist App — Internationalization (i18n)
// Supports: English (en), Chinese (zh)
// =============================================

(function () {
    'use strict';

    const LANG_KEY = 'watchlist_lang';

    // ── Translation Dictionaries ──────────────────
    const dict = {
        en: {
            // Navigation
            'nav.signIn': 'Sign In', 'nav.signUp': 'Sign Up',
            'nav.explore': 'Explore', 'nav.movies': 'Movies', 'nav.tvShows': 'TV Shows',

            // Landing
            'landing.heroLine1': 'The Digital', 'landing.heroLine2': 'Auteur.',
            'landing.heroFull': 'The Digital <br/> <span class="text-primary">Auteur.</span>',
            'landing.subtitle': 'Elevate your viewing experience beyond the algorithm. A curated gallery for those who see cinema as more than just a pastime.',
            'landing.formTitle': 'Access the Vault',
            'landing.emailLabel': 'Email Address', 'landing.passwordLabel': 'Password',
            'landing.emailPh': 'curator@watchlist.com', 'landing.passwordPh': '••••••••',
            'landing.signInBtn': 'Sign In', 'landing.createBtn': 'Create Account',

            // Signup
            'signup.title': 'Create Account',
            'signup.namePh': 'Full Name', 'signup.emailPh': 'Email Address',
            'signup.passwordPh': 'Password (min 6 characters)', 'signup.btn': 'Sign Up',

            // Sidebar
            'sidebar.library': 'Library', 'sidebar.trendingLabel': 'Trending',
            'sidebar.trending': 'Trending', 'sidebar.watched': 'Watched',
            'sidebar.watching': 'Watching', 'sidebar.toWatch': 'To Watch', 'sidebar.favorites': 'Favorites',

            // Home
            'home.greetMorning': 'Good morning', 'home.greetAfternoon': 'Good afternoon', 'home.greetEvening': 'Good evening',
            'home.subMorning': 'Start your day with some <span class="text-secondary italic">light and inspiring</span> cinema. What\'s on today\'s watchlist?',
            'home.subAfternoon': 'Take a midday break with some <span class="text-secondary italic">engaging storytelling</span>. Ready to dive in?',
            'home.subEvening': 'Tonight\'s mood suggests something <span class="text-secondary italic">noir and contemplative</span>. Ready for more?',
            'home.personalGallery': 'Personal Gallery',
            'home.auteurAI': 'Auteur AI', 'home.auteurAIDesc': 'Get personalized curation based on your mood.',
            'home.zeitgeist': 'The Zeitgeist', 'home.trendingNow': 'Trending Now',
            'home.loadingZeitgeist': 'Loading zeitgeist...',

            // Movies
            'movies.title': 'Movies', 'movies.subtitle': 'Explore our cinematic universe',
            'movies.heroDesc': 'Curated collection of cinematic masterpieces.',
            'movies.watchTrailer': 'Watch Trailer', 'movies.addWatchlist': 'Add to Watchlist',
            'movies.refresh': 'Refresh',

            // TV
            'tv.title': 'TV Shows', 'tv.trendingBadge': 'Trending Now', 'tv.ultraHD': 'Ultra HD',
            'tv.loadingDesc': 'Loading latest TV shows from TMDB...',
            'tv.watchTrailer': 'Watch Trailer', 'tv.addWatchlist': 'Add to Watchlist',
            'tv.refresh': 'Refresh',

            // Search
            'search.placeholder': 'Search...', 'search.startTyping': 'Start typing to search TMDB...',
            'search.noResults': 'No results found.', 'search.pressHint': 'press',

            // Settings
            'settings.title': 'Account Settings',
            'settings.emailLabel': 'Email Address', 'settings.emailNote': 'Primary Contact Email',
            'settings.passwordLabel': 'Password', 'settings.passwordNote': 'Last Changed 30 Days Ago',
            'settings.signOut': 'Sign Out',
            'settings.langLabel': 'Language', 'settings.langNote': 'Interface Language',

            // Details Modal
            'details.watchTrailer': 'Watch Trailer',
            'details.addWatchlist': 'Add to Watchlist / Change Status',
            'details.topCast': 'Top Cast',
            'details.loadingCast': 'Loading cast...', 'details.noCast': 'Cast not available',
            'details.noDesc': 'No description available.', 'details.unknownYear': 'Unknown Year',

            // Watchlist Dropdown
            'wl.watched': 'Watched', 'wl.watching': 'Watching',
            'wl.toWatch': 'To Watch', 'wl.toggleFav': 'Toggle Favorite',

            // Toasts
            'toast.welcomeBack': 'Welcome back,', 'toast.welcome': 'Welcome,',
            'toast.fillFields': 'Please fill in all fields',
            'toast.enterBoth': 'Please enter both email and password',
            'toast.pwMin': 'Password must be at least 6 characters',
            'toast.signedOut': 'Signed out successfully',
            'toast.loginFailed': 'Login failed', 'toast.signupFailed': 'Signup failed',
            'toast.accountCreated': 'Account created! Check your email to verify, then sign in.',
            'toast.addedFav': '❤️ Added to Favorites!', 'toast.removedFav': 'Removed from Favorites',
            'toast.failedFav': 'Failed to update favorite',
            'toast.statusRemoved': 'Status removed', 'toast.failedStatus': 'Failed to update status',
            'toast.signInFirst': 'Please sign in first',
            'toast.noTrailer': 'No trailer available on YouTube',
            'toast.watched': '✅ Marked as Watched', 'toast.watching': '▶️ Marked as Watching',
            'toast.toWatch': '🔖 Added to Watch Later',
            'toast.signingIn': 'Signing In...', 'toast.creating': 'Creating...',

            // Empty States
            'empty.watched.title': 'No watched titles yet',
            'empty.watched.sub': 'Start marking films and shows you\'ve already seen!',
            'empty.watched.cta': 'Browse & Discover',
            'empty.watching.title': 'Not watching anything right now',
            'empty.watching.sub': 'Find your next binge-worthy obsession.',
            'empty.watching.cta': 'Explore Trending',
            'empty.toWatch.title': 'Your watchlist is empty',
            'empty.toWatch.sub': 'Save titles you want to see later!',
            'empty.toWatch.cta': 'Build Your List',
            'empty.favorites.title': 'No favorites yet',
            'empty.favorites.sub': 'Heart the titles you absolutely love ❤️',
            'empty.favorites.cta': 'Find Your Favorites',
            'empty.default.title': 'Nothing here yet',
            'empty.default.sub': 'Start exploring and curating your personal collection.',
            'empty.default.cta': 'Start Exploring',

            // Filter labels
            'fl.movies.all': 'Movies', 'fl.movies.watched': 'Watched Movies',
            'fl.movies.watching': 'Watching Now', 'fl.movies.toWatch': 'Must Watch',
            'fl.movies.favorites': 'Favorite Films',
            'fl.tv.all': 'TV Shows', 'fl.tv.watched': 'Watched TV Shows',
            'fl.tv.watching': 'Watching Now', 'fl.tv.toWatch': 'Must Watch',
            'fl.tv.favorites': 'Favorite Shows',

            // Media labels
            'media.movie': 'Movie', 'media.tv': 'TV Show',

            // Footer
            'footer.copy': '© 2024 Watchlist Collective',

            // ── Admin Page ──
            'admin.badge': 'Admin Access', 'admin.loginTitle': 'Command Center',
            'admin.loginSub': 'Enter admin credentials to continue',
            'admin.pwLabel': 'Admin Password', 'admin.loginBtn': 'Access Dashboard',
            'admin.backMain': '← Back to Watchlist',
            'admin.panelLabel': 'Admin Panel',
            'admin.nav.overview': 'Overview', 'admin.nav.users': 'Users',
            'admin.nav.library': 'All Library Items', 'admin.nav.analytics': 'Analytics',
            'admin.backSite': 'Back to Main Site', 'admin.signOut': 'Sign Out',
            'admin.refresh': 'Refresh', 'admin.live': 'Live',
            'admin.overview.title': 'Dashboard Overview', 'admin.overview.sub': 'Real-time platform insights',
            'admin.users.title': 'User Management', 'admin.users.sub': 'All registered accounts',
            'admin.library.title': 'Library Browser', 'admin.library.sub': 'All saved movies & TV shows',
            'admin.analytics.title': 'Analytics', 'admin.analytics.sub': 'Content trends & user activity',
            'admin.stat.users': 'Users', 'admin.stat.items': 'Items',
            'admin.stat.movies': 'Movies', 'admin.stat.tvShows': 'TV Shows',
            'admin.stat.totalAccounts': 'Total registered accounts',
            'admin.stat.totalEntries': 'Total library entries',
            'admin.stat.savedMovies': 'Saved movies', 'admin.stat.savedTV': 'Saved TV shows',
            'admin.statusDist': 'Status Distribution', 'admin.highlights': 'Highlights',
            'admin.totalFav': 'Total Favorites', 'admin.avgItems': 'Avg Items/User',
            'admin.completionRate': 'Completion Rate', 'admin.movieTvRatio': 'Movie vs TV Ratio',
            'admin.recentUsers': 'Recent Users', 'admin.viewAll': 'View All',
            'admin.searchUsers': 'Search users by email or name...',
            'admin.th.user': 'User', 'admin.th.email': 'Email', 'admin.th.items': 'Items',
            'admin.th.movies': 'Movies', 'admin.th.tvShows': 'TV Shows',
            'admin.th.favorites': 'Favorites', 'admin.th.created': 'Created', 'admin.th.actions': 'Actions',
            'admin.view': 'View', 'admin.delete': 'Delete',
            'admin.searchLib': 'Search by title...', 'admin.allTypes': 'All Types',
            'admin.allStatus': 'All Status', 'admin.allUsers': 'All Users',
            'admin.topMovies': 'Most Popular Movies', 'admin.topTV': 'Most Popular TV Shows',
            'admin.activeUsers': 'Most Active Users',
            'admin.saves': 'saves', 'admin.items': 'items',
            'admin.accountMgmt': 'Account Management',
            'admin.userId': 'User ID', 'admin.createdAt': 'Created At', 'admin.lastSignIn': 'Last Sign In',
            'admin.pwEncrypted': 'Encrypted (cannot be viewed)',
            'admin.resetPw': 'Reset Password', 'admin.deleteAccount': 'Delete Account',
            'admin.setNewPw': 'Set New Password', 'admin.newPwPh': 'Enter new password (min 6 chars)',
            'admin.apply': 'Apply', 'admin.cancel': 'Cancel',
            'admin.libraryCollection': 'Library Collection',
            'admin.noItems': 'This user has no saved items yet.',
            'admin.confirmTitle': 'Are you sure?', 'admin.confirmMsg': 'This action cannot be undone.',
            'admin.confirm': 'Confirm',
            'admin.loadingAnalytics': 'Loading analytics...', 'admin.loading': 'Loading...',
            'admin.loadingUsers': 'Loading users...', 'admin.loadingLib': 'Loading library...',
            'admin.noUsers': 'No users found', 'admin.noData': 'No data yet',
            'admin.noItemsFound': 'No items found',
            'admin.userDeleted': 'User deleted successfully', 'admin.deleteFailed': 'Failed to delete user',
            'admin.pwReset': 'Password reset successfully', 'admin.pwResetFailed': 'Failed to reset password',
            'admin.deleteConfirmTitle': 'Delete Account',

            'admin.watched': 'Watched', 'admin.watching': 'Watching',
            'admin.toWatch': 'To Watch', 'admin.noStatus': 'No Status',

            // Admin key aliases (for data-i18n attrs)
            'admin.access': 'Admin Access', 'admin.cmdCenter': 'Command Center',
            'admin.enterCreds': 'Enter admin credentials to continue',
            'admin.accessBtn': 'Access Dashboard', 'admin.backToSite': '← Back to Watchlist',
            'admin.panel': 'Admin Panel',
            'admin.navOverview': 'Overview', 'admin.navUsers': 'Users',
            'admin.navLibrary': 'All Library Items', 'admin.navAnalytics': 'Analytics',
        },
        zh: {
            // Navigation
            'nav.signIn': '登录', 'nav.signUp': '注册',
            'nav.explore': '探索', 'nav.movies': '电影', 'nav.tvShows': '电视剧',

            // Landing
            'landing.heroLine1': '数字', 'landing.heroLine2': '策展人。',
            'landing.heroFull': '数字 <br/> <span class="text-primary">策展人。</span>',
            'landing.subtitle': '超越算法，提升你的观影体验。为那些将电影视为不仅是消遣的人打造的精选画廊。',
            'landing.formTitle': '进入影库',
            'landing.emailLabel': '邮箱地址', 'landing.passwordLabel': '密码',
            'landing.emailPh': 'curator@watchlist.com', 'landing.passwordPh': '••••••••',
            'landing.signInBtn': '登录', 'landing.createBtn': '创建账号',

            // Signup
            'signup.title': '创建账号',
            'signup.namePh': '姓名', 'signup.emailPh': '邮箱地址',
            'signup.passwordPh': '密码（至少6位）', 'signup.btn': '注册',

            // Sidebar
            'sidebar.library': '片库', 'sidebar.trendingLabel': '趋势',
            'sidebar.trending': '热门推荐', 'sidebar.watched': '已看',
            'sidebar.watching': '在看', 'sidebar.toWatch': '想看', 'sidebar.favorites': '收藏',

            // Home
            'home.greetMorning': '早上好', 'home.greetAfternoon': '下午好', 'home.greetEvening': '晚上好',
            'home.subMorning': '用一些<span class="text-secondary italic">轻松而有启发性的</span>电影开始新的一天。今天的片单是什么？',
            'home.subAfternoon': '来一场午间休息，享受一些<span class="text-secondary italic">引人入胜的故事</span>。准备好了吗？',
            'home.subEvening': '今晚的氛围适合一些<span class="text-secondary italic">黑色而深思的</span>作品。继续探索？',
            'home.personalGallery': '个人画廊',
            'home.auteurAI': '智能推荐', 'home.auteurAIDesc': '根据你的心情获取个性化推荐。',
            'home.zeitgeist': '时代潮流', 'home.trendingNow': '正在流行',
            'home.loadingZeitgeist': '正在加载潮流...',

            // Movies
            'movies.title': '电影', 'movies.subtitle': '探索我们的电影世界',
            'movies.heroDesc': '精选电影杰作。',
            'movies.watchTrailer': '观看预告片', 'movies.addWatchlist': '加入片单',
            'movies.refresh': '刷新',

            // TV
            'tv.title': '电视剧', 'tv.trendingBadge': '正在流行', 'tv.ultraHD': '超高清',
            'tv.loadingDesc': '正在从TMDB加载最新电视剧...',
            'tv.watchTrailer': '观看预告片', 'tv.addWatchlist': '加入片单',
            'tv.refresh': '刷新',

            // Search
            'search.placeholder': '搜索...', 'search.startTyping': '开始输入以搜索TMDB...',
            'search.noResults': '未找到结果。', 'search.pressHint': '按',

            // Settings
            'settings.title': '账号设置',
            'settings.emailLabel': '邮箱地址', 'settings.emailNote': '主要联系邮箱',
            'settings.passwordLabel': '密码', 'settings.passwordNote': '上次修改于30天前',
            'settings.signOut': '退出登录',
            'settings.langLabel': '语言', 'settings.langNote': '界面语言',

            // Details Modal
            'details.watchTrailer': '观看预告片',
            'details.addWatchlist': '加入片单 / 更改状态',
            'details.topCast': '主要演员',
            'details.loadingCast': '正在加载演员...', 'details.noCast': '暂无演员信息',
            'details.noDesc': '暂无简介。', 'details.unknownYear': '未知年份',

            // Watchlist Dropdown
            'wl.watched': '已看', 'wl.watching': '在看',
            'wl.toWatch': '想看', 'wl.toggleFav': '切换收藏',

            // Toasts
            'toast.welcomeBack': '欢迎回来，', 'toast.welcome': '欢迎，',
            'toast.fillFields': '请填写所有字段',
            'toast.enterBoth': '请输入邮箱和密码',
            'toast.pwMin': '密码至少需要6个字符',
            'toast.signedOut': '已成功退出',
            'toast.loginFailed': '登录失败', 'toast.signupFailed': '注册失败',
            'toast.accountCreated': '账号已创建！请检查邮箱验证后登录。',
            'toast.addedFav': '❤️ 已添加到收藏！', 'toast.removedFav': '已取消收藏',
            'toast.failedFav': '收藏更新失败',
            'toast.statusRemoved': '状态已移除', 'toast.failedStatus': '状态更新失败',
            'toast.signInFirst': '请先登录',
            'toast.noTrailer': 'YouTube上没有可用的预告片',
            'toast.watched': '✅ 已标记为看过', 'toast.watching': '▶️ 已标记为在看',
            'toast.toWatch': '🔖 已加入待看列表',
            'toast.signingIn': '登录中...', 'toast.creating': '创建中...',

            // Empty States
            'empty.watched.title': '还没有看过的影片',
            'empty.watched.sub': '开始标记你已经看过的电影和剧集吧！',
            'empty.watched.cta': '浏览发现',
            'empty.watching.title': '目前没有正在观看的影片',
            'empty.watching.sub': '找到你下一部追剧之选。',
            'empty.watching.cta': '探索热门',
            'empty.toWatch.title': '你的待看列表是空的',
            'empty.toWatch.sub': '保存你想看的影片！',
            'empty.toWatch.cta': '建立你的列表',
            'empty.favorites.title': '还没有收藏',
            'empty.favorites.sub': '收藏你最爱的影片 ❤️',
            'empty.favorites.cta': '发现你的最爱',
            'empty.default.title': '这里还没有内容',
            'empty.default.sub': '开始探索并策展你的个人收藏。',
            'empty.default.cta': '开始探索',

            // Filter labels
            'fl.movies.all': '电影', 'fl.movies.watched': '已看电影',
            'fl.movies.watching': '正在观看', 'fl.movies.toWatch': '必看电影',
            'fl.movies.favorites': '收藏电影',
            'fl.tv.all': '电视剧', 'fl.tv.watched': '已看剧集',
            'fl.tv.watching': '正在观看', 'fl.tv.toWatch': '必看剧集',
            'fl.tv.favorites': '收藏剧集',

            // Media labels
            'media.movie': '电影', 'media.tv': '电视剧',

            // Footer
            'footer.copy': '© 2024 Watchlist 工作室',

            // ── Admin Page ──
            'admin.badge': '管理员权限', 'admin.loginTitle': '控制中心',
            'admin.loginSub': '请输入管理员密码继续',
            'admin.pwLabel': '管理员密码', 'admin.loginBtn': '进入控制台',
            'admin.backMain': '← 返回主站',
            'admin.panelLabel': '管理面板',
            'admin.nav.overview': '概览', 'admin.nav.users': '用户',
            'admin.nav.library': '全部片库', 'admin.nav.analytics': '数据分析',
            'admin.backSite': '返回主站', 'admin.signOut': '退出登录',
            'admin.refresh': '刷新', 'admin.live': '实时',
            'admin.overview.title': '仪表盘概览', 'admin.overview.sub': '实时平台洞察',
            'admin.users.title': '用户管理', 'admin.users.sub': '所有注册账号',
            'admin.library.title': '片库浏览', 'admin.library.sub': '所有保存的电影和电视剧',
            'admin.analytics.title': '数据分析', 'admin.analytics.sub': '内容趋势与用户活跃度',
            'admin.stat.users': '用户', 'admin.stat.items': '条目',
            'admin.stat.movies': '电影', 'admin.stat.tvShows': '电视剧',
            'admin.stat.totalAccounts': '已注册账号总数',
            'admin.stat.totalEntries': '片库条目总数',
            'admin.stat.savedMovies': '已保存电影', 'admin.stat.savedTV': '已保存电视剧',
            'admin.statusDist': '状态分布', 'admin.highlights': '数据亮点',
            'admin.totalFav': '总收藏数', 'admin.avgItems': '人均条目',
            'admin.completionRate': '完成率', 'admin.movieTvRatio': '电影/电视比',
            'admin.recentUsers': '最近注册', 'admin.viewAll': '查看全部',
            'admin.searchUsers': '搜索用户邮箱或姓名...',
            'admin.th.user': '用户', 'admin.th.email': '邮箱', 'admin.th.items': '条目',
            'admin.th.movies': '电影', 'admin.th.tvShows': '电视剧',
            'admin.th.favorites': '收藏', 'admin.th.created': '创建时间', 'admin.th.actions': '操作',
            'admin.view': '查看', 'admin.delete': '删除',
            'admin.searchLib': '按标题搜索...', 'admin.allTypes': '所有类型',
            'admin.allStatus': '所有状态', 'admin.allUsers': '所有用户',
            'admin.topMovies': '最受欢迎电影', 'admin.topTV': '最受欢迎电视剧',
            'admin.activeUsers': '最活跃用户',
            'admin.saves': '次保存', 'admin.items': '条目',
            'admin.accountMgmt': '账号管理',
            'admin.userId': '用户 ID', 'admin.createdAt': '创建时间', 'admin.lastSignIn': '最后登录',
            'admin.pwEncrypted': '已加密（无法查看）',
            'admin.resetPw': '重置密码', 'admin.deleteAccount': '删除账号',
            'admin.setNewPw': '设置新密码', 'admin.newPwPh': '输入新密码（至少6位）',
            'admin.apply': '应用', 'admin.cancel': '取消',
            'admin.libraryCollection': '片库收藏',
            'admin.noItems': '该用户还没有保存任何条目。',
            'admin.confirmTitle': '你确定吗？', 'admin.confirmMsg': '此操作无法撤销。',
            'admin.confirm': '确认',
            'admin.loadingAnalytics': '正在加载分析...', 'admin.loading': '加载中...',
            'admin.loadingUsers': '正在加载用户...', 'admin.loadingLib': '正在加载片库...',
            'admin.noUsers': '未找到用户', 'admin.noData': '暂无数据',
            'admin.noItemsFound': '未找到条目',
            'admin.userDeleted': '用户已成功删除', 'admin.deleteFailed': '删除用户失败',
            'admin.pwReset': '密码重置成功', 'admin.pwResetFailed': '密码重置失败',
            'admin.deleteConfirmTitle': '删除账号',

            'admin.watched': '已看', 'admin.watching': '在看',
            'admin.toWatch': '想看', 'admin.noStatus': '无状态',

            // Admin key aliases (for data-i18n attrs)
            'admin.access': '管理员权限', 'admin.cmdCenter': '控制中心',
            'admin.enterCreds': '请输入管理员密码继续',
            'admin.accessBtn': '进入控制台', 'admin.backToSite': '← 返回 Watchlist',
            'admin.panel': '管理面板',
            'admin.navOverview': '概览', 'admin.navUsers': '用户',
            'admin.navLibrary': '全部片库', 'admin.navAnalytics': '数据分析',
        }
    };

    // ── Core Functions ────────────────────────────
    function detectLang() {
        const stored = localStorage.getItem(LANG_KEY);
        if (stored === 'en' || stored === 'zh') return stored;
        const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        return nav.startsWith('zh') ? 'zh' : 'en';
    }

    let currentLang = detectLang();

    function t(key) {
        return (dict[currentLang] && dict[currentLang][key]) || (dict.en[key]) || key;
    }

    function getLang() { return currentLang; }
    function getTmdbLang() { return currentLang === 'zh' ? 'zh-CN' : 'en-US'; }

    function setLang(lang) {
        if (lang !== 'en' && lang !== 'zh') return;
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        applyTranslations();
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    function toggleLang() {
        setLang(currentLang === 'en' ? 'zh' : 'en');
    }

    // ── Apply Translations ───────────────────────
    function applyTranslations() {
        // 1. All elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key);
            const attr = el.getAttribute('data-i18n-attr');
            if (attr === 'placeholder') el.placeholder = val;
            else if (attr === 'html') el.innerHTML = val;
            else el.textContent = val;
        });

        // 2. Update language toggle display
        document.querySelectorAll('.lang-toggle-label').forEach(el => {
            el.textContent = currentLang === 'zh' ? '中文' : 'EN';
        });
        document.querySelectorAll('.lang-option').forEach(el => {
            const lang = el.getAttribute('data-lang');
            if (lang === currentLang) {
                el.classList.add('text-primary', 'bg-primary/10');
                el.classList.remove('text-outline');
            } else {
                el.classList.remove('text-primary', 'bg-primary/10');
                el.classList.add('text-outline');
            }
        });
    }

    // ── Expose Globally ──────────────────────────
    window.t = t;
    window.getLang = getLang;
    window.getTmdbLang = getTmdbLang;
    window.setLang = setLang;
    window.toggleLang = toggleLang;
    window.applyTranslations = applyTranslations;

    // ── Auto-apply on DOM ready ──────────────────
    function init() { applyTranslations(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
