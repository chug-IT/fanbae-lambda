import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const create = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event create was called`);
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }
  const { name, date, location } = JSON.parse(event.body || '{}');
  if (!name || !date || !location) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Name, date and location are required`,
      }),
    };
  }
  try {
    await client.send(
      new PutCommand({
        TableName: 'events',
        Item: { name, date: parseInt(date), location },
        ConditionExpression: 'attribute_not_exists(name)',
      })
    );
  } catch (error) {
    console.error(error);
    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: `Event with name ${name} already exists`,
        }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error`,
        info: error,
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Event ${name} created`,
    }),
  };
};
