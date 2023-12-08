import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const chooseInterests = async (
  event: APIGatewayProxyEventV2,
  email: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Auth chooseInterests was called`);
  if (event.requestContext.http.method !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }

  const { interests } = JSON.parse(event.body || '{}');

  if (!interests) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Interests are required`,
      }),
    };
  }

  try {
    await client.send(
      new UpdateCommand({
        Key: { PK: `USER#${email}`, SK: `USER#${email}` },
        TableName: 'fanbae',
        UpdateExpression: 'SET interests = :interests',
        ExpressionAttributeValues: {
          ':interests': interests,
        },
        ConditionExpression: 'attribute_exists(PK)',
      })
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `User not found`,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal Server Error`,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Interests updated`,
    }),
  };
};
