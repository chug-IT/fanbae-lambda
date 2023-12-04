import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { places } from './places';

export const misc = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Misc was called`);

  const [resouce, version, func] = event.rawPath.split('/').slice(1);

  if (func === 'places') {
    return await places(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Resource: ${resouce}, Version: ${version}, Function: ${func}`,
    }),
  };
};
