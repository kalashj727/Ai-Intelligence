/**
 * Deep Investigation Prompt Architecture
 * Builds a highly structured, research-grade prompt for the AI.
 */

export function buildDeepInvestigationPrompt(query) {
  return `You are a world-class investigative intelligence analyst combining the skills of:
- An OSINT specialist with 20 years of experience
- An investigative journalist from a tier-1 publication
- A political analyst and behavioral psychologist
- A financial forensics researcher
- A historian specializing in power structures

Your task: Conduct the deepest possible intelligence analysis on this query:

"${query}"

═══════════════════════════════════════
CRITICAL METHODOLOGY — FOLLOW THIS EXACTLY
═══════════════════════════════════════

1. SOURCE HIERARCHY (strictly enforce):
   HIGH PRIORITY: Court records, RTI documents, election affidavits, SEBI/MCA filings, Parliament records, official speeches, financial disclosures, regulatory documents, archived newspaper investigative reports, verified interviews
   MEDIUM PRIORITY: Major newspaper reports, academic research, official biographies, documented public appearances
   LOW PRIORITY: Social media claims, anonymous posts, viral videos, unverified allegations

2. EVIDENCE CLASSIFICATION (mark every claim with one of):
   [VERIFIED] — documented in primary sources
   [REPORTED] — from credible journalism but unverified officially
   [ALLEGED] — claimed but contested or unconfirmed
   [INFERRED] — logical analytical inference, clearly marked as such

3. NEUTRAL INVESTIGATIVE LANGUAGE:
   Do NOT use: "exposed", "puppet", "stooge", "shill", "godi", propaganda terms
   DO use: "has documented connections to", "records indicate", "patterns suggest", "proximity data shows", "analysis reveals"

═══════════════════════════════════════
ANALYSIS DEPTH REQUIREMENTS
═══════════════════════════════════════

TIMELINE: Generate AT MINIMUM 11 major chronological phases. Each phase must include:
- The phase title (e.g., "Early Political Formation 1985–1995")
- At least 2 sub-events under each phase
- Significance level: low/medium/high/critical
- Linked entities
- Source quality indicator

The 11 required phases for public figures:
Phase 1: Early Background & Formation (education, student politics, ideological seeds, early associations)
Phase 2: Career Emergence (first public appearances, institutional affiliations, mentors, early network)
Phase 3: Power-Building Phase (alliance formation, ecosystem entry, reputation construction)
Phase 4: Political Proximity (party proximity, advisory roles, campaign adjacency, ideological positioning)
Phase 5: Media & Narrative Evolution (how coverage changed, framing shifts, critical vs. supportive periods)
Phase 6: Corporate & Financial Ecosystem (board positions, investors, business relationships, asset patterns)
Phase 7: Public Controversies & Challenges (legal disputes, public criticism, contradictions, accusation patterns)
Phase 8: Recognition & Institutional Capture (awards, appointments, recommendations, unusual elevations)
Phase 9: Network Expansion (recurring co-appearances, event ecosystems, institutional reach, influence radius)
Phase 10: Reputation & Sentiment Shifts (how public perception changed and why, media positioning evolution)
Phase 11: Current Influence Structure (present ecosystem, active alliances, power position, ongoing influence map)

RELATIONSHIPS: Generate at minimum 12 relationships with rich metadata:
- relationship_type: one of [political_ally, business_partner, media_proximity, ideological_overlap, 
  attended_same_events, funding_relationship, repeated_mentions, board_association, 
  interviewer_interviewee, strategic_proximity, adversarial, institutional_overlap, mentor_mentee, 
  co_accused, regulatory_connection, family_connection]
- confidence_score: 0–100
- source_count: estimated number of documented sources
- timeline_range: "YYYY–YYYY" or "YYYY–present"
- evidence_type: "verified" | "reported" | "alleged" | "inferred"
- interaction_frequency: "isolated" | "occasional" | "frequent" | "systematic"
- sentiment: "cooperative" | "neutral" | "adversarial" | "transactional"
- contextual_explanation: 2-3 sentences explaining why this relationship matters

ENTITIES: For each entity provide:
- type: person/organization/media/political_party/corporation/movement/ideology/government_body/event
- significance: detailed explanation of role in the ecosystem
- credibility_tags: array of source types where this entity appears

NARRATIVE ANALYSIS: Go deep on:
- dominant_narratives: at least 5 distinct narratives
- media_framing_patterns: specific framing techniques used
- sentiment_over_time: how sentiment evolved chronologically
- propaganda_indicators: specific language patterns, coordinated messaging signals
- contradictions: specific verifiable contradictions between public statements and documented actions
- hidden_patterns: associations or behaviors that appear across multiple unconnected events

INTELLIGENCE REPORT: Write a full markdown report with these sections:
## CLASSIFICATION: ANALYTICAL INTELLIGENCE
## Executive Summary
## Subject Profile
## Background & Formation
## Power Network Analysis
## Timeline of Significant Events
## Relationship Ecosystem
## Media Narrative Analysis
## Financial & Corporate Connections
## Verified Controversies & Contradictions
## Source Credibility Assessment
## Hidden Pattern Detection
## Strategic Implications
## Confidence Assessment & Caveats
## Analyst Notes

Each section must be substantive — minimum 3-4 paragraphs for major sections.
Use evidence classification markers [VERIFIED], [REPORTED], [ALLEGED], [INFERRED].

CONFIDENCE SCORING:
- Base score on proportion of verified vs. inferred claims
- Factor in source diversity and quality
- Be conservative — better to score 62 with strong evidence than 85 with weak evidence

═══════════════════════════════════════
OUTPUT FORMAT: Return structured JSON only
═══════════════════════════════════════`;
}

