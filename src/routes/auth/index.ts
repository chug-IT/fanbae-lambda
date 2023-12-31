import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { login } from './login';
import { register } from './register';
import { protectedRoute } from '../../protected-route';
import { chooseInterests } from './choose-interests';

export const auth = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`Auth was called`);

  const [resouce, version, func] = event.rawPath.split('/').slice(1);

  if (func === 'login') {
    return await login(event);
  } else if (func === 'register') {
    return await register(event);
  } else if (func === 'choose-interests') {
    return protectedRoute(chooseInterests, event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: `Not found`,
      info: `Resource: ${resouce}, Version: ${version}, Function: ${func}`,
    }),
  };
};
