export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

async function handleApiRequest(request, env) {
  try {
    return await env.ASSETS.fetch(request);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 