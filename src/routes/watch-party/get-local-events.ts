import { encode } from 'ngeohash';
import { client } from '../../dynamo';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Attendence, WatchParty } from '../../types';

export const getLocalEvents = async (
  lat: string,
  lng: string,
  userEmail: string
) => {
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

  if (!watchParties) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `No watch parties found`,
      }),
    };
  }

  const { Items: currentlyAttending } = await client.send(
    new QueryCommand({
      TableName: 'fanbae',
      IndexName: 'attendeeEmail-index',
      KeyConditionExpression: 'attendeeEmail = :attendeeEmail',
      ExpressionAttributeValues: {
        ':attendeeEmail': userEmail,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Watch parties retrieved successfully`,
      watchParties: (watchParties as WatchParty[]).filter((watchParty) =>
        (currentlyAttending as Attendence[]).every(
          (attendence) => attendence.eventId !== watchParty.eventId
        )
      ),
    }),
  };
};
