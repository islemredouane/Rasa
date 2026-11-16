#!/usr/bin/env python3
"""
Cloudflare R2 Sync Script for Rasa Club Website
Uploads optimized event images from images/ to Cloudflare R2 bucket.

Zero dependencies — uses only Python's standard library.

Reads credentials from .env.local or environment variables:
  R2_ACCOUNT_ID
  R2_BUCKET_NAME
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  PUBLIC_CDN_URL (optional)

Usage:
  python scripts/sync-r2.py
"""

import os
import sys
import hmac
import hashlib
import mimetypes
from datetime import datetime, timezone
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load .env.local if present
env_file = os.path.join(ROOT, ".env.local")
if os.path.isfile(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip("'\"")

ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID")
BUCKET = os.environ.get("R2_BUCKET_NAME")
ACCESS_KEY = os.environ.get("R2_ACCESS_KEY_ID")
SECRET_KEY = os.environ.get("R2_SECRET_ACCESS_KEY")
CDN_URL = os.environ.get("PUBLIC_CDN_URL", "").rstrip("/")

if not all([ACCOUNT_ID, BUCKET, ACCESS_KEY, SECRET_KEY]):
    print("❌ Missing Cloudflare R2 credentials in .env.local:")
    print("   R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY")
    sys.exit(1)

HOST = f"{ACCOUNT_ID}.r2.cloudflarestorage.com"
ENDPOINT = f"https://{HOST}"


def sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def get_signature_key(key, date_stamp, region_name, service_name):
    k_date = sign(("AWS4" + key).encode("utf-8"), date_stamp)
    k_region = sign(k_date, region_name)
    k_service = sign(k_region, service_name)
    return sign(k_service, "aws4_request")


def r2_request(method, path, data=None, content_type=None):
    now = datetime.now(timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")
    region = "auto"
    service = "s3"

    canonical_uri = "/" + BUCKET + "/" + path.lstrip("/")
    canonical_querystring = ""

    payload_hash = hashlib.sha256(data if data else b"").hexdigest()

    headers = {
        "host": HOST,
        "x-amz-date": amz_date,
        "x-amz-content-sha256": payload_hash,
    }
    if content_type:
        headers["content-type"] = content_type

    signed_headers_list = sorted(headers.keys())
    signed_headers = ";".join(signed_headers_list)
    canonical_headers = "".join(f"{h}:{headers[h]}\n" for h in signed_headers_list)

    canonical_request = (
        f"{method}\n{canonical_uri}\n{canonical_querystring}\n"
        f"{canonical_headers}\n{signed_headers}\n{payload_hash}"
    )

    algorithm = "AWS4-HMAC-SHA256"
    credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
    string_to_sign = (
        f"{algorithm}\n{amz_date}\n{credential_scope}\n"
        f"{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
    )

    signing_key = get_signature_key(SECRET_KEY, date_stamp, region, service)
    signature = hmac.new(signing_key, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    authorization_header = (
        f"{algorithm} Credential={ACCESS_KEY}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )

    req_url = f"{ENDPOINT}{canonical_uri}"
    req = urllib.request.Request(req_url, data=data, method=method)
    req.add_header("Authorization", authorization_header)
    for k, v in headers.items():
        if k != "host":
            req.add_header(k, v)

    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.headers


def main():
    print(f"\n🚀 Syncing assets to Cloudflare R2: {BUCKET}")
    print(f"   Endpoint: {ENDPOINT}/{BUCKET}")
    if CDN_URL:
        print(f"   Public CDN: {CDN_URL}")

    target_dir = os.path.join(ROOT, "images", "events", "2026-27", "sila")
    if not os.path.isdir(target_dir):
        print(f"❌ Directory not found: {target_dir}")
        return

    files_to_sync = []
    for dirpath, _, filenames in os.walk(target_dir):
        for fn in filenames:
            if fn.endswith((".webp", ".png", ".jpg", ".jpeg")):
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, ROOT).replace("\\", "/")
                files_to_sync.append((full, rel))

    print(f"\nFound {len(files_to_sync)} asset(s) to check:")

    synced = 0
    for full_path, r2_key in files_to_sync:
        size = os.path.getsize(full_path)
        size_mb = size / (1024 * 1024)

        status, headers = r2_request("HEAD", r2_key)
        if status == 200:
            remote_size = int(headers.get("Content-Length", 0))
            if remote_size == size:
                print(f"  ⏭️  [Cached]  {r2_key} ({size_mb:.2f} MB)")
                synced += 1
                continue

        mime_type, _ = mimetypes.guess_type(full_path)
        if not mime_type:
            mime_type = "image/webp" if full_path.endswith(".webp") else "application/octet-stream"

        with open(full_path, "rb") as f:
            data = f.read()

        print(f"  ⬆️  [Upload]  {r2_key} ({size_mb:.2f} MB)... ", end="", flush=True)
        up_status, _ = r2_request("PUT", r2_key, data=data, content_type=mime_type)
        if up_status in (200, 204):
            print("✅ Done")
            synced += 1
        else:
            print(f"❌ Failed (HTTP {up_status})")

    print(f"\n✨ Successfully checked {synced} / {len(files_to_sync)} assets in R2 bucket '{BUCKET}'!")
    if CDN_URL:
        print(f"🔗 Sample: {CDN_URL}/images/events/2026-27/sila/cover.webp\n")


if __name__ == "__main__":
    main()
