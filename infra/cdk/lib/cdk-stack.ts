import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as path from 'path';

export class SynclyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for frontend hosting
    const frontendBucket = new s3.Bucket(this, 'SynclyFrontendBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SynclyDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

        // Lambda function for agents service
    const agentsFunction = new lambda.Function(this, 'SynclyAgentsFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../agents'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_12.bundlingImage,
          command: [
            'bash', '-c',
            'pip install -r requirements.txt -t /asset-output && cp -r syncly_agents /asset-output/ && cp health.py /asset-output/ && cp -r tests /asset-output/'
          ],
        },
      }),
      handler: 'health.handler',
      environment: {
        PYTHONPATH: '/var/runtime:/var/task',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // API Gateway for agents
    const agentsApi = new apigateway.LambdaRestApi(this, 'SynclyAgentsApi', {
      handler: agentsFunction,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    // Lambda function for backend API
    const backendFunction = new lambda.Function(this, 'SynclyBackendFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend')),
      handler: 'app.handler',
      environment: {
        NODE_ENV: 'production',
        SUPABASE_URL: process.env.SUPABASE_URL || 'https://demo.supabase.co',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'demo-anon-key',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'demo-openai-key',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 'demo-openrouter-key',
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || 'demo.auth0.com',
        AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'demo-audience',
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
        GITHUB_REPO: process.env.GITHUB_REPO || '',
        WORKSPACE_ID: process.env.WORKSPACE_ID || 'demo',
        AGENTS_API_URL: agentsApi.url,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // API Gateway
    const api = new apigateway.LambdaRestApi(this, 'SynclyApi', {
      handler: backendFunction,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Deploy frontend to S3
    new s3deploy.BucketDeployment(this, 'SynclyFrontendDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../../frontend/dist'))],
      destinationBucket: frontendBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'FrontendURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Frontend URL',
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'AgentsApiURL', {
      value: agentsApi.url,
      description: 'Agents API Gateway URL',
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'S3 Bucket for frontend',
    });
  }
}
