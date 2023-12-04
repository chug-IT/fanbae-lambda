import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { auth } from './routes/auth';
import { misc } from './routes/misc';
import { protectedRoute } from './protected-route';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  if (/^\/auth\/v1\/.*$/.test(event.rawPath)) {
    return await auth(event);
  }
  if (/^\/misc\/v1\/.*$/.test(event.rawPath)) {
    return await protectedRoute(misc, event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Path ${event.rawPath} not found`,
    }),
  };
};
