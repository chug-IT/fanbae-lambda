import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { auth } from './routes/auth';
import { misc } from './routes/misc';
import { protectedRoute } from './protected-route';
import { watchParties } from './routes/watch-party';
import { attendence } from './routes/attendence';

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  if (/^\/auth\/v1(\/.*)*$/.test(event.rawPath)) {
    return await auth(event);
  }
  if (/^\/misc\/v1(\/.*)*$/.test(event.rawPath)) {
    return await protectedRoute(misc, event);
  }
  if (/^\/watch-party\/v1(\/.*)*$/.test(event.rawPath)) {
    return await protectedRoute(watchParties, event);
  }
  if (/^\/attendence\/v1(\/.*)*$/.test(event.rawPath)) {
    return await protectedRoute(attendence, event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Path ${event.rawPath} not found`,
    }),
  };
};
