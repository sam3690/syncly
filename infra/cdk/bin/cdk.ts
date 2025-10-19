#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SynclyStack } from '../lib/cdk-stack';

const app = new cdk.App();
new SynclyStack(app, 'SynclyStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});