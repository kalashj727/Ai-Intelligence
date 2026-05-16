const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(query) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are NEXUS, a multi-agent investigative intelligence platform. Analyze the following query and provide a structured intelligence report:

Query: "${query}"

Provide your response in this exact JSON format:
{
  "title": "Investigation Title",
  "summary": "Executive summary of findings",
  "entities_analyzed": ["Entity 1", "Entity 2"],
  "timeline_events": [
    {"date": "YYYY-MM-DD", "event": "Event description", "significance": "high/medium/low"}
  ],
  "relationships": [
    {"source": "Entity A", "target": "Entity B", "type": "financial/political/personal", "evidence": "Description"}
  ],
  "narrative_analysis": {
    "main_narrative": "Primary media narrative",
    "contradictions": ["Contradiction 1"],
    "propaganda_signals": ["Signal 1"]
  },
  "intelligence_report": "Detailed analysis report",
  "confidence_score": 85,
  "tags": ["tag1", "tag2"]
}

Be thorough, analytical, and provide specific details. Include dates, names, and concrete evidence where possible.`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  // Parse the JSON from Gemini's text response
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
}
