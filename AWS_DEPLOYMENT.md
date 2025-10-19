# Syncly AWS Deployment Guide

This guide covers deploying the Syncly full-stack application to AWS using AWS CDK.

## Architecture

The deployed application consists of:

- **Frontend**: React SPA hosted on S3 + CloudFront
- **Backend**: Express API running on AWS Lambda + API Gateway
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Auth0

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured (`aws configure`)
3. **Node.js** 20+ and npm
4. **GitHub repository** with your code
5. **Supabase project** set up
6. **Auth0 application** configured

## Environment Variables

Create a `.env` file in the CDK directory with:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
SLACK_WEBHOOK_URL=your_slack_webhook_url
GITHUB_TOKEN=your_github_token
GITHUB_REPO=owner/repo
WORKSPACE_ID=your_workspace_id
```

## Deployment Steps

### 1. Bootstrap CDK (First Time Only)

```bash
cd infra/cdk
cdk bootstrap
```

### 2. Deploy Infrastructure

Run the automated deployment script:

```bash
./deploy.sh
```

Or deploy manually:

```bash
# Build frontend
cd frontend
npm install
npm run build

# Install backend dependencies
cd ../backend
npm install

# Deploy infrastructure
cd ../infra/cdk
npm install
npm run build
cdk deploy
```

### 3. Configure Environment

After deployment, update your environment variables:

1. **Frontend**: Update `VITE_API_URL` with the API Gateway URL from CDK outputs
2. **Auth0**: Add your CloudFront domain to allowed origins
3. **Supabase**: Ensure CORS settings allow your deployed domain

## CDK Outputs

The deployment will output:

- `FrontendURL`: Your application's URL (CloudFront distribution)
- `ApiURL`: API Gateway endpoint
- `FrontendBucketName`: S3 bucket name

## Custom Domain (Optional)

To use a custom domain:

1. Update the CDK stack with your domain
2. Add Route 53 hosted zone configuration
3. Request ACM certificate for your domain

## Monitoring & Maintenance

### CloudWatch Logs

- Frontend errors: Check CloudFront access logs
- Backend errors: Check Lambda function logs in CloudWatch

### Updating Deployment

```bash
# Make changes to code
# Then redeploy
cd infra/cdk
cdk deploy
```

### Cost Optimization

- Lambda functions scale automatically
- CloudFront provides global CDN
- S3 storage is pay-for-what-you-use

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update API Gateway CORS settings
2. **Auth0 Issues**: Verify domain and audience settings
3. **Environment Variables**: Ensure all required env vars are set

### Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/SynclyStack-SynclyBackendFunction

# View CloudFront access logs
# Check S3 bucket: syncly-logs-{account-id}
```

## Security Considerations

- All traffic served over HTTPS
- API Gateway provides rate limiting
- Environment variables encrypted at rest
- IAM roles with least privilege principle

## Support

For issues with this deployment:

1. Check AWS CloudWatch logs
2. Verify environment variables
3. Ensure AWS CLI is properly configured
4. Check CDK deployment status: `cdk doctor`