#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkGroupChatMicroserviceStack } from "../lib/cdk-group-chat-microservice-stack";

const app = new cdk.App();
new CdkGroupChatMicroserviceStack(app, "CdkGroupChatMicroserviceStack", {});
