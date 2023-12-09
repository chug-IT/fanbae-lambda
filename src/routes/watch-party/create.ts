import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { encode } from 'ngeohash';
import { client as google } from '../../google-maps';
import { WatchParty } from '../../types';

type WatchPartyInput = {
  name: string;
  startDateTime: number;
  placeId: string;
  amenities: string[];
  price: number;
  hostEmail: string;
};

export const create = async (
  event: APIGatewayProxyEventV2,
  hostEmail: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event create was called`);

  // validate request
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }

  // parse and validate body
  const { name, startDateTime, placeId, amenities, price } = JSON.parse(
    event.body || '{}'
  ) as Partial<WatchPartyInput>;

  if (
    !name ||
    !startDateTime ||
    !placeId ||
    !amenities ||
    !price ||
    !hostEmail
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Missing required fields`,
        info: `name: ${name}, date: ${startDateTime}, placeId: ${placeId}, amenities: ${amenities}, price: ${price}, hostEmail: ${hostEmail}`,
      }),
    };
  }

  const {
    data: {
      result: { geometry },
    },
  } = await google.placeDetails({
    params: { place_id: placeId, key: process.env.GOOGLE_KEY! },
  });
  if (!geometry) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid placeId`,
        info: `placeId: ${placeId}`,
      }),
    };
  }

  const { lat, lng } = geometry.location;
  const geohash = encode(lat, lng, 2);

  // create event
  try {
    while (true) {
      const uuid = uuidv4();
      const PK = `EVENT#${geohash}`;
      const SK = `EVENT#${uuid}`;
      try {
        await client.send(
          new PutCommand({
            TableName: 'fanbae',
            Item: {
              PK,
              SK,
              geohash,
              name,
              startDateTime,
              placeId,
              amenities,
              price,
              hostEmail,
              eventId: uuid,
            } as WatchParty,
            ConditionExpression:
              'attribute_not_exists(pk) AND attribute_not_exists(sk)',
          })
        );
        break;
      } catch (error) {
        console.error(error);
        if (
          error instanceof Error &&
          error.name === 'ConditionalCheckFailedException'
        ) {
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error`,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Event ${name} created`,
    }),
  };
};
