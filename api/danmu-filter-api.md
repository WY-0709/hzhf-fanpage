# 弹幕敏感词校验 API 设计

## 概述
将弹幕敏感词校验从前端移到后端，确保安全性和一致性。

## API 端点

### POST /api/danmu/validate

**请求：**
```json
{
  "text": "用户输入的弹幕文本",
  "userId": "可选的用户ID"
}
```

**响应（成功）：**
```json
{
  "valid": true,
  "message": "弹幕内容合法",
  "filtered": "过滤后的文本（如果有替换）"
}
```

**响应（失败）：**
```json
{
  "valid": false,
  "message": "包含敏感词：政治、广告等",
  "reason": "sensitive_words"
}
```

## 校验规则

### 敏感词库
- **政治敏感词**：涉及政治人物、事件
- **广告词**：QQ、微信、淘宝等商业推广
- **骚扰词**：辱骂、骚扰、垃圾信息
- **其他**：可根据需要扩展

### 过滤策略
1. **完全拒绝**：政治敏感词、骚扰词 → `valid: false`
2. **替换处理**：广告词 → 替换为 `*` → `valid: true`
3. **长度限制**：弹幕长度 > 200 字符 → 拒绝

## 实现建议

### 技术栈
- **Cloudflare Worker**（现有）
- **KV 存储**：缓存敏感词库
- **速率限制**：每个 IP 每分钟 10 条

### 代码框架（Cloudflare Worker）

```javascript
// wrangler.toml
[[kv_namespaces]]
binding = "DANMU_FILTER"

// worker.js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { text, userId } = await request.json();

    // 1. 长度检查
    if (!text || text.length > 200) {
      return json({ valid: false, reason: 'length_limit' });
    }

    // 2. 获取敏感词库
    const keywords = await env.DANMU_FILTER.get('keywords');
    const list = JSON.parse(keywords || '{}');

    // 3. 检查敏感词
    let filtered = text;
    let hasReject = false;

    for (const [word, action] of Object.entries(list)) {
      if (text.includes(word)) {
        if (action === 'reject') {
          hasReject = true;
          break;
        } else if (action === 'replace') {
          filtered = filtered.replaceAll(word, '*'.repeat(word.length));
        }
      }
    }

    if (hasReject) {
      return json({ valid: false, reason: 'sensitive_words' });
    }

    return json({ valid: true, filtered });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## 前端集成

```javascript
async function validateDanmu(text) {
  const res = await fetch('/api/danmu/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  const result = await res.json();
  
  if (!result.valid) {
    alert('弹幕包含不适当内容，请修改');
    return false;
  }

  return result.filtered || text;
}
```

## 敏感词库管理

### 初始化敏感词库
```javascript
const keywords = {
  "政治人物": "reject",
  "骚扰词": "reject",
  "QQ": "replace",
  "微信": "replace",
  "淘宝": "replace"
};

await env.DANMU_FILTER.put('keywords', JSON.stringify(keywords));
```

### 更新敏感词库
通过管理后台 API 更新，无需重新部署。

## 监控和日志

- 记录被拒绝的弹幕（用于分析）
- 记录 API 调用频率（用于速率限制）
- 定期审查敏感词库的有效性

## 安全考虑

1. **速率限制**：防止滥用
2. **输入验证**：检查文本长度、编码
3. **日志脱敏**：不记录完整的敏感内容
4. **CORS**：只允许来自你的域名的请求
