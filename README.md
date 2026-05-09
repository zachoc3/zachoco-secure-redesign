# Zach Oco Website Refresh

This is a polished, static, security-focused website starter intended to replace and modernize the existing site.

## What is included

- Clean responsive layout
- Accessibility basics (skip link, semantic sections, reduced-motion support)
- Security headers via Netlify-style `_headers`
- Strict Content Security Policy (no inline scripts)
- `security.txt` contact metadata
- Profile image slot in hero (`assets/profile-placeholder.svg`)

## Add your photo

1. Export or download your profile photo.
2. Save it as `assets/profile.jpg`.
3. (Already done) `index.html` is configured to use `./assets/profile.jpg`.

## Local preview

From this folder, run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy securely

1. Deploy over HTTPS only (Netlify, Cloudflare Pages, Vercel, S3+CloudFront, etc.).
2. Keep `_headers` active at the edge/CDN.
3. Point DNS to the new deploy and enable HSTS preload when stable.
4. Replace placeholder content and contact details.

## AWS S3 (easiest update)

If you already host on S3 static website hosting, the simplest update is to sync this folder to your bucket.

### Manual deploy from your computer

```bash
aws s3 sync . s3://YOUR_BUCKET_NAME --delete
```

Recommended caching (fast + safe): cache assets long, HTML short.

```bash
aws s3 sync . s3://YOUR_BUCKET_NAME --delete \
  --exclude "assets/*" --cache-control "max-age=60,public"

aws s3 sync ./assets s3://YOUR_BUCKET_NAME/assets --delete \
  --cache-control "max-age=31536000,public,immutable"
```

### Recommended: S3 + CloudFront (for security headers + HTTPS)

S3 website hosting alone can’t reliably enforce modern security headers. The standard secure setup is:

- S3 bucket (private) + CloudFront in front (HTTPS + WAF optional)
- CloudFront Response Headers Policy to set CSP/HSTS/etc.

This repo includes `_headers` as a reference; for AWS you’d translate those into a CloudFront response headers policy.

### Should you publish to GitHub?

Yes, it’s a good idea — not because you must manually upload files, but because you can automate deploys.

Best practice is GitHub Actions using AWS OIDC (no long-lived AWS keys) to run the same `aws s3 sync` commands on every push to `main`.

## Security checklist

- [ ] TLS enabled for all domains and redirects
- [ ] CSP enforced in production headers
- [ ] No third-party scripts unless necessary
- [ ] Form endpoints validate/sanitize on server side
- [ ] Domain has SPF, DKIM, and DMARC configured for email
