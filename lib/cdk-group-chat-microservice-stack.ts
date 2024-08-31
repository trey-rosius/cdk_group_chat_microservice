import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as cognito from "aws-cdk-lib/aws-cognito";
import path = require("path");
import process = require("process");
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CURRENT_DATE = new Date();
const KEY_EXPIRATION_DATE = new Date(CURRENT_DATE.getTime() + SEVEN_DAYS);

export class CdkGroupChatMicroserviceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool: cognito.UserPool = new cognito.UserPool(
      this,
      "package-delivery-microservice-api-userpool",
      {
        selfSignUpEnabled: true,
        accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
        userVerification: {
          emailStyle: cognito.VerificationEmailStyle.CODE,
        },
        autoVerify: {
          email: true,
        },
        standardAttributes: {
          email: {
            required: true,
            mutable: true,
          },
        },
      }
    );

    const userPoolClient: cognito.UserPoolClient = new cognito.UserPoolClient(
      this,
      "package-delivery-microservice-UserPoolClient",
      {
        userPool,
      }
    );
    //create our API
    const api = new appsync.GraphqlApi(this, "packageDeliveryMicroserviceAPI", {
      name: "packageDeliveryMicroserviceAPI",
      definition: appsync.Definition.fromFile("./schema/schema.graphql"),
      authorizationConfig: {
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: userPool,
            },
          },
        ],

        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: "default",
            description: "default auth mode",
            expires: cdk.Expiration.atDate(KEY_EXPIRATION_DATE),
          },
        },
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      xrayEnabled: true,
    });

    const userServiceAPIDatasource = api.addHttpDataSource(
      "userService",
      "https://emp2uhgrjj.us-east-2.awsapprunner.com"
    );

    const packageServiceAPIDatasource = api.addHttpDataSource(
      "packageService",
      "https://ps8m23mxrp.us-east-2.awsapprunner.com"
    );

    const deliveryServiceAPIDatasource = api.addHttpDataSource(
      "deliveryService",
      "https://2puvdrcruv.us-east-2.awsapprunner.com"
    );

    const paymentsAPIDatasource = api.addHttpDataSource(
      "paymentService",
      "https://spzvacpdpm.us-east-2.awsapprunner.com"
    );

    const nonDataSource = api.addNoneDataSource("none");

    // Create a function that will add user account
    const createUserAccountFunction = new appsync.AppsyncFunction(
      this,
      "createUserAccountFunction",
      {
        api,
        dataSource: userServiceAPIDatasource,
        name: "createUserAccountFunction",
        code: appsync.Code.fromAsset(
          "./resolvers/user-service/createUserAccount.js"
        ),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      }
    );

    const formatUserAccountInputFunction = new appsync.AppsyncFunction(
      this,
      "formatUserAccountInputFunction",
      {
        api,
        dataSource: nonDataSource,
        name: "formatUserAccountInputFunction",
        code: appsync.Code.fromAsset(
          "./resolvers/user-service/formatUserAccountInput.js"
        ),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      }
    );

    new appsync.Resolver(this, "createUserAccountPipelineResolver", {
      api,
      typeName: "Mutation",
      fieldName: "createUserAccount",
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset("./resolvers/pipeline/default.js"),
      pipelineConfig: [
        formatUserAccountInputFunction,
        createUserAccountFunction,
      ],
    });

    new appsync.Resolver(this, "getUserAccountResolver", {
      api,
      typeName: "Query",
      fieldName: "getUserAccount",
      dataSource: userServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/user-service/getUserAccount.js"
      ),
    });

    new appsync.Resolver(this, "getUsersByTypeResolver", {
      api,
      typeName: "Query",
      fieldName: "getUsersByType",
      dataSource: userServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/user-service/getUsersByType.js"
      ),
    });

    new appsync.Resolver(this, "getPackagesByStatusResolver", {
      api,
      typeName: "Query",
      fieldName: "getPackagesByStatus",
      dataSource: packageServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/package-service/getPackagesByStatus.js"
      ),
    });

    new appsync.Resolver(this, "createPackageResolver", {
      api,
      typeName: "Mutation",
      fieldName: "createPackage",
      dataSource: packageServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/package-service/createPackage.js"
      ),
    });

    new appsync.Resolver(this, "getPackageResolver", {
      api,
      typeName: "Query",
      fieldName: "getPackage",
      dataSource: packageServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset("./resolvers/package-service/getPackage.js"),
    });

    new appsync.Resolver(this, "sendPackagePickupRequestResolver", {
      api,
      typeName: "Query",
      fieldName: "sendPackagePickupRequest",
      dataSource: packageServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/package-service/sendPackagePickupRequest.js"
      ),
    });
    new appsync.Resolver(this, "packageDeliveryMovementResolver", {
      api,
      typeName: "Mutation",
      fieldName: "packageDeliveryMovement",
      dataSource: deliveryServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/delivery-service/packageDeliveryMovement.js"
      ),
    });

    new appsync.Resolver(this, "packageDropOffResolver", {
      api,
      typeName: "Mutation",
      fieldName: "packageDropOff",
      dataSource: deliveryServiceAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/delivery-service/packageDropOff.js"
      ),
    });

    new appsync.Resolver(this, "confirmPaymentResolver", {
      api,
      typeName: "Mutation",
      fieldName: "confirmPayment",
      dataSource: paymentsAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/payments-service/confirmPayment.js"
      ),
    });

    new appsync.Resolver(this, "cancelPaymentResolver", {
      api,
      typeName: "Mutation",
      fieldName: "cancelPayment",
      dataSource: paymentsAPIDatasource,
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      code: appsync.Code.fromAsset(
        "./resolvers/payments-service/cancelPayment.js"
      ),
    });

    //////////////////////////
    new cdk.CfnOutput(this, "appsync api key", {
      value: api.apiKey!,
    });

    new cdk.CfnOutput(this, "appsync endpoint", {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "appsync apiId", {
      value: api.apiId,
    });
  }
}
