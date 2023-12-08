import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { client } from '../../dynamo';
import { WatchParty } from '../../types';

export const getAsAttendee = async (email: string): Promise<WatchParty[]> => {
  console.log(`getEventsAttending was called`);
  console.log(`email: ${email}`);

  const { Items: attendenceRecords } = await client.send(
    new QueryCommand({
      TableName: 'fanbae',
      IndexName: 'attendeeEmail-index',
      KeyConditionExpression: 'attendeeEmail = :attendeeEmail',
      ExpressionAttributeValues: {
        ':attendeeEmail': email,
      },
    })
  );

  console.log(`attendenceRecords: ${JSON.stringify(attendenceRecords)}`);

  if (!attendenceRecords) {
    return [];
  }

  const watchParties = await Promise.all(
    attendenceRecords.map(async (attendence) => {
      const { Items } = await client.send(
        new QueryCommand({
          TableName: 'fanbae',
          IndexName: 'eventId-index',
          KeyConditionExpression: 'eventId = :eventId',
          ExpressionAttributeValues: {
            ':eventId': attendence.eventId,
          },
        })
      );

      if (!Items) {
        return null;
      }

      return Items[0] as WatchParty;
    })
  );

  console.log(`watchParties: ${JSON.stringify(watchParties)}`);

  return watchParties.filter(
    (watchParty) => watchParty !== null
  ) as WatchParty[];
};
