import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { create } from './create';

export const attendence = async (
  event: APIGatewayProxyEventV2,
  email: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Attendence was called`);

  const [resouce, version, func] = event.rawPath.split('/').slice(1);

  const { method } = event.requestContext.http;
  if (method === 'POST') {
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
