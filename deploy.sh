#!/bin/bash

# Syncly AWS Deployment Script
# This script builds and deploys the Syncly application to AWS using CDK

set -e

echo "🚀 Starting Syncly AWS Deployment"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Build and deploy CDK stack
echo "🏗️  Building CDK infrastructure..."
cd infra/cdk
npm install
npm run build

echo "🚀 Deploying to AWS..."
cdk bootstrap
cdk deploy --require-approval never

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your frontend environment variables with the deployed API URL"
echo "2. Configure Auth0 with your deployed domain"
echo "3. Set up your Supabase database connection"
echo "4. Test the deployed application"