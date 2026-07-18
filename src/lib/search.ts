export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function tavilySearch(query: string, maxResults = 5): Promise<SearchResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      max_results: maxResults,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Tavily API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
}
