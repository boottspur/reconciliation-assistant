# Reconciliation Assistant - Deployment Guide

## Current Deployment

The Reconciliation Assistant prototype has been successfully deployed to Vercel:

**Live URL**: https://frontend-7g50brw28-chris-merchants-projects.vercel.app

## Custom Domain Setup

To set up the prototype at `demos.chrismerchant.work/reconciliation-prototype`, you'll need to:

### Option 1: Add as Subdomain (Recommended)

1. In your Vercel dashboard, go to the project settings
2. Add `demos.chrismerchant.work` as a custom domain
3. Configure DNS CNAME record: `demos.chrismerchant.work` → `frontend-7g50brw28-chris-merchants-projects.vercel.app`

### Option 2: Path-based Routing

If you want it under a path like `/reconciliation-prototype`, you'd need to:

1. Deploy this as part of your main `demos.chrismerchant.work` site
2. Configure your main site to proxy `/reconciliation-prototype/*` to the Vercel deployment
3. Or use a reverse proxy/CDN like Cloudflare to handle path-based routing

## Authentication Issue

The deployment is currently protected by Vercel's deployment protection. To make it publicly accessible:

1. Go to your Vercel project settings
2. Navigate to "Deployment Protection" 
3. Disable authentication or set it to "Disabled" for public access

## Technical Details

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Vercel Serverless Functions (Node.js)
- **API Endpoints**: Available at `/api/events/[id]/discussions`, `/api/events/[id]/reconcile`, etc.
- **Data**: Mock in-memory storage (resets on function cold starts)

## Features Deployed

✅ Smart suggestion parsing with confidence scores
✅ Three-action workflow (Accept/Ignore Once/Ignore Forever)
✅ Real-time event summary updates
✅ Contract update warnings
✅ Demo mode for automated walkthrough
✅ Responsive Material-UI design

The prototype is fully functional and ready for demonstration to Tripleseat management.