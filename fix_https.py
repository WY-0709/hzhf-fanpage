import shutil
import pathlib

BASE = pathlib.Path(r"C:\Users\WangY\hzhf-fanpage")

def fix_file(path):
    text = path.read_text(encoding="utf-8")
    count = text.count("http://hzhf-fanpage")
    fixed = text.replace(
        "http://hzhf-fanpage-1423398694.cos.ap-guangzhou.myqcloud.com",
        "https://hzhf-fanpage-1423398694.cos.ap-guangzhou.myqcloud.com"
    ).replace(
        "http://hzhf-fanpage-1423398694.cos-website.ap-guangzhou.myqcloud.com",
        "https://hzhf-fanpage-1423398694.cos-website.ap-guangzhou.myqcloud.com"
    )
    path.write_text(fixed, encoding="utf-8")
    print(f"  {path.name}: replaced {count} occurrences")

# 备份
shutil.copy(BASE / "index.html", BASE / "index.html.bak")
if (BASE / "share.html").exists():
    shutil.copy(BASE / "share.html", BASE / "share.html.bak")
print("[OK] Backups created.")

fix_file(BASE / "index.html")
if (BASE / "share.html").exists():
    fix_file(BASE / "share.html")
print("[OK] Done. All http:// URLs replaced with https://")
