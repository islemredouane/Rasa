/**
 * Cloudflare R2 Sync Script for Rasa Club Website
 * Inspired by INSIGHT Website architecture
 *
 * Reads R2 credentials from .env.local or process.env:
 *   R2_ACCOUNT_ID=f3a05fcfad7f066dcee41b351a186282
 *   R2_BUCKET_NAME=rasa-images
 *   R2_ACCESS_KEY_ID=2a494448b938f6e2133259b5cf317df6
 *   R2_SECRET_ACCESS_KEY=23f6c6c5879bd4b3f7d3fbc45bbd686f7c117c25921d6fdeaf279c01f916bd12
 *   PUBLIC_CDN_URL=https://your-public-endpoint.r2.dev
 *
 * Usage:
 *   npm run sync-r2
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local if present
const envLocalPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (val) {
        process.env[key] = val;
      }
    }
  }
}

const accountId = process.env.R2_ACCOUNT_ID;
const bucketName = process.env.R2_BUCKET_NAME;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const publicCdnUrl = (process.env.PUBLIC_CDN_URL || "").replace(/\/+$/, "");

if (!accountId || !bucketName || !accessKeyId || !secretAccessKey) {
  console.error("\n❌ Missing Cloudflare R2 Credentials in .env.local!");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function getLocalFiles(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await getLocalFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relKey = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      results.push({ fullPath, key: relKey });
    }
  }
  return results;
}

async function uploadFile(fullPath, r2Key) {
  const fileBuffer = fs.readFileSync(fullPath);
  const contentType = mime.lookup(fullPath) || "application/octet-stream";
  const sizeMb = (fileBuffer.length / (1024 * 1024)).toFixed(2);

  // Check if object exists with same size
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: r2Key }));
    if (head.ContentLength === fileBuffer.length) {
      console.log(`  ⏭️  [Cached]  ${r2Key} (${sizeMb} MB)`);
      return;
    }
  } catch {
    // Proceed to upload
  }

  process.stdout.write(`  ⬆️  [Upload]  ${r2Key} (${sizeMb} MB)... `);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  console.log("✅ Done");
}

async function main() {
  console.log(`\n🚀 Syncing assets to Cloudflare R2: ${bucketName}`);
  console.log(`   Endpoint: https://${accountId}.r2.cloudflarestorage.com`);
  if (publicCdnUrl) {
    console.log(`   Public CDN: ${publicCdnUrl}`);
  } else {
    console.log(`   Public CDN: (Not set in .env.local yet — configure PUBLIC_CDN_URL once public access is enabled)`);
  }
  console.log("");

  // We sync heavy event images and gallery assets (brand logos and favicons remain on GitHub)
  const mediaDirs = [
    path.join(rootDir, "images", "events", "2026-27", "sila"),
  ];

  let files = [];
  for (const dirPath of mediaDirs) {
    if (fs.existsSync(dirPath)) {
      const dirFiles = await getLocalFiles(dirPath, rootDir);
      files = files.concat(dirFiles);
    }
  }

  console.log(`Found ${files.length} asset(s) to sync to R2:\n`);

  let uploadedCount = 0;
  for (const file of files) {
    try {
      await uploadFile(file.fullPath, file.key);
      uploadedCount++;
    } catch (err) {
      console.error(`\n❌ Failed to upload ${file.key}:`, err.message);
    }
  }

  console.log(`\n✨ Successfully synced ${uploadedCount} / ${files.length} assets to R2 bucket "${bucketName}"!`);
  if (publicCdnUrl) {
    console.log(`🔗 Verify at: ${publicCdnUrl}/images/events/2026-27/sila/cover.webp\n`);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error syncing with R2:", err);
  process.exit(1);
});
