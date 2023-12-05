import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamo = new DynamoDBClient({
  region: 'us-east-1',
});

export const client = DynamoDBDocumentClient.from(dynamo);

export const TABLE_NAME = 'fanbae';
