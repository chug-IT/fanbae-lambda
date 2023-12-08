import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { client } from '../../dynamo';
import { WatchParty } from '../../types';

export const getAsHost = async (email: string) => {
  console.log(`getEventsHosting was called`);

  const { Items } = await client.send(
    new QueryCommand({
      TableName: 'fanbae',
      IndexName: 'hostEmail-index',
      KeyConditionExpression: 'hostEmail = :hostEmail',
      ExpressionAttributeValues: {
        ':hostEmail': email,
      },
    })
  );

  if (!Items) {
    return [];
  }

  return Items as WatchParty[];
};
