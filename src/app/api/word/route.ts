export async function GET() {
  try {
    const response = await fetch('http://localhost:8000/api/word', {
      cache: 'no-store',
    });
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch word' }, { status: 500 });
  }
}
