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
4. Configure the contact form and CloudFront CSP (see below).

## Resume PDF

Add your resume at `assets/resume.pdf` for the hero **Download resume** button. Until the file exists, that link will 404.

## Contact form (Web3Forms)

The site uses [Web3Forms](https://web3forms.com). Restrict submissions to `zachoco.com` in the dashboard.

## CloudFront CSP (required)

Your response headers policy must allow fonts and form API calls. Use this `Content-Security-Policy` value (or match `cloudfront-security-policy.json`):

```
default-src 'self'; base-uri 'none'; form-action 'self' https://api.web3forms.com; frame-ancestors 'none'; img-src 'self' data:; font-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self' https://api.web3forms.com; upgrade-insecure-requests; block-all-mixed-content
```

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

## One-click secure deploys (GitHub Actions + OIDC)

This repo now includes `.github/workflows/deploy.yml` so pushes to `main` auto-deploy to AWS.

### 1) Create IAM OIDC provider (one-time, if not already present)

In AWS IAM, add provider:
- URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

### 2) Create IAM role for GitHub Actions

Use `aws-oidc-trust-policy.json` as the trust relationship, then attach
`aws-deploy-permissions-policy.json`.

### 3) Set GitHub repo secret + variables

In GitHub repo settings:
- Secret: `AWS_DEPLOY_ROLE_ARN` = your role ARN
- Variable: `S3_BUCKET` = `zachoco`
- Variable: `CLOUDFRONT_DISTRIBUTION_ID` = `E13ZSBIKZY30W0`

### 4) Push to `main`

Every push auto-syncs S3 and invalidates CloudFront.

### Header policy note

`cloudfront-security-policy.json` is updated to `v2` and removes deprecated
`X-XSS-Protection` while keeping strict modern headers.

## Security checklist

- [ ] TLS enabled for all domains and redirects
- [ ] CSP enforced in production headers
- [ ] No third-party scripts unless necessary
- [ ] Form endpoints validate/sanitize on server side
- [ ] Domain has SPF, DKIM, and DMARC configured for email
