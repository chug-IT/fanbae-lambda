import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { client } from '../../dynamo';
import jwt from 'jsonwebtoken';

export const register = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }

  const { name, email, phone, password, birthday } = JSON.parse(
    event.body || '{}'
  );

  if (!name || !email || !phone || !password || !birthday) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Name, email, phone, password and birthday are required`,
        info: `name: ${name}, email: ${email}, phone: ${phone}, password: ${password}, birthday: ${birthday}`,
      }),
    };
  }

  try {
    await client.send(
      new PutCommand({
        TableName: 'fanbae',
        Item: {
          PK: `USER#${email}`,
          SK: `USER#${email}`,
          name,
          email,
          phone,
          birthday,
          password,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
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
          message: `User with email ${email} already exists`,
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

  const authToken = jwt.sign(email, process.env.JWT_SECRET!);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Auth register was called`,
      user: { name, email, phone, birthday },
      authToken,
    }),
  };
};
