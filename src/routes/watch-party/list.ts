import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { encode } from 'ngeohash';

export const list = async (
  event: APIGatewayProxyEventV2,
  hostEmail: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event list was called`);

  // validate request
  if (event.requestContext.http.method !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }

  const { lat, lng } = event.queryStringParameters || {};
  if (!lat || !lng) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Missing required fields`,
        info: `lat: ${lat}, lng: ${lng}`,
      }),
    };
  }
  const geohash = encode(parseFloat(lat), parseFloat(lng), 4);

  const { Items: watchParties } = await client.send(
    new QueryCommand({
      TableName: 'fanbae',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `EVENT#${geohash}`,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Watch parties retrieved successfully`,
      watchParties,
    }),
  };
};
