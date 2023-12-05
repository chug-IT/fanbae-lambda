import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { create } from './create';
import { attend } from './attend';

export const watchParties = async (
  event: APIGatewayProxyEventV2,
  email: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event was called`);

  const [resouce, version, func] = event.rawPath.split('/').slice(1);

  if (func === 'create') {
    return await create(event, email);
  }
  if (func === 'attend') {
    return await attend(event, email);
  }
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Resource: ${resouce}, Version: ${version}, Function: ${func}`,
    }),
  };
};
