import { publicPath } from '../../../lib/publicPath';

/** Compact home starters. The row scrolls; shuffle reorders them. */
export const HOME_USE_CASES = [
  {
    id: 'question-refinement',
    label: 'Refine a question',
    icon: 'sparkles',
    prompt: 'Help me understand our contract compliance better',
  },
  {
    id: 'nl-sql',
    label: 'Explore spend',
    icon: 'database',
    prompt: 'What was the total spend in bankruptcy matters last year?',
  },
  {
    id: 'visual-results',
    label: 'Show trends',
    icon: 'chart',
    prompt: 'Show me our spending trends by practice area for Q1',
  },
  {
    id: 'bcp',
    label: 'Draft a BCP',
    icon: 'file',
    prompt: 'Analyse my risks portfolio and build a Business Continuity Plan',
  },
  {
    id: 'questionnaire',
    label: 'Find risk gaps',
    icon: 'search',
    prompt: 'Look into my questionnaire responses and create risks from gaps',
  },
  {
    id: 'glossary',
    label: 'Rewrite glossary',
    icon: 'book',
    prompt: 'Rewrite the residual risk statement using our glossary terms',
  },
  {
    id: 'controls',
    label: 'Map controls',
    icon: 'shield',
    prompt: 'Map our open controls to the frameworks in scope and flag gaps',
  },
  {
    id: 'findings',
    label: 'Summarize findings',
    icon: 'list',
    prompt: 'Summarize the open findings by severity, owner, and due date',
  },
];

/** Exact card model from ARIES-widget `noAgentAccessConfig.ts`. */
export const WELCOME_CARDS = [
  {
    id: 'question-refinement',
    label: 'Refine a compliance question',
    icon: publicPath('aries/icon-question-refinement.svg'),
    description: 'I help refine your questions to get more accurate and useful answers. This includes:',
    bullets: [
      'Clarifying ambiguities in your questions',
      'Adding important context that might be missing',
      'Suggesting better ways to phrase your queries',
      'Breaking complex questions into simpler parts',
    ],
    prompt: 'Help me understand our contract compliance better',
  },
  {
    id: 'nl-sql',
    label: 'Explore spend data',
    icon: publicPath('aries/icon-nl-sql.svg'),
    description:
      'I convert your plain-English questions into SQL so you can explore data without writing queries. This includes:',
    bullets: ['Natural Language Processing', 'Query Generation', 'Automatic Execution'],
    prompt: 'What was the total spend in bankruptcy matters last year?',
  },
  {
    id: 'visual-results',
    label: 'Visualize risk trends',
    icon: publicPath('aries/icon-visual-results.svg'),
    description: 'I can present data in visual formats to make it easier to understand. Features include:',
    bullets: [
      'Converting complex data into charts and graphs',
      'Creating tables for structured information',
      'Highlighting key metrics with visualizations',
      'Generating dashboards for comprehensive overviews',
    ],
    prompt: 'Show me our spending trends by practice area for Q1',
  },
];

export const LIMITATIONS = [
  {
    id: 'ai-assistant',
    label: 'I am an AI-enabled chat assistant, not a person.',
    icon: publicPath('aries/icon-robot.svg'),
  },
  {
    id: 'reliable-data',
    label: 'I use reliable data, but I may not always fully understand your question.',
    icon: publicPath('aries/icon-warning.svg'),
  },
  {
    id: 'response-time',
    label: 'My responses may take a few seconds to generate.',
    icon: publicPath('aries/icon-timelapse.svg'),
  },
];

export const ICON_EXPAND = publicPath('aries/icon-expand.svg');
export const ICON_CLOSE = publicPath('aries/icon-close.svg');
export const AVATAR_BUTTON = publicPath('aries/avatar-button.svg');
