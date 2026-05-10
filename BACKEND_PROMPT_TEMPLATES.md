# 黄子弘凡粉丝网页 - 后端开发 Prompt 模板

## 📌 使用说明

这些 Prompt 模板可以直接复制到 Claude、ChatGPT 或其他 AI 工具中，用于指导 AI 开发后端功能。

---

## 模板 1：弹幕敏感词校验 API

### 场景
你需要一个 Cloudflare Worker 来校验用户发送的弹幕，过滤敏感词。

### Prompt

```
你是一个 Cloudflare Worker 开发者。请为黄子弘凡粉丝网页开发一个弹幕敏感词校验 API。

需求：
1. 接收 POST 请求，包含弹幕文本
2. 检查是否包含敏感词
3. 返回校验结果

API 设计：
- 端点：POST /api/danmu/validate
- 请求体：{ "text": "弹幕内容", "userId": "可选" }
- 响应：{ "valid": true/false, "filtered": "过滤后的文本", "reason": "拒绝原因" }

敏感词规则：
1. 完全拒绝：政治敏感词、骚扰词
2. 替换处理：广告词（QQ、微信、淘宝等）
3. 长度限制：> 200 字符拒绝

实现要求：
1. 使用 Cloudflare KV 存储敏感词库
2. 支持速率限制（每个 IP 每分钟 10 条）
3. 记录被拒绝的弹幕（用于分析）
4. 支持 CORS（只允许来自 https://wy-0709.github.io 的请求）

请生成：
1. wrangler.toml 配置
2. worker.js 完整代码
3. 敏感词库初始化脚本
4. 前端集成代码示例
```

---

## 模板 2：内容管理系统（CMS）后端

### 场景
你需要一个后端 API，允许管理员更新网站内容（图片、视频、文案），无需改代码。

### Prompt

```
你是一个全栈开发者。请为黄子弘凡粉丝网页开发一个内容管理系统（CMS）后端。

项目信息：
- 前端：单文件 HTML/CSS/JS（GitHub Pages）
- 数据库：PostgreSQL
- 部署：Vercel / 腾讯云 SCF
- 存储：腾讯云 COS

需要管理的内容类型：
1. gallery - 相册（图片）
2. bgm - 背景音乐
3. quotes - 语录
4. timeline - 时间轴
5. albums - 专辑
6. musicals - 音乐剧
7. reviews - 乐评
8. talents - 才艺视频

API 设计：
- GET /api/cms/content - 获取所有内容
- GET /api/cms/content/:type - 获取特定类型
- POST /api/cms/content/:type - 创建内容
- PUT /api/cms/content/:type/:id - 更新内容
- DELETE /api/cms/content/:type/:id - 删除内容
- POST /api/cms/content/:type/batch - 批量上传

功能需求：
1. 认证：JWT 认证，只有管理员可以修改
2. 图片上传：支持上传到腾讯云 COS
3. 排序：支持拖拽排序（order_index）
4. 版本历史：记录所有修改
5. 实时更新：通过 WebSocket 推送更新到前端
6. 缓存：支持 CDN 缓存清除

数据库设计：
```sql
CREATE TABLE cms_content (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  url VARCHAR(500),
  category VARCHAR(100),
  metadata JSON,
  order_index INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  INDEX (type, order_index)
);
```

技术栈：
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 认证：JWT
- 存储：腾讯云 COS SDK
- 实时通信：Socket.io 或 Server-Sent Events

请生成：
1. Express 服务器框架
2. 所有 API 端点的完整实现
3. 数据库连接和迁移脚本
4. 认证中间件
5. COS 上传处理
6. WebSocket 实时更新
7. 错误处理和日志
8. 部署配置（Vercel / Docker）
```

---

## 模板 3：用户系统（可选）

### 场景
如果你想添加用户系统，保存用户的测试结果、点赞记录等。

### Prompt

```
你是一个后端开发者。请为黄子弘凡粉丝网页开发一个用户系统。

需求：
1. 用户注册和登录
2. 保存用户的测试结果
3. 保存用户的点赞记录
4. 用户排行榜

API 设计：
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- GET /api/auth/me - 获取当前用户
- POST /api/user/test-result - 保存测试结果
- POST /api/user/like - 点赞
- GET /api/leaderboard - 排行榜

数据库设计：
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE test_results (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  test_type VARCHAR(50),  -- 'personality' or 'fan_type'
  result_type VARCHAR(100),
  score INT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE likes (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  content_type VARCHAR(50),  -- 'album', 'musical', etc.
  content_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

技术栈：
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 认证：JWT
- 密码加密：bcrypt

请生成：
1. 用户认证系统
2. 测试结果保存
3. 点赞功能
4. 排行榜 API
5. 错误处理
```

---

## 模板 4：数据分析和统计

