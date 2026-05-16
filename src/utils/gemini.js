const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(query) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Check Vercel Environment Variables.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are NEXUS, an intelligence analysis platform. Analyze this query and provide a structured report: "${query}"

Return ONLY a valid JSON object in this exact format:
{
  "title": "Investigation Title",
  "summary": "Executive summary",
  "entities_analyzed": ["Name 1", "Name 2"],
  "timeline_events": [{"date": "2024-01-01", "event": "Event desc", "significance": "high"}],
  "relationships": [{"source": "A", "target": "B", "type": "political", "evidence": "Details"}],
  "narrative_analysis": {"main_narrative": "Main story", "contradictions": ["Contradiction 1"], "propaganda_signals": ["Signal 1"]},
  "intelligence_report": "Full detailed report text here",
  "confidence_score": 85,
  "tags": ["tag1", "tag2"]
}`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Gemini API error');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // If no JSON block, try parsing the whole text
    return JSON.parse(text);
  } catch (e) {
    // If Gemini returns plain text instead of JSON, wrap it
    return {
      title: query,
      summary: text.substring(0, 500),
      entities_analyzed: [],
      timeline_events: [],
      relationships: [],
      narrative_analysis: { main_narrative: text, contradictions: [], propaganda_signals: [] },
      intelligence_report: text,
      confidence_score: 70,
      tags: []
    };
  }
}
