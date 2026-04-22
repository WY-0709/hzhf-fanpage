"""
Upload local BGM files to Tencent COS under the music/ prefix.

Usage (PowerShell):
  $env:COS_SECRET_ID="..."
  $env:COS_SECRET_KEY="..."
  $env:COS_BUCKET="hzhf-fanpage-1423398694"
  $env:COS_REGION="ap-guangzhou"
  python .\\tools\\upload_music_cos.py --src "D:\\Music\\黄子弘凡"

Large files use multipart upload_file; small files use put_object.
Object key: music/<exact filename>  (UTF-8, must match URLs in index.html)
"""
from __future__ import annotations

import argparse
import mimetypes
import os
from pathlib import Path

from qcloud_cos import CosConfig, CosS3Client  # type: ignore


def _require_env(name: str) -> str:
    v = os.environ.get(name, "").strip()
    if not v:
        raise SystemExit(f"Missing env var: {name}")
    return v


def _content_type(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".mp3":
        return "audio/mpeg"
    if ext == ".flac":
        return "audio/flac"
    if ext in (".m4a", ".mp4"):
        return "audio/mp4"
    if ext == ".wav":
        return "audio/wav"
    t, _ = mimetypes.guess_type(str(path))
    return t or "application/octet-stream"


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload BGM folder to COS music/")
    parser.add_argument(
        "--src",
        type=Path,
        default=Path(r"D:\Music\黄子弘凡"),
        help="Local folder containing audio files",
    )
    parser.add_argument("--bucket", default=os.environ.get("COS_BUCKET", "").strip())
    parser.add_argument("--region", default=os.environ.get("COS_REGION", "").strip())
    parser.add_argument(
        "--prefix",
        default="music/",
        help="COS key prefix (default music/)",
    )
    parser.add_argument(
        "--min-multipart-mb",
        type=int,
        default=8,
        help="Use multipart upload when file size exceeds this (MB)",
    )
    args = parser.parse_args()

    src: Path = args.src.expanduser().resolve()
    if not src.is_dir():
        raise SystemExit(f"Not a directory: {src}")

    exts_preview = {".mp3", ".flac", ".m4a", ".wav", ".aac", ".ogg"}
    preview = sorted(p.name for p in src.iterdir() if p.is_file() and p.suffix.lower() in exts_preview)
    print(f"Source: {src}")
    print(f"Found {len(preview)} audio file(s).")
    if not preview:
        raise SystemExit("No .mp3/.flac/.m4a/.wav etc. in folder — nothing to upload.")

    secret_id = _require_env("COS_SECRET_ID")
    secret_key = _require_env("COS_SECRET_KEY")
    bucket = (args.bucket or _require_env("COS_BUCKET")).strip()
    region = (args.region or _require_env("COS_REGION")).strip()
    prefix = args.prefix.strip()
    if prefix and not prefix.endswith("/"):
        prefix += "/"

    files = sorted(src / n for n in preview)

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)

    threshold = max(1, args.min_multipart_mb) * 1024 * 1024

    for local in files:
        key = prefix + local.name
        size = local.stat().st_size
        ct = _content_type(local)
        if size >= threshold:
            client.upload_file(
                Bucket=bucket,
                LocalFilePath=str(local),
                Key=key,
                PartSize=8,
                MAXThread=4,
                EnableMD5=False,
                ContentType=ct,
            )
        else:
            with local.open("rb") as f:
                client.put_object(
                    Bucket=bucket,
                    Body=f,
                    Key=key,
                    ContentType=ct,
                    ContentDisposition="inline",
                )
        print(f"OK {size:>10}  {key}")

    print(f"\nDone. Uploaded {len(files)} file(s) to cos://{bucket}/{prefix}")


if __name__ == "__main__":
    main()
