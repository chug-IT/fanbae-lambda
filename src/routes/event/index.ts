import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { create } from './create';

export const event = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event was called`);

  const [resouce, version, func] = event.rawPath.split('/').slice(1);

  if (func === 'create') {
    return await create(event);
  }
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Resource: ${resouce}, Version: ${version}, Function: ${func}`,
    }),
  };
};
