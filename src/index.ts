import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { authHandler } from './routes/auth';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  if (/^\/auth\/v1\/.*$/.test(event.rawPath)) {
    return authHandler(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Path ${event.rawPath} not found`,
    }),
  };
};
