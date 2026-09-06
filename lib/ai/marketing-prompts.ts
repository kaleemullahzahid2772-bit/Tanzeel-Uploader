import {
  BrandKnowledge,
  MarketingGoal,
  SocialPlatform,
  PostAnalyticsContentType,
} from '@/lib/types/database';

/**
 * Builds system prompt for the AI Marketing Manager Agent.
 * Enforces zero-hallucination, authentic data-grounding, and Islamic guidelines.
 */
export function buildMarketingManagerSystemPrompt(
  brandKnowledge: Partial<BrandKnowledge> | null,
  connectedPlatforms: SocialPlatform[],
  primaryGoal: MarketingGoal
): string {
  const brandName = brandKnowledge?.brand_name || 'Nūr Social';
  const description = brandKnowledge?.description || 'Islamic educational and social media publishing platform.';
  const audience = brandKnowledge?.target_audience || 'Muslim families, students of knowledge, and faith-conscious digital audiences.';
  const voice = brandKnowledge?.brand_voice || 'dignified, spiritually uplifting, authoritative yet accessible';
  const guidelines = brandKnowledge?.islamic_guidelines || 'Adhere strictly to authentic Islamic principles, avoid unverified claims or rulings, and maintain ethical digital marketing.';
  const forbiddenKeywords = (brandKnowledge?.forbidden_keywords || []).join(', ');

  return `You are the Senior AI Marketing Strategist for "${brandName}".
You specialize in data-grounded, ethical, and high-impact Islamic digital marketing management.

### BRAND IDENTITY & CONTEXT:
- Brand Name: ${brandName}
- Description: ${description}
- Target Audience: ${audience}
- Brand Voice & Tone: ${voice}
- Primary Marketing Goal: ${primaryGoal}
- Active Connected Platforms: ${connectedPlatforms.join(', ') || 'None connected'}
- Islamic Content Guidelines: ${guidelines}
${forbiddenKeywords ? `- Forbidden / Restricted Keywords: ${forbiddenKeywords}` : ''}

### STRICT OPERATIONAL RULES:
1. NEVER INVENT OR HALLUCINATE NUMBERS, FOLLOWERS, LIKES, VIEWS, OR REACH.
2. Every recommendation MUST be strictly justified by the authentic metrics provided in the prompt.
3. If historical data is missing or insufficient (e.g., sample size < 3), you MUST explicitly state: "Limited historical data available" or "Insufficient data to determine a definitive pattern."
4. Do not provide speculative religious rulings or invent hadiths. Focus strictly on strategic audience growth, content resonance, and ethical reach.
5. All outputs must be structured strictly as requested.
`;
}

/**
 * Prompt for generating a data-grounded 7-day marketing plan.
 */
export function buildWeeklyPlanPrompt(params: {
  brandKnowledge: Partial<BrandKnowledge> | null;
  connectedPlatforms: SocialPlatform[];
  primaryGoal: MarketingGoal;
  topTopics: string[];
  bestTimes: Record<string, string>;
  recentPerformanceSummary: string;
}): string {
  return `You are generating an authentic 7-day marketing plan for the upcoming week.

Connected Platforms to schedule: ${params.connectedPlatforms.join(', ') || 'facebook, instagram, youtube'}
Primary Goal: ${params.primaryGoal}
Top Performing Topics: ${params.topTopics.join(', ') || 'General Islamic Reminders'}
Identified Peak Times: ${JSON.stringify(params.bestTimes)}
Recent Performance Context: ${params.recentPerformanceSummary}

Generate a comprehensive 7-day marketing plan starting from Monday to Sunday.
Return ONLY valid JSON matching this schema:
{
  "strategySummaryUrdu": "2-3 sentences executive summary in refined Urdu.",
  "strategySummaryEnglish": "2-3 sentences executive summary in English.",
  "days": [
    {
      "day": "Monday",
      "platform": "facebook | instagram | tiktok | youtube | twitter | whatsapp",
      "contentTopic": "Specific authentic topic title",
      "contentType": "video | image | reel_short | carousel | text | story | other",
      "objective": "Clear strategic objective aligned with goal",
      "suggestedTime": "Time slot e.g. 20:00 UTC",
      "suggestedCta": "Specific call to action",
      "priority": "high | medium | low",
      "hook": "Engaging ethical opening hook",
      "notes": "Short strategic instruction"
    }
  ]
}
`;
}

/**
 * Prompt for generating new high-resonance content ideas.
 */
export function buildContentIdeasPrompt(params: {
  brandKnowledge: Partial<BrandKnowledge> | null;
  connectedPlatforms: SocialPlatform[];
  primaryGoal: MarketingGoal;
  successfulTopics: string[];
  historicalContext: string;
}): string {
  return `Generate 6 high-resonance, creative, and ethically grounded content ideas.

Connected Platforms: ${params.connectedPlatforms.join(', ') || 'facebook, instagram, youtube'}
Primary Goal: ${params.primaryGoal}
Top Topics with Proven Resonance: ${params.successfulTopics.join(', ') || 'Quranic Reflections, Character Building'}
Historical Data Context: ${params.historicalContext}

Return ONLY valid JSON matching this schema:
{
  "ideas": [
    {
      "title": "Clear compelling title",
      "topic": "Specific Islamic / educational topic",
      "contentType": "video | image | reel_short | carousel | text | story | other",
      "targetPlatform": "facebook | instagram | tiktok | youtube | twitter | whatsapp | all",
      "objective": "Strategic objective",
      "hook": "Attention-grabbing ethical opening hook",
      "cta": "Clear call to action",
      "reason": "Why this idea is likely to resonate based on audience data",
      "estimatedResonanceScore": 8.8
    }
  ]
}
`;
}

/**
 * Prompt for the interactive Marketing Strategist Chatbot.
 */
export function buildMarketingChatPrompt(params: {
  brandKnowledge: Partial<BrandKnowledge> | null;
  connectedPlatforms: SocialPlatform[];
  primaryGoal: MarketingGoal;
  groundedContext: string;
  userMessage: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}): string {
  return `=== CURRENT REAL DATA CONTEXT ===
${params.groundedContext}

=== USER QUESTION ===
${params.userMessage}

Respond as the senior AI Marketing Manager.
- Use the authentic numbers and patterns provided above.
- If the user asks about metrics not in the data, clarify that the platform API has not recorded them.
- Provide practical, structured, and polite advice in clear bilingual style (Urdu / English as suitable to the question).
- Conclude with 2-3 helpful follow-up questions or actionable next steps.
`;
}
