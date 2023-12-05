import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

type WatchPartyInput = {
  name: string;
  startDateTime: string;
  placeId: string;
  amenities: string[];
  price: number;
  hostEmail: string;
};

export const create = async (
  event: APIGatewayProxyEventV2
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
  const { name, startDateTime, placeId, amenities, price, hostEmail } =
    JSON.parse(event.body || '{}') as Partial<WatchPartyInput>;

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

  // create event
  try {
    while (true) {
      const uuid = uuidv4();
      const PK = `EVENT#${uuid}`;
      const SK = `EVENT#${uuid}`;
      try {
        await client.send(
          new PutCommand({
            TableName: 'fanbae',
            Item: {
              PK,
              SK,
              name,
              startDateTime,
              placeId,
              amenities,
              price,
              hostEmail,
            },
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
