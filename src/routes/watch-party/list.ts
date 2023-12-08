import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { encode } from 'ngeohash';
import { Attendence, WatchParty } from '../../types';
import { getLocalEvents } from './get-local-events';
import { getAsHost } from './get-as-host';
import { getAsAttendee } from './get-as-attendee';

export const list = async (
  event: APIGatewayProxyEventV2,
  userEmail: string
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

  const { type } = event.queryStringParameters || {};

  if (!type) {
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
    const watchParties = await getLocalEvents(lat, lng, userEmail);
    return {
      statusCode: 200,
      body: JSON.stringify(watchParties),
    };
  }

  if (type === 'host') {
    const watchParties = await getAsHost(userEmail);
    return {
      statusCode: 200,
      body: JSON.stringify({ watchParties }),
    };
  }

  if (type === 'attendee') {
    const watchParties = await getAsAttendee(userEmail);
    return {
      statusCode: 200,
      body: JSON.stringify({ watchParties }),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: `Invalid type`,
      info: `type: ${type}`,
    }),
  };
};
