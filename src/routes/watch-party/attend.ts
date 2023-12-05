import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

type AttendInput = {
  eventId: string;
};

export const attend = async (
  event: APIGatewayProxyEventV2,
  email: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Event attend was called`);

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
  const { eventId } = JSON.parse(event.body || '{}') as Partial<AttendInput>;

  if (!eventId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Missing required fields`,
        info: `eventId: ${eventId}`,
      }),
    };
  }

  // create event
  try {
    const PK = `EVENT#${eventId}`;
    const SK = `ATTEND#${email}`;
    await client.send(
      new PutCommand({
        TableName: 'fanbae',
        Item: {
          PK,
          SK,
          email,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      })
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.name === 'ConditionalCheckFailedException'
    ) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: `Attendee with email ${email} already exists`,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error`,
      }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Attendee created successfully`,
    }),
  };
};
