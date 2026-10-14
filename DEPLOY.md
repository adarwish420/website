# Deployment and architecture

How this site is hosted and how changes go live. Last updated October 2026.

## Deploying

Merge to `main`. That's it.

Every push to `main` runs `.github/workflows/deploy.yml`, which uploads the site files to the `adarwish-site` Cloud Storage bucket. The new version is live in about 30 seconds.

To redeploy without a code change, go to **Actions → Deploy to Cloud Storage → Run workflow**.

```
 PR → merge to main
   │
   ▼
 GitHub Actions (.github/workflows/deploy.yml)
   1. Signs in to Google Cloud with the GCS_SERVICE_ACCOUNT secret
   2. Uploads the site files to gs://adarwish-site
```

## Architecture

```
 Visitor's browser
   │
   ├── adarwish.xyz (pages, icons) ──────▶ [load balancer*] ──▶ bucket adarwish-site
   │
   └── measure.adarwish.xyz (GTM, hits) ─▶ [load balancer*] ──▶ Cloud Run: server-side GTM
                                                                   │
                                                                   ▼
                                                              GA4 and other platforms
```

\* **Not yet confirmed:** the site's exact domain (assumed to be `adarwish.xyz`) and what sits in front of the bucket. Confirmed: the domain is served from the bucket, and server-side GTM runs on Cloud Run (moved off Firebase Hosting on Aug 10, 2026). A shared Cloud Load Balancer in front of both is the likely setup. It keeps the site and the tagging server on the same IP range, so Safari doesn't cap server-set cookies at 7 days. Check **Network services → Load balancing** in the Google Cloud console and update this note.

| Piece | Where |
| --- | --- |
| Source | `adarwish420/website`, branch `main` |
| Google Cloud project | `gtm-ttnv8qjx-nwe5z` |
| Website files | Cloud Storage bucket `adarwish-site` |
| Deploy credentials | GitHub secret `GCS_SERVICE_ACCOUNT`: JSON key for a service account with **Storage Object Admin** on the bucket only |
| Tracking | GTM container `GTM-NC7P8JG`, loaded from `measure.adarwish.xyz` |

## What gets uploaded

Only these files, listed explicitly in the workflow:

| Files | Cache-Control |
| --- | --- |
| `index.html`, `now.html` | `public, max-age=300` (5 minutes) |
| `favicon.ico`, `favicon.png`, `apple-touch-icon.png` | `public, max-age=86400` (1 day) |

Everything else in the repo (`DEPLOY.md`, `package.json`, `shot.js`) stays out of the bucket.

## Gotchas

- **New files must be added to the workflow.** A new page, image or stylesheet won't go live until it's added to the upload list in `deploy.yml`.
- **The deploy never deletes anything.** If you remove a file from the repo, delete it from the bucket by hand as well.
- **The site looks stale after a deploy?** If Cloud CDN is on, invalidate `/*` under **Network services → Cloud CDN → Cache invalidation**. Otherwise wait for the cache times above.
- **`NoSuchKey` XML error** means the file isn't in the bucket. Check the workflow's upload list.

## No longer used

These are left over from the old Firebase Hosting setup and can be deleted:

- Firebase Hosting sites `adarwish-web` and `gtm-ttnv8qjx-nwe5z`
- GitHub secret `FIREBASE_SERVICE_ACCOUNT`

## Favicon

`favicon.ico` contains three sizes: hand-drawn 16px and 32px versions, plus a 48px version scaled from the 512px original. `favicon.png` (192px) and `apple-touch-icon.png` (180px, on white because iOS fills transparency with black) are also scaled from the 512px original.
