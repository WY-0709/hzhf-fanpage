# 部署（COS + GitHub Pages）

## 1) 上传到腾讯云 COS

安装依赖：

```bash
python -m pip install -U qcloud_cos
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

