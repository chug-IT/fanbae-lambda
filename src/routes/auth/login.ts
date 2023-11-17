import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

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

  const { username, password } = JSON.parse(event.body || '{}');

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Username and password are required`,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Auth login was called`,
    }),
  };
};
