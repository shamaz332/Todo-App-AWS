import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';

export class TodoApollo extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'todo-app',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    // print out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
     value: api.graphqlUrl
    });

    // print out the AppSync API Key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // print out the stack region
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });

    const notesLambda = new lambda.Function(this, 'todo-app', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'todo.handler',
      code: lambda.Code.fromAsset('functions'),
      memorySize: 1024
    });
    
    // set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasourceTodo', notesLambda);

    // create resolvers to match GraphQL operations in schema
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getNoteById"
    });
    
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listNotes"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createNote"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteNote"
    });
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updateNote"
    });

    // create DynamoDB table
    const notesTable = new ddb.Table(this, 'todoAppTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });

    // enable the Lambda function to access the DynamoDB table (using IAM)
    notesTable.grantFullAccess(notesLambda)
    
    notesLambda.addEnvironment('NOTES_TABLE', notesTable.tableName);

  }
}