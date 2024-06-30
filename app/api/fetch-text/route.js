import { JSDOM } from 'jsdom';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const textContent = Array.from(dom.window.document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
      .map(el => el.textContent)
      .join(' ');

    return new Response(JSON.stringify({ text: textContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching text from URL:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch text from URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
