import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

export const authHandler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Auth was called`);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Auth was called',
    }),
  };
};
