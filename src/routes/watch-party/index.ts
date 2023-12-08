import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { create } from './create';
import { list } from './list';

export const watchParties = async (
  event: APIGatewayProxyEventV2,
  email: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event was called`);

  const [resouce, version, func] = event.rawPath.split('/').slice(1);

  const { method } = event.requestContext.http;
  if (method === 'GET') {
    return await list(event, email);
  }

  if (func === 'create') {
    return await create(event, email);
  }
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Resource: ${resouce}, Version: ${version}, Function: ${func}`,
    }),
  };
};
