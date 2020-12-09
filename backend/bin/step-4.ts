#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TodoApollo } from '../lib/step-4-stack';

const app = new cdk.App();
new TodoApollo(app, 'TodoApollo');
