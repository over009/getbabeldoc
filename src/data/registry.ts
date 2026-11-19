import WordCounter from '../tools/word-counter.astro';

/**
 * Tool registry.
 *
 * A new tool is two steps:
 * 1. Add `src/tools/<slug>.astro` for the interactive UI. Give it no required props.
 * 2. Add one object to `tools` below. The slug becomes `/tools/<slug>/`.
 *
 * Do not add a new route file. `src/pages/tools/[slug].astro` reads this list.
 * When you link related tools, add the slug on both pages.
 */

export const categories = [
  {
    id: 'text',
    name: 'Text',
    description: 'Count and review writing without leaving the browser.',
  },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export interface ToolSection {
  heading: string;
  paragraphs: string[];
  subsections?: {
    heading: string;
    paragraphs: string[];
  }[];
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  h1: string;
  title: string;
  description: string;
  ogTitle: string;
  category: CategoryId;
  cardBlurb: string;
  buttonLabel: string;
  intro: string;
  disclaimer: string;
  howToTitle: string;
  howTo: string[];
  sections: ToolSection[];
  faqs: ToolFaq[];
  related: string[];
  added: string;
  browserRequirements: string;
  component: typeof WordCounter;
}

export const tools: ToolDefinition[] = [
  {
    // Placeholder sample tool. Proves the shared tool-page template.
    slug: 'word-counter',
    name: 'Word Counter',
    h1: 'Word Counter',
    title: 'Word Counter — Count Words and Characters | BabelDoc',
    description:
      'Count words, characters, sentences, and paragraphs in your browser. Paste text and see totals update instantly. Nothing is uploaded. Try the free word counter.',
    ogTitle: 'Word Counter — free, instant, in your browser',
    category: 'text',
    cardBlurb: 'Count words, characters, sentences, and paragraphs as you type.',
    buttonLabel: 'Count words',
    intro:
      'Paste or type text and get a live word count, plus characters, sentences, paragraphs, and an estimated reading time. The count happens in your browser.',
    disclaimer:
      'Counts follow the rules in the sections below. They are a convenience, not a grading, legal, or publishing standard. Your text stays in this browser.',
    howToTitle: 'How to use this word counter',
    howTo: [
      'Paste or type your text into the box. You can replace it whenever you want.',
      'Read the totals under the box. Words, characters, sentences, paragraphs, and reading time update as you type.',
      'Use Characters when a limit counts spaces, and No spaces when it does not.',
      'Press Clear text to empty the box and reset every total.',
      'Close the tab when you are done. This page does not save the text.',
    ],
    sections: [
      {
        heading: 'What the counter measures',
        paragraphs: [
          'The totals follow one set of rules, written here so you can tell when the number will differ from a word processor or a publisher’s style sheet.',
        ],
        subsections: [
          {
            heading: 'Words',
            paragraphs: [
              'A word is a run of characters separated by whitespace. Spaces, tabs, and line breaks are separators. Extra spaces do not create extra words.',
              '“well-known”, “don’t”, and “2026” each count as one word. Space at the start or end of the box is ignored. An empty box is zero words.',
            ],
          },
          {
            heading: 'Characters',
            paragraphs: [
              'Characters count Unicode code points, including spaces and line breaks. A single emoji such as “😀” counts as one character. A joined sequence, such as a family emoji, can count as more than one code point.',
              'No spaces uses the same code points and drops any character that Unicode treats as whitespace. Social networks and editors sometimes count emoji or line breaks differently, so match the rule to the limit you are writing toward.',
            ],
          },
          {
            heading: 'Sentences and paragraphs',
            paragraphs: [
              'A sentence is a non-empty piece of text split on one or more periods, exclamation marks, or question marks. “Hello world” with no ending mark is one sentence. “Hello. World!” is two.',
              'Abbreviations such as “Mr.” or “e.g.” add an extra split, because the counter does not keep a dictionary of titles. An ellipsis is more than one period, so it also splits there.',
              'A paragraph is a block separated by a blank line. A single line break stays inside the same paragraph. “Line one” followed by one line break and “Line two” is one paragraph. A blank line between them makes two.',
            ],
          },
        ],
      },
      {
        heading: 'How reading time is estimated',
        paragraphs: [
          'Reading time uses 200 words per minute, a common average for silent reading of plain prose. Zero words shows “0 min”. From 1 to 200 words shows “Under 1 min”. Above that, the counter rounds up to the next minute.',
          'It is an estimate for reading, not for speaking aloud. It ignores headings, lists, and how familiar the subject is.',
        ],
      },
      {
        heading: 'What this counter does not do',
        paragraphs: [
          'It does not apply a style guide. School assignments, APA papers, and publishers sometimes count hyphenated compounds in their own way. If an exact number will be graded or paid, confirm it in the editor that submits the work.',
          'It does not store a history, export a file, or check grammar. There is no character cap in the tool. A very long paste stays on your device, but it can make the tab feel slow because the count runs on each change.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'The text never leaves your browser for this tool. Counting runs locally after the page has loaded. BabelDoc does not receive the contents of the box, and there is no save button.',
          'If analytics is turned on later, it measures visits to the page, not the text you type. The privacy policy describes the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is my text uploaded to a server?',
        answer:
          'No. The word counter runs in your browser. The text you paste is not sent to BabelDoc and is not stored by this page.',
      },
      {
        question: 'What counts as a word?',
        answer:
          'A word is anything between whitespace. “state-of-the-art”, “it’s”, and “15” each count as one word. Extra spaces do not create extra words.',
      },
      {
        question: 'Do spaces count as characters?',
        answer:
          'Characters includes spaces and line breaks. No spaces leaves them out. Pick the one that matches the limit you are writing toward.',
      },
      {
        question: 'How are sentences detected?',
        answer:
          'The counter splits on periods, exclamation marks, and question marks. Text with no punctuation still counts as one sentence if it is not empty. Abbreviations like “Dr.” can be counted as a sentence break.',
      },
      {
        question: 'How is reading time calculated?',
        answer:
          'It divides the word count by 200 and rounds up, except that 1 to 200 words is shown as “Under 1 min”. The figure is a reading estimate, not a speaking time.',
      },
      {
        question: 'Is there a length limit?',
        answer:
          'The tool does not set one. Practical limits come from your browser and device. If the page becomes sluggish, count the text in smaller chunks.',
      },
      {
        question: 'Will the count match Microsoft Word or Google Docs?',
        answer:
          'Often it is close, and sometimes it is not. Those editors have their own rules for hyphenated words and punctuation. Use this page as a quick local count, then confirm in the editor that will submit the work if an exact number matters.',
      },
      {
        question: 'Does it work on a phone?',
        answer:
          'Yes. The box and the totals fit a narrow screen. JavaScript has to be enabled for the numbers to update. The explanation and the questions on this page are still there if it is not.',
      },
    ],
    related: [],
    added: '2026-11-19',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to update the counts. The guide on the page is available without JavaScript.',
    component: WordCounter,
  },
];

const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): ToolDefinition | undefined {
  return toolsBySlug.get(slug);
}

export function latestTools(limit = 6): ToolDefinition[] {
  return [...tools].sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0)).slice(0, limit);
}

export function toolsByCategory(): { category: (typeof categories)[number]; tools: ToolDefinition[] }[] {
  return categories
    .map((category) => ({
      category,
      tools: tools.filter((tool) => tool.category === category.id),
    }))
    .filter((group) => group.tools.length > 0);
}

export function getRelated(tool: ToolDefinition): ToolDefinition[] {
  return tool.related.flatMap((slug) => {
    const match = toolsBySlug.get(slug);
    return match ? [match] : [];
  }).slice(0, 6);
}
