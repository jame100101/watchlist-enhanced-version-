# 🎬 Watchlist 2.0

A premium movie & TV show tracking web application with a cinematic dark-themed UI, powered by TMDB, Supabase, and deployed on Vercel.

> **Live Demo:** [watchlist777.vercel.app](https://watchlist777.vercel.app)

---

## ✨ Features

- **🔐 User Authentication** — Sign up / Sign in with email & password (Supabase Auth)
- **🎥 Trending Content** — Browse trending movies & TV shows in real-time via TMDB API
- **🔍 Smart Search** — Instant search with auto-complete suggestions and preview panel
- **📚 Personal Library** — Save titles as *Watched*, *Watching*, *To Watch*, or *Favorites*
- **🎬 Trailer Playback** — Watch YouTube trailers directly in-app
- **🌐 Bilingual Interface** — Full Chinese / English language toggle (auto-detects system language)
- **📊 Admin Dashboard** — View all users, manage accounts, browse library data & analytics
- **📱 Responsive Design** — Optimized for desktop and mobile

## 🚧 Coming Soon

| Feature | Status |
|---------|--------|
| **Personal Gallery** | 🔨 In Development |
| **Auteur AI** — Personalized recommendations based on your mood | 🔨 In Development |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, Vanilla JS, Tailwind CSS |
| Backend | Node.js, Express |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Movie Data | TMDB API |
| i18n | Custom `lang.js` module |
| Deployment | Vercel |

## 📦 Project Structure

```
├── index.html          # Main app (login, signup, dashboard, movies, TV, search, settings)
├── admin.html          # Admin dashboard (users, library, analytics)
├── api/
│   └── index.js        # Express backend (auth, library CRUD, TMDB proxy, admin)
├── api.js              # Frontend API layer (session, auth, library, TMDB calls)
├── app.js              # Main application logic (rendering, filtering, search)
├── lang.js             # Internationalization module (EN/ZH)
├── background.jpg      # High-res login page background
├── vercel.json         # Vercel deployment config
├── supabase_migration.sql  # Database schema
├── .env.example        # Environment variables template
└── package.json        # Dependencies
```

## 🚀 Deployment

### Environment Variables

Set the following in your Vercel project settings (or `.env` for local dev):

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TMDB_API_KEY` | TMDB API key |
| `ADMIN_PASSWORD` | Admin dashboard access password |

### Local Development

```bash
# Install dependencies
npm install

# Create .env from template
cp .env.example .env
# Fill in your keys

# Start dev server
node api/index.js

# Open http://localhost:3000
```

### Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy 🚀

## 📄 License

This project is for personal/educational use.

---

<br>

# 🎬 Watchlist 2.0（中文）

一款精致的电影与电视剧追踪 Web 应用，采用电影级暗色主题界面，基于 TMDB、Supabase 构建，部署在 Vercel 上。

> **在线演示：** [watchlist777.vercel.app](https://watchlist777.vercel.app)

---

## ✨ 功能特性

- **🔐 用户认证** — 邮箱注册 / 登录（Supabase Auth）
- **🎥 热门内容** — 通过 TMDB API 实时浏览热门电影和电视剧
- **🔍 智能搜索** — 即时搜索，支持自动补全建议和预览面板
- **📚 个人片库** — 将影片标记为 *已看*、*在看*、*想看* 或 *收藏*
- **🎬 预告片播放** — 在应用内直接观看 YouTube 预告片
- **🌐 双语界面** — 中文 / 英文一键切换（自动检测系统语言）
- **📊 后台管理** — 查看所有用户、管理账号、浏览片库数据与分析
- **📱 响应式设计** — 适配桌面端和移动端

## 🚧 即将上线

| 功能 | 状态 |
|------|------|
| **个人画廊（Personal Gallery）** | 🔨 开发中 |
| **智能推荐（Auteur AI）** — 根据你的心情提供个性化推荐 | 🔨 开发中 |

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML, 原生 JS, Tailwind CSS |
| 后端 | Node.js, Express |
| 数据库与认证 | Supabase（PostgreSQL + Auth） |
| 影视数据 | TMDB API |
| 国际化 | 自定义 `lang.js` 模块 |
| 部署 | Vercel |

## 📦 项目结构

```
├── index.html          # 主应用（登录、注册、仪表盘、电影、电视剧、搜索、设置）
├── admin.html          # 后台管理（用户管理、片库浏览、数据分析）
├── api/
│   └── index.js        # Express 后端（认证、片库增删改查、TMDB 代理、管理接口）
├── api.js              # 前端 API 层（会话管理、认证、片库、TMDB 调用）
├── app.js              # 主应用逻辑（渲染、筛选、搜索）
├── lang.js             # 国际化模块（中文/英文）
├── background.jpg      # 高清登录页背景图
├── vercel.json         # Vercel 部署配置
├── supabase_migration.sql  # 数据库表结构
├── .env.example        # 环境变量模板
└── package.json        # 依赖配置
```

## 🚀 部署指南

### 环境变量

在 Vercel 项目设置（或本地 `.env` 文件）中配置以下变量：

| 变量 | 说明 |
|------|------|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 |
| `TMDB_API_KEY` | TMDB API 密钥 |
| `ADMIN_PASSWORD` | 后台管理访问密码 |

### 本地开发

```bash
# 安装依赖
npm install

# 从模板创建 .env 文件
cp .env.example .env
# 填入你的密钥

# 启动开发服务器
node api/index.js

# 打开 http://localhost:3000
```

### 部署到 Vercel

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入仓库
3. 在项目设置中添加环境变量
4. 部署 🚀

## 📄 许可证

本项目仅供个人学习使用。
