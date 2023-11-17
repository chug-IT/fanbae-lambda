import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { auth } from './routes/auth';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  if (/^\/auth\/v1\/.*$/.test(event.rawPath)) {
    return auth(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Path ${event.rawPath} not found`,
    }),
  };
};
