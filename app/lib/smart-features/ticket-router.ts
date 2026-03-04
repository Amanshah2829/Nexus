/**
 * Intelligent ticket routing and categorization
 * Automatically routes tickets to the best engineer based on expertise and workload
 */

export interface TicketRoutingResult {
  suggestedEngineer: string;
  suggestedCategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reason: string;
}

export interface EngineerProfile {
  id: string;
  name: string;
  expertise: string[];
  currentWorkload: number;
  avgResolutionTime: number;
  satisfactionRating: number;
  isAvailable: boolean;
}

/**
 * Categorize ticket based on title and description
 */
export function categorizeTicket(title: string, description: string): string {
  const content = `${title} ${description}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    technical: ['error', 'bug', 'crash', 'not working', 'issue', 'problem', 'failed', 'timeout'],
    billing: ['invoice', 'payment', 'charge', 'subscription', 'billing', 'refund'],
    account: ['account', 'login', 'password', 'reset', 'access', 'permission', 'role'],
    feature_request: ['feature', 'request', 'enhancement', 'add', 'implement', 'improve'],
    other: [],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

/**
 * Detect priority based on keywords and content
 */
export function detectPriority(title: string, description: string): 'low' | 'medium' | 'high' | 'critical' {
  const content = `${title} ${description}`.toLowerCase();

  const criticalKeywords = ['urgent', 'critical', 'emergency', 'down', 'production', 'all users'];
  const highKeywords = ['important', 'high', 'serious', 'block', 'prevent'];
  const mediumKeywords = ['moderate', 'normal', 'regular'];

  if (criticalKeywords.some((keyword) => content.includes(keyword))) {
    return 'critical';
  }
  if (highKeywords.some((keyword) => content.includes(keyword))) {
    return 'high';
  }
  if (mediumKeywords.some((keyword) => content.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

/**
 * Route ticket to best available engineer
 */
export function routeTicket(
  ticketCategory: string,
  ticketPriority: string,
  engineers: EngineerProfile[]
): TicketRoutingResult {
  // Filter available engineers with matching expertise
  const eligibleEngineers = engineers.filter(
    (eng) => eng.isAvailable && eng.expertise.includes(ticketCategory)
  );

  if (eligibleEngineers.length === 0) {
    // Fallback to all available engineers
    const allAvailable = engineers.filter((eng) => eng.isAvailable);
    if (allAvailable.length === 0) {
      return {
        suggestedEngineer: 'unassigned',
        suggestedCategory: ticketCategory,
        priority: ticketPriority as any,
        confidence: 0.3,
        reason: 'No available engineers. Ticket queued for assignment.',
      };
    }
    return scoreAndSelectEngineer(allAvailable, ticketCategory, ticketPriority);
  }

  return scoreAndSelectEngineer(eligibleEngineers, ticketCategory, ticketPriority);
}

/**
 * Score engineers and select the best match
 */
function scoreAndSelectEngineer(
  engineers: EngineerProfile[],
  ticketCategory: string,
  ticketPriority: string
): TicketRoutingResult {
  const scored = engineers.map((eng) => {
    let score = 0;

    // Expertise match (40%)
    const expertiseBonus = eng.expertise.includes(ticketCategory) ? 40 : 20;
    score += expertiseBonus;

    // Workload balance (35%) - Lower workload is better
    const workloadScore = Math.max(0, 35 - eng.currentWorkload * 5);
    score += workloadScore;

    // Performance history (25%)
    const performanceScore = eng.avgResolutionTime < 4 ? 25 : 15;
    score += performanceScore;

    // Priority adjustment
    if (ticketPriority === 'critical' && eng.satisfactionRating >= 4.5) {
      score += 10;
    }

    return { engineer: eng, score };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0];
  const maxScore = 100;
  const confidence = Math.min(1, best.score / maxScore);

  return {
    suggestedEngineer: best.engineer.id,
    suggestedCategory: ticketCategory,
    priority: ticketPriority as any,
    confidence,
    reason: `Routed to ${best.engineer.name} based on expertise match and current workload.`,
  };
}

/**
 * Detect duplicate tickets
 */
export function detectDuplicates(
  newTitle: string,
  newDescription: string,
  existingTickets: Array<{ title: string; description: string; id: string }>
): Array<{ id: string; similarity: number }> {
  const newContent = `${newTitle} ${newDescription}`.toLowerCase();
  const duplicates: Array<{ id: string; similarity: number }> = [];

  for (const ticket of existingTickets) {
    const existingContent = `${ticket.title} ${ticket.description}`.toLowerCase();
    const similarity = calculateSimilarity(newContent, existingContent);

    if (similarity > 0.7) {
      duplicates.push({ id: ticket.id, similarity });
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function getEditDistance(s1: string, s2: string): number {
  const costs = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

/**
 * Generate suggested response template
 */
export function getSuggestedResponse(category: string, keywords: string[]): string {
  const templates: Record<string, Record<string, string>> = {
    technical: {
      error: 'Thank you for reporting this issue. We are investigating the error you mentioned. Could you please share any error messages or screenshots?',
      timeout: 'We are aware of performance issues on our platform. Our team is working on a fix. In the meantime, try clearing your browser cache.',
      crash: 'We apologize for the inconvenience. Our technical team is working on resolving the crash. We will update you shortly.',
    },
    billing: {
      invoice: 'Your invoice has been sent to your registered email. If you do not see it, please check your spam folder.',
      refund: 'We have initiated your refund request. It typically takes 5-7 business days for the amount to reflect in your account.',
      subscription: 'You can manage your subscription settings in your account dashboard. Would you like help navigating to that section?',
    },
    account: {
      password: 'You can reset your password by clicking the "Forgot Password" link on the login page. You will receive an email with instructions.',
      access: 'We are investigating your access issue. In the meantime, please try logging out and logging back in.',
      permission: 'Your access permissions are managed by your organization admin. Please contact them for permission changes.',
    },
  };

  const categoryTemplates = templates[category] || {};

  for (const keyword of keywords) {
    if (categoryTemplates[keyword]) {
      return categoryTemplates[keyword];
    }
  }

  return 'Thank you for reaching out. We are looking into your request and will get back to you shortly.';
}