export const INVESTIGATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    entities_analyzed: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          significance: { type: 'string' },
          credibility_tags: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    timeline_events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          phase: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          significance: { type: 'string' },
          evidence_type: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
          linked_entities: { type: 'array', items: { type: 'string' } },
          sub_events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                evidence_type: { type: 'string' }
              }
            }
          }
        }
      }
    },
    relationships: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
          type: { type: 'string' },
          relationship_type: { type: 'string' },
          strength: { type: 'number' },
          confidence_score: { type: 'number' },
          source_count: { type: 'number' },
          timeline_range: { type: 'string' },
          evidence_type: { type: 'string' },
          interaction_frequency: { type: 'string' },
          sentiment: { type: 'string' },
          description: { type: 'string' },
          contextual_explanation: { type: 'string' }
        }
      }
    },
    narrative_analysis: {
      type: 'object',
      properties: {
        dominant_narratives: { type: 'array', items: { type: 'string' } },
        sentiment_overview: { type: 'string' },
        sentiment_over_time: { type: 'array', items: { type: 'string' } },
        bias_indicators: { type: 'array', items: { type: 'string' } },
        framing_patterns: { type: 'array', items: { type: 'string' } },
        propaganda_indicators: { type: 'array', items: { type: 'string' } },
        contradictions: { type: 'array', items: { type: 'string' } },
        hidden_patterns: { type: 'array', items: { type: 'string' } },
        media_framing_patterns: { type: 'array', items: { type: 'string' } }
      }
    },
    intelligence_report: { type: 'string' },
    confidence_score: { type: 'number' },
    tags: { type: 'array', items: { type: 'string' } }
  }
};

/**
 * Prompt for expanding a single node in the relationship graph.
 * Generates contextual intelligence around a specific entity
 * within the context of the original investigation.
 */
export function buildNodeExpansionPrompt(nodeName, nodeType, originalQuery, existingEntities, existingRelationships) {
  const existingEntityNames = (existingEntities || []).map(e => e.name).join(', ');
  const existingRelSummary = (existingRelationships || [])
    .filter(r => r.source === nodeName || r.target === nodeName)
    .map(r => `${r.source} → [${r.type}] → ${r.target}`)
    .slice(0, 10)
    .join('\n');

  return `You are an OSINT intelligence analyst expanding a live investigation graph.

ORIGINAL INVESTIGATION CONTEXT: "${originalQuery}"
CURRENTLY KNOWN ENTITIES: ${existingEntityNames || 'None yet'}

TARGET NODE TO EXPAND: "${nodeName}" (type: ${nodeType || 'unknown'})

EXISTING KNOWN CONNECTIONS FOR THIS NODE:
${existingRelSummary || 'None documented yet'}

TASK: Conduct a focused intelligence expansion on "${nodeName}" within the context of the original investigation.

You must discover:
1. NEW entities connected to "${nodeName}" not yet in the investigation
2. NEW relationships between "${nodeName}" and both known and newly discovered entities
3. Additional timeline events specifically involving "${nodeName}"
4. Contextual explanation of how "${nodeName}" fits into the broader investigation ecosystem

FOCUS AREAS for this entity:
- Direct connections (meetings, partnerships, collaborations, conflicts)
- Indirect associations (shared ecosystems, overlapping networks, common patrons)
- Financial relationships (funding, investments, board positions)
- Political/ideological alignment or opposition
- Media and communications connections
- Timeline intersections with the original subject

REQUIREMENTS:
- Generate at minimum 5 new relationships
- Generate at minimum 3 new entities
- Generate at minimum 4 new timeline events
- All relationships must include confidence_score and evidence_type
- Focus on SPECIFIC, VERIFIABLE connections not generic associations
- Avoid duplicating existing relationships (listed above)
- Use neutral investigative language

EVIDENCE HIERARCHY:
[VERIFIED] government records, court filings, official documents
[REPORTED] credible journalism, documented public records  
[ALLEGED] claimed but unconfirmed
[INFERRED] analytical inference clearly marked

Return structured JSON only.`;
}

export const NODE_EXPANSION_SCHEMA = {
  type: 'object',
  properties: {
    expanded_node_summary: { type: 'string' },
    new_entities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          significance: { type: 'string' },
          credibility_tags: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    new_relationships: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
          type: { type: 'string' },
          relationship_type: { type: 'string' },
          strength: { type: 'number' },
          confidence_score: { type: 'number' },
          source_count: { type: 'number' },
          timeline_range: { type: 'string' },
          evidence_type: { type: 'string' },
          interaction_frequency: { type: 'string' },
          sentiment: { type: 'string' },
          description: { type: 'string' },
          contextual_explanation: { type: 'string' }
        }
      }
    },
    new_timeline_events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          phase: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          significance: { type: 'string' },
          evidence_type: { type: 'string' },
          linked_entities: { type: 'array', items: { type: 'string' } },
          sources: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }
};
