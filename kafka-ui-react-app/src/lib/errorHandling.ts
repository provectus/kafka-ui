import { ServerResponse } from 'redux/interfaces';

const getJson = (response: Response) => response.json();
export const getResponse = async (
  response: Response
): Promise<ServerResponse> => {
  let body;
  try {
    body = await getJson(response);
  } catch (e) {
    // do nothing;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    body,
  };
};
