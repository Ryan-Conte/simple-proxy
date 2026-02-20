import { getBodyBuffer } from '~/utils/body';
import {
  getProxyHeaders,
  getAfterResponseHeaders,
  cleanupHeadersBeforeProxy,
} from '~/utils/headers';
import {
  createTokenIfNeeded,
  isAllowedToMakeRequest,
  setTokenHeader,
} from '~/utils/turnstile';

export default defineEventHandler(async (event) => {
  // handle cors preflight requests
  if (event.node.req.method === 'OPTIONS') {
    const requestHeaders =
      event.node.req.headers['access-control-request-headers'] || '*';
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods':
        'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': requestHeaders,
      'Access-Control-Max-Age': '86400',
    });
    return setResponseStatus(event, 204);
  }

  // parse destination URL
  const destination = getQuery<{ destination?: string }>(event).destination;
  if (!destination)
    return await sendJson({
      event,
      status: 200,
      data: {
        message: 'Proxy is working as expected',
      },
    });

  if (!(await isAllowedToMakeRequest(event)))
    return await sendJson({
      event,
      status: 401,
      data: {
        error: 'Invalid or missing token',
      },
    });

  // read body
  const body = await getBodyBuffer(event);
  const token = await createTokenIfNeeded(event);

  // proxy
  cleanupHeadersBeforeProxy(event);
  await proxyRequest(event, destination, {
    fetchOptions: {
      redirect: 'follow',
      headers: getProxyHeaders(event.headers),
      body,
    },
    onResponse(outputEvent, response) {
      const headers = getAfterResponseHeaders(response.headers, response.url);
      setResponseHeaders(outputEvent, headers);
      if (token) setTokenHeader(event, token);
    },
  });
});
