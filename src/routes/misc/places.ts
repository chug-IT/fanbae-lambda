import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { client as maps } from '../../google-maps';

export const places = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Places was called`);
  try {
    const { query } = event.queryStringParameters || {};
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Missing query parameter`,
        }),
      };
    }

    const placeAutocompleteReponse = await maps.placeAutocomplete({
      params: {
        input: query,
        key: process.env.GOOGLE_KEY!,
      },
    });

    const { predictions } = placeAutocompleteReponse.data;
    return {
      statusCode: 200,
      body: JSON.stringify({ predictions }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error`,
        info: error,
      }),
    };
  }
};
