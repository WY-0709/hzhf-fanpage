# 内容管理系统（CMS）API 设计

## 概述
允许后台管理员更新网站内容（图片、视频、文案），无需改代码。

## 核心概念

### 数据模型
```
Content
├── gallery (相册)
├── bgm (背景音乐)
├── quotes (语录)
├── timeline (时间轴)
├── albums (专辑)
├── musicals (音乐剧)
├── reviews (乐评)
├── talents (才艺视频)
└── ...其他内容
```

## API 端点

### 1. 获取所有内容

**GET /api/cms/content**

```json
{
  "gallery": [...],
  "bgm": [...],
  "quotes": [...],
  "timeline": [...]
}
```

### 2. 获取特定类型内容

**GET /api/cms/content/:type**

例如：`GET /api/cms/content/gallery`

```json
{
  "type": "gallery",
  "items": [
    {
      "id": "img_001",
      "url": "https://...",
      "title": "图片标题",
      "category": "生活照",
      "order": 1
    }
  ]
}
```

### 3. 创建内容

**POST /api/cms/content/:type**

```json
{
  "title": "新图片",
  "url": "https://...",
  "category": "生活照",
  "order": 1
}
```

**响应：**
```json
{
  "id": "img_002",
  "created_at": "2026-05-01T10:00:00Z"
}
```

### 4. 更新内容

**PUT /api/cms/content/:type/:id**

```json
{
  "title": "更新后的标题",
  "url": "https://...",
  "order": 2
}
```

### 5. 删除内容

**DELETE /api/cms/content/:type/:id**

```json
{
  "success": true,
  "message": "内容已删除"
}
```

### 6. 批量上传

**POST /api/cms/content/:type/batch**

```json
{
  "items": [
    { "title": "图1", "url": "..." },
    { "title": "图2", "url": "..." }
  ]
}
```

## 数据库设计

### 表结构

```sql
-- 内容表
CREATE TABLE cms_content (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,        -- gallery, bgm, quotes, etc.
  title VARCHAR(255),
  description TEXT,
  url VARCHAR(500),
  category VARCHAR(100),
  metadata JSON,                     -- 灵活存储额外字段
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  INDEX (type, order_index)
);

-- 版本历史（可选）
CREATE TABLE cms_content_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id VARCHAR(50),
  old_value JSON,
  new_value JSON,
  changed_by VARCHAR(50),
  changed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (content_id) REFERENCES cms_content(id)
);
```

## 前端集成

### 加载内容

```javascript
// 初始化时加载所有内容
async function loadContent() {
  const res = await fetch('/api/cms/content');
  const data = await res.json();
  
  // 更新全局数据
  window.GALLERY = data.gallery;
  window.BGM = data.bgm;
  window.QUOTES = data.quotes;
  
  // 重新渲染
  renderGallery();
  renderBGM();
}

// 页面加载时调用
document.addEventListener('DOMContentLoaded', loadContent);
```

### 实时更新

```javascript
// 使用 WebSocket 或 Server-Sent Events 实时推送更新
const eventSource = new EventSource('/api/cms/updates');

eventSource.addEventListener('content-updated', (e) => {
  const { type, id } = JSON.parse(e.data);
  console.log(`Content updated: ${type}/${id}`);
  
  // 重新加载该类型的内容
  loadContentType(type);
});
```

## 管理后台

### 后台界面（建议使用现有 CMS 工具）

**选项 1：自建后台**
- 使用 React/Vue 构建管理界面
- 连接上述 API
- 支持拖拽排序、图片上传、预览

**选项 2：使用现有 CMS**
- Strapi（开源，功能完整）
- Contentful（SaaS，易用）
- Sanity（灵活，支持自定义）

### 后台 Prompt 模板

```
你是一个 CMS 后台开发者。请为黄子弘凡粉丝网页创建一个内容管理后台。

需求：
1. 支持管理以下内容类型：
   - 相册（图片）
   - BGM（音乐）
   - 语录
   - 时间轴
   - 专辑
   - 音乐剧
   - 乐评
   - 才艺视频

2. 功能：
   - 创建、编辑、删除内容
   - 拖拽排序
   - 图片上传到 COS
   - 预览
   - 版本历史

3. 技术栈：
   - 前端：React + TypeScript
   - 后端：Node.js + Express
   - 数据库：PostgreSQL
   - 存储：腾讯云 COS

4. API：
   - 使用上述 RESTful API 设计
   - 支持认证（JWT）
   - 支持权限控制

请生成：
- 后台前端代码框架
- 后端 API 实现
- 数据库迁移脚本
```

## 部署

### 后端部署选项

**选项 1：Vercel + PostgreSQL**
```bash
npm install -g vercel
vercel deploy
```

**选项 2：腾讯云 SCF + COS**
```bash
# 使用现有的 SCF 基础设施
# 添加新的函数处理 CMS API
```

**选项 3：Docker + 自建服务器**
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

## 安全考虑

1. **认证**：所有 CMS API 需要 JWT 认证
2. **授权**：只有管理员可以修改内容
3. **审计日志**：记录所有修改
4. **备份**：定期备份数据库
5. **CDN 缓存**：更新内容后清除 CDN 缓存

## 示例：完整流程

### 1. 管理员上传新图片

```javascript
// 后台界面
const formData = new FormData();
formData.append('file', imageFile);
formData.append('title', '新图片');
formData.append('category', '生活照');

const res = await fetch('/api/cms/content/gallery', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 2. 后端处理

```javascript
// 上传到 COS
const cosUrl = await uploadToCOS(imageFile);

// 保存到数据库
const content = await db.cms_content.create({
  type: 'gallery',
  title: '新图片',
  url: cosUrl,
  category: '生活照'
});

// 返回 ID
return { id: content.id, url: cosUrl };
```

### 3. 前端自动更新

```javascript
// 通过 WebSocket 接收更新通知
eventSource.addEventListener('content-updated', () => {
  loadContentType('gallery');
  renderGallery();
});
```

## 监控和分析

- 记录内容修改频率
- 追踪最受欢迎的内容
- 分析用户交互数据
