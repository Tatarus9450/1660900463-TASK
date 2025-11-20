export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch('http://localhost:8000/api/validate-sentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return Response.json({ error: 'Failed to validate sentence' }, { status: 500 });
  }
}
