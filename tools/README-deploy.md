# 部署（COS + GitHub Pages）

## 1) 上传到腾讯云 COS

安装依赖（对象存储 Python SDK，包名是 `cos-python-sdk-v5`）：

```bash
python -m pip install -U cos-python-sdk-v5
```

设置环境变量（PowerShell）：

```powershell
$env:COS_SECRET_ID="你的SecretId"
$env:COS_SECRET_KEY="你的SecretKey"
$env:COS_BUCKET="hzhf-fanpage-1423398694"
$env:COS_REGION="ap-guangzhou"
```

执行上传：

```powershell
python .\tools\deploy_cos.py
```

默认会上传：`index.html`、`cover.jpg`、`share.html`、`danmu-worker.js`、`qrcode.png`。

### 1b) 上传 BGM 到 COS `music/` 目录

把本地文件夹（默认 `D:\Music\黄子弘凡`）里的 **mp3 / flac / m4a / wav** 等，按**原始文件名**上传到存储桶的 `music/` 前缀（与 `index.html` 里 BGM 链接的文件名需一致，才会在网页里播放到）。

```powershell
python -m pip install -U cos-python-sdk-v5
$env:COS_SECRET_ID="你的SecretId"
$env:COS_SECRET_KEY="你的SecretKey"
$env:COS_BUCKET="hzhf-fanpage-1423398694"
$env:COS_REGION="ap-guangzhou"
python .\tools\upload_music_cos.py
# 或指定目录：
python .\tools\upload_music_cos.py --src "D:\Music\黄子弘凡"
```

大于约 8MB 的文件会自动走分片上传。若你新增了**新文件名**的曲目，还需要在 `index.html` 的 BGM 列表里加上对应 URL。

## 2) 推送到 GitHub Pages

本项目本地分支是 `clean-main`，远程默认分支是 `main`。

```powershell
git status
git add index.html
git commit -m "Update fanpage"
git push origin clean-main:main
```

如果你确实需要覆盖远程（谨慎使用）：

```powershell
git push --force origin clean-main:main
```

