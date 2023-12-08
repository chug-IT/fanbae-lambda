import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client } from '../../dynamo';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const create = async (
  event: APIGatewayProxyEventV2,
  attendeeEmail: string
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Attendence create was called`);

  // validate request
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed`,
      }),
    };
  }

  const { eventId } = JSON.parse(event.body || '{}');

  if (!eventId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Missing required fields`,
        info: `eventId: ${eventId}`,
      }),
    };
  }

  const PK = `ATTENDENCE#${eventId}`;
  const SK = `ATTENDENCE#${attendeeEmail}`;

  try {
    await client.send(
      new PutCommand({
        TableName: 'fanbae',
        Item: {
          PK,
          SK,
          attendeeEmail,
          eventId,
        },
        ConditionExpression:
          'attribute_not_exists(PK) AND attribute_not_exists(SK)',
      })
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message.includes('ConditionalCheckFailedException')
    ) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: `Attendence already exists`,
          info: `eventId: ${eventId}, attendeeEmail: ${attendeeEmail}`,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error`,
        info: `eventId: ${eventId}, attendeeEmail: ${attendeeEmail}`,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Attendence created successfully`,
      info: `eventId: ${eventId}, attendeeEmail: ${attendeeEmail}`,
    }),
  };
};