### 场景
你想了解用户行为，比如最受欢迎的粉丝类型、访问统计等。

### Prompt

```
你是一个数据分析开发者。请为黄子弘凡粉丝网页开发数据分析功能。

需求：
1. 记录用户访问（PV/UV）
2. 记录测试结果分布
3. 记录点赞统计
4. 生成仪表盘

API 设计：
- GET /api/analytics/overview - 概览数据
- GET /api/analytics/test-distribution - 测试结果分布
- GET /api/analytics/popular-content - 热门内容
- GET /api/analytics/daily-stats - 每日统计

数据库设计：
```sql
CREATE TABLE analytics_events (
  id VARCHAR(50) PRIMARY KEY,
  event_type VARCHAR(50),  -- 'page_view', 'test_complete', 'like', etc.
  user_id VARCHAR(50),
  data JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (event_type, created_at)
);
```

请生成：
1. 事件记录系统
2. 统计查询 API
3. 仪表盘数据接口
4. 可视化建议
```

---

## 模板 5：完整后端架构

### 场景
你想要一个完整的、生产级别的后端系统。

### Prompt

```
你是一个架构师。请为黄子弘凡粉丝网页设计一个完整的后端系统。

需求：
1. 弹幕敏感词校验（Cloudflare Worker）
2. 内容管理系统（CMS）
3. 用户系统
4. 数据分析
5. 实时通知

架构要求：
1. 微服务架构（可选）
2. 缓存层（Redis）
3. 消息队列（可选）
4. 日志系统
5. 监控告警

部署要求：
1. 支持多环境（开发、测试、生产）
2. CI/CD 流程
3. 自动化测试
4. 性能监控

请生成：
1. 完整的系统架构图
2. 所有微服务的代码框架
3. 数据库设计
4. API 文档
5. 部署配置
6. 测试用例
```

---

## 🎯 使用流程

### 第一步：选择模板
根据你的需求，选择上面的一个或多个模板。

### 第二步：复制 Prompt
复制完整的 Prompt 文本。

### 第三步：提交给 AI
粘贴到 Claude、ChatGPT 或其他 AI 工具。

### 第四步：迭代
根据 AI 的输出，提出修改意见，继续迭代。

### 第五步：集成
将生成的代码集成到你的项目中。

---

## 💡 Prompt 优化技巧

### 1. 提供上下文
```
我有一个粉丝网页项目，现在需要添加后端功能。
前端已经完成，现在需要：
- 弹幕敏感词校验
- 内容管理系统
```

### 2. 明确需求
```
不要：生成一个通用的 CMS
要：生成一个专门为黄子弘凡粉丝网页设计的 CMS
```

### 3. 指定技术栈
```
使用：Node.js + Express + PostgreSQL
不要：使用 Django 或 Ruby on Rails
```

### 4. 要求代码质量
```
代码要求：
- 完整的错误处理
- 单元测试
- 类型检查（TypeScript）
- 代码注释
```

### 5. 分步骤实施
```
第一步：生成数据库设计
第二步：生成 API 框架
第三步：生成完整实现
```

---

## 📝 示例：完整对话

### 用户
```
我有一个粉丝网页，现在需要添加弹幕敏感词校验。
前端已经准备好了，现在需要后端 API。

要求：
1. 使用 Cloudflare Worker
2. 支持敏感词过滤
3. 记录被拒绝的弹幕
4. 支持速率限制

请生成完整的代码。
```

### AI 回复
```
好的，我为你生成一个完整的 Cloudflare Worker 实现...
[生成代码]
```

### 用户
```
很好！现在我想添加一个管理界面来更新敏感词库。
请生成一个简单的管理后台。
```

### AI 回复
```
好的，我为你生成一个 React 管理界面...
[生成代码]
```

---

## 🚀 下一步

1. **选择一个模板** - 从模板 1（弹幕 API）开始最简单
2. **提交给 AI** - 复制 Prompt，提交给 Claude 或 ChatGPT
3. **获取代码** - AI 会生成完整的代码
4. **测试** - 在本地测试代码
5. **部署** - 部署到 Vercel 或腾讯云

---

## ❓ 常见问题

**Q: 我应该从哪个模板开始？**
A: 从模板 1（弹幕 API）开始，最简单，可以快速看到效果。

**Q: 我可以同时实施多个模板吗？**
A: 可以，但建议按优先级逐个实施。

**Q: 如果 AI 生成的代码有问题怎么办？**
A: 告诉 AI 具体的错误信息，AI 会帮你修复。

**Q: 我需要学习后端开发吗？**
A: 不需要，AI 会为你生成所有代码。但理解基本概念会有帮助。

---

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Express.js 文档](https://expressjs.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [JWT 认证](https://jwt.io/)
- [RESTful API 设计](https://restfulapi.net/)
