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


def _guess_content_type(path: Path) -> str:
    t, _ = mimetypes.guess_type(str(path))
    if path.suffix.lower() == ".js":
        return "application/javascript; charset=utf-8"
    if path.suffix.lower() == ".html":
        return "text/html; charset=utf-8"
    if t:
        return t
    return "application/octet-stream"


def put_file(client: CosS3Client, bucket: str, local_path: Path, key: str) -> None:
    content_type = _guess_content_type(local_path)
    with local_path.open("rb") as f:
        client.put_object(
            Bucket=bucket,
            Body=f,
            Key=key,
            ContentType=content_type,
            ContentDisposition="inline",
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload site files to Tencent COS")
    parser.add_argument("--bucket", default=os.environ.get("COS_BUCKET", "").strip())
    parser.add_argument("--region", default=os.environ.get("COS_REGION", "").strip())
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Project root (defaults to repo root)",
    )
    args = parser.parse_args()

    secret_id = _require_env("COS_SECRET_ID")
    secret_key = _require_env("COS_SECRET_KEY")
    bucket = (args.bucket or _require_env("COS_BUCKET")).strip()
    region = (args.region or _require_env("COS_REGION")).strip()

    root = Path(args.root).resolve()
    if not root.exists():
        raise SystemExit(f"Root not found: {root}")

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)

    # Minimal set for the GitHub Pages/COS website entry.
    files = [
        ("index.html", "index.html"),
        ("cover.jpg", "cover.jpg"),
        ("share.html", "share.html"),
        ("danmu-worker.js", "danmu-worker.js"),
        ("qrcode.png", "qrcode.png"),
    ]

    for rel, key in files:
        p = root / rel
        if not p.exists():
            raise SystemExit(f"Missing file: {p}")
        put_file(client, bucket, p, key)
        print(f"Uploaded: {rel} -> cos://{bucket}/{key}")


if __name__ == "__main__":
    main()

