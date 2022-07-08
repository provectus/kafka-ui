import { ServerResponse } from 'redux/interfaces';

export const getResponse = async (
  response: Response
): Promise<ServerResponse> => {
  let body;
  try {
    body = await response.json();
  } catch (e) {
    // do nothing;
  }
  return {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    message: body?.message,
  };
};
