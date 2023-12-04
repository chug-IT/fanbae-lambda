import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

export const login = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Auth login was called`);
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }

  const { email, password } = JSON.parse(event.body || '{}');

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Username and password are required`,
      }),
    };
  }

  const getCommandOutput = await client.send(
    new GetCommand({ TableName: 'users', Key: { email } })
  );

  if (!getCommandOutput.Item || getCommandOutput.Item.password !== password) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: `Invalid username or password`,
      }),
    };
  }

  delete getCommandOutput.Item.password;

  const authToken = jwt.sign(
    getCommandOutput.Item.email,
    process.env.JWT_SECRET!
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      authToken,
      user: getCommandOutput.Item,
      message: `Login successful`,
    }),
  };
};
