# 🚀 Vercel 部署指南

本指南将带你从零开始，快速并且完美地将你的 Watchlist 项目免费部署到 Vercel 上。

## 第一步：代码同步至 GitHub
请确认你的最新版本代码（包含 `vercel.json` 配置文件和更新后的 `server.js`）已经被 Push 到你的 Github 仓库中：
`https://github.com/jame100101/watchlist-enhanced-version-`

## 第二步：在 Vercel 导入你的项目
1. 登录你的 [Vercel 控制台 (vercel.com/dashboard)](https://vercel.com/dashboard)。
2. 点击右上角的黑色按钮 **"Add New..."** -> **"Project"**。
3. 在左侧的 **Import Git Repository** 列表中找到你刚刚上传的仓库 `watchlist-enhanced-version-`。
4. 点击右侧的 **Import** 开始导入。

## 第三步：填写配置项（对应你的截图页面）
进入 "Configure Project" 页面后，请**核对并按照下方的方式设置**：

| 页面选项                    | 应该怎么填                                                                                         | 原因                                |
|-----------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Project Name**             | `watchlist-enhanced-version`（或者任何你想叫的名字）                                                  | 自动生成的子域名前缀                |
| **Framework Preset**        | **Express** 或 **Other**                                                                                | 我们的后端依靠 Express 处理 API     |
| **Root Directory**          | 默认保持不变 (`./`)                                                                                 | 文件在根路径下                      |
| **Build Command**           | 保持开关**关闭 (灰色未激活)** 或填空并点击 Override 设置为被划掉的效果                        | 这个项目没有打包构建（如Webpack）步骤|
| **Output Directory**        | 保持开关**关闭 (灰色未激活)**                                                                       | 同上，无需自定义静态输出目录        |
| **Install Command**         | 保持开关**关闭 (灰色未激活)** 或留空并 Override                                                     | Vercel会自动识别并静默执行npm install |

## 第四步：环境变量 (Environment Variables) —— 最关键！
由于你 GitHub 上并没有（也不应该有）存放敏感密钥信息的 `.env` 文件。此时你需要**把它们通过 Vercel 面板喂给程序**。

**方法 A：一键上传 (最推荐)**
在 Environment Variables 区块的最底下，找到按钮 **"Import .env"**。
点击它，然后在弹出的文件框选择你电脑根目录的 `.env` 文件即可全自动录入。

**方法 B：手动复制粘贴**
展开 Environment Variables 面板，依次新增这四个键值对（将 `Value` 换成你真实的值）：

1. `SUPABASE_URL` 
2. `SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `TMDB_API_KEY`

## 第五步：起飞 (Deploy)
确认以上信息填写完毕并加入了环境变量后，点击最下方的大白按钮 **Deploy**！

等待1到2分钟（屏幕会跳动显示编译进度，飘散满屏小纸屑），看到 "Congratulations!" 画面后，即可点击生成好的永久链接进入你的网站了（或者点击 "Continue to Dashboard" 并访问 Domains 下方分配的公网网址）。

---
**💡 小贴士：**  
只要第一步部署完成，未来如果你对代码有任何新的改动，只需把代码 `git push` 给 Github。Vercel 就会像魔法一样捕捉变更，并在极短的1分钟内在后台自动静默拉取部署，无需任何按钮介入！
