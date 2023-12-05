import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from './dynamo';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

export const protectedRoute = async (
  handler: (
    event: APIGatewayProxyEventV2,
    email: string
  ) => Promise<APIGatewayProxyStructuredResultV2>,
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Protected route was called`);

  const { authorization } = event.headers;

  if (!authorization) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: `Unauthorized`,
        info: `Authorization header is missing`,
      }),
    };
  }

  const authToken = authorization.split(' ')[1];

  const email = jwt.verify(authToken, process.env.JWT_SECRET!);

  if (typeof email !== 'string') {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: `Unauthorized`,
        info: `Invalid authorization token`,
      }),
    };
  }

  const getCommandOutput = await client.send(
    new GetCommand({
      TableName: 'fanbae',
      Key: { PK: `USER#${email}`, SK: `USER#${email}` },
    })
  );

  const { Item } = getCommandOutput;

  if (!Item) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: `Unauthorized`,
        info: `Email ${email} does not exist`,
      }),
    };
  }
  return await handler(event, email);
};
