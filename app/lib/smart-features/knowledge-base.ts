/**
 * Knowledge base and self-service support
 * FAQs, articles, and searchable documentation
 */

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  featured: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  lastUpdated: Date;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  type: 'article' | 'faq';
}

/**
 * Knowledge base manager
 */
export class KnowledgeBase {
  private articles: KnowledgeArticle[] = [];
  private faqs: FAQ[] = [];

  /**
   * Add article
   */
  addArticle(article: Omit<KnowledgeArticle, 'views' | 'helpful' | 'notHelpful'>): KnowledgeArticle {
    const newArticle: KnowledgeArticle = {
      ...article,
      views: 0,
      helpful: 0,
      notHelpful: 0,
    };
    this.articles.push(newArticle);
    return newArticle;
  }

  /**
   * Add FAQ
   */
  addFAQ(faq: Omit<FAQ, 'views' | 'lastUpdated'>): FAQ {
    const newFAQ: FAQ = {
      ...faq,
      views: 0,
      lastUpdated: new Date(),
    };
    this.faqs.push(newFAQ);
    return newFAQ;
  }

  /**
   * Search knowledge base
   */
  search(query: string, limit = 10): SearchResult[] {
    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search articles
    for (const article of this.articles) {
      const titleMatch = this.calculateRelevance(searchTerm, article.title);
      const contentMatch = this.calculateRelevance(searchTerm, article.content);
      const relevance = Math.max(titleMatch, contentMatch);

      if (relevance > 0.3) {
        results.push({
          id: article.id,
          title: article.title,
          excerpt: this.getExcerpt(article.content, searchTerm),
          relevance,
          type: 'article',
        });
      }
    }

    // Search FAQs
    for (const faq of this.faqs) {
      const questionMatch = this.calculateRelevance(searchTerm, faq.question);
      const answerMatch = this.calculateRelevance(searchTerm, faq.answer);
      const relevance = Math.max(questionMatch, answerMatch);

      if (relevance > 0.3) {
        results.push({
          id: faq.id,
          title: faq.question,
          excerpt: this.getExcerpt(faq.answer, searchTerm),
          relevance,
          type: 'faq',
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  /**
   * Get suggested articles for ticket category
   */
  getSuggestedArticles(category: string, limit = 5): KnowledgeArticle[] {
    return this.articles
      .filter((a) => a.category === category || a.tags.includes(category))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * Get featured articles
   */
  getFeaturedArticles(limit = 3): KnowledgeArticle[] {
    return this.articles
      .filter((a) => a.featured)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * Get popular categories
   */
  getCategories(): string[] {
    const categorySet = new Set<string>();
    this.articles.forEach((a) => categorySet.add(a.category));
    return Array.from(categorySet).sort();
  }

  /**
   * Mark article as helpful
   */
  markHelpful(articleId: string): void {
    const article = this.articles.find((a) => a.id === articleId);
    if (article) {
      article.helpful++;
      article.views++;
    }
  }

  /**
   * Mark article as not helpful
   */
  markNotHelpful(articleId: string): void {
    const article = this.articles.find((a) => a.id === articleId);
    if (article) {
      article.notHelpful++;
      article.views++;
    }
  }

  /**
   * Get helpfulness score
   */
  getHelpfulnessScore(articleId: string): number {
    const article = this.articles.find((a) => a.id === articleId);
    if (!article || article.helpful + article.notHelpful === 0) return 0;
    return article.helpful / (article.helpful + article.notHelpful);
  }

  /**
   * Calculate relevance of search term in text
   */
  private calculateRelevance(searchTerm: string, text: string): number {
    const lowerText = text.toLowerCase();
    const words = searchTerm.split(' ');

    let matchedWords = 0;
    for (const word of words) {
      if (lowerText.includes(word)) {
        matchedWords++;
      }
    }

    return matchedWords / Math.max(1, words.length);
  }

  /**
   * Extract excerpt around search term
   */
  private getExcerpt(text: string, searchTerm: string, length = 150): string {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(searchTerm);

    if (index === -1) {
      return text.substring(0, length) + '...';
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + length);
    const excerpt = text.substring(start, end);

    return (start > 0 ? '...' : '') + excerpt + (end < text.length ? '...' : '');
  }
}

/**
 * Self-service recommendation engine
 */
export class SelfServiceRecommender {
  constructor(private knowledgeBase: KnowledgeBase) {}

  /**
   * Get recommendations based on ticket
   */
  getRecommendations(
    title: string,
    description: string,
    category: string
  ): KnowledgeArticle[] {
    const searchQuery = `${title} ${description}`;
    const searchResults = this.knowledgeBase.search(searchQuery, 3);

    const suggestedArticles = this.knowledgeBase.getSuggestedArticles(category, 2);

    const allResults = [
      ...searchResults.map((r) => ({
        id: r.id,
        relevance: r.relevance,
      })),
      ...suggestedArticles.map((a) => ({
        id: a.id,
        relevance: 0.5,
      })),
    ];

    const uniqueIds = new Set(allResults.map((r) => r.id));
    const recommendations: KnowledgeArticle[] = [];

    for (const id of uniqueIds) {
      const article = this.knowledgeBase['articles'].find((a) => a.id === id);
      if (article) {
        recommendations.push(article);
      }
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Check if ticket question is likely in knowledge base
   */
  hasKnownSolution(title: string, description: string): boolean {
    const results = this.knowledgeBase.search(`${title} ${description}`, 1);
    return results.length > 0 && results[0].relevance > 0.7;
  }
}

// Sample knowledge base data
export const SAMPLE_ARTICLES: Array<Omit<KnowledgeArticle, 'views' | 'helpful' | 'notHelpful'>> = [
  {
    id: 'article-001',
    title: 'How to reset your password',
    content: 'You can reset your password by clicking the "Forgot Password" link on the login page...',
    category: 'account',
    tags: ['password', 'login', 'account'],
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'Support Team',
    featured: true,
  },
  {
    id: 'article-002',
    title: 'Common technical issues and solutions',
    content: 'If you are experiencing performance issues, try clearing your browser cache...',
    category: 'technical',
    tags: ['performance', 'cache', 'browser'],
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'Engineering Team',
    featured: true,
  },
  {
    id: 'article-003',
    title: 'Understanding your billing statement',
    content: 'Your billing statement shows all charges for the current billing period...',
    category: 'billing',
    tags: ['invoice', 'payment', 'subscription'],
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'Finance Team',
    featured: false,
  },
];

export const SAMPLE_FAQS: Array<Omit<FAQ, 'views' | 'lastUpdated'>> = [
  {
    id: 'faq-001',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers.',
    category: 'billing',
  },
  {
    id: 'faq-002',
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer:
      'Yes, you can change your plan at any time. Changes take effect at the next billing cycle.',
    category: 'billing',
  },
  {
    id: 'faq-003',
    question: 'How do I delete my account?',
    answer: 'You can delete your account from the Settings page. This action is irreversible.',
    category: 'account',
  },
];
