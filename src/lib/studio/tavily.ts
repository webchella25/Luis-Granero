interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  answer?: string;
  results: TavilyResult[];
}

export async function searchCaseContext(query: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      search_depth: 'advanced',
      max_results: 7,
      include_answer: true,
      topic: 'general',
    }),
  });

  if (!res.ok) {
    console.warn(`[tavily] Error ${res.status} — se generará sin contexto web`);
    return '';
  }

  const data = (await res.json()) as TavilyResponse;

  const parts: string[] = [];

  if (data.answer?.trim()) {
    parts.push(`Resumen: ${data.answer.trim()}`);
  }

  const topResults = data.results
    .filter((r) => r.score > 0.3)
    .slice(0, 6)
    .map((r) => `[${r.title}]\n${r.content.trim().slice(0, 1500)}`)
    .join('\n\n');

  if (topResults) parts.push(topResults);

  return parts.join('\n\n');
}
