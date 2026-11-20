import WordCounter from '../tools/word-counter.astro';
import TokenCounter from '../tools/token-counter.astro';
import SuperBowlSquares from '../tools/super-bowl-squares-generator.astro';

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
    description: 'Count words, characters, and model tokens without leaving the browser.',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Printable sheets for parties, pools, and fundraisers.',
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
  component: typeof WordCounter | typeof TokenCounter | typeof SuperBowlSquares;
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
          'It does not count tokens for a language model. The token counter estimates tokens for the GPT, Claude, and Gemini families.',
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
    related: ['token-counter'],
    added: '2026-11-19',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to update the counts. The guide on the page is available without JavaScript.',
    component: WordCounter,
  },
  {
    slug: 'token-counter',
    name: 'Token Counter',
    h1: 'Token Counter',
    title: 'Token Counter — GPT, Claude, and Gemini | BabelDoc',
    description:
      'Estimate tokens for GPT, Claude, or Gemini. Paste text or upload a file. The count is approximate and stays in this browser.',
    ogTitle: 'Estimate tokens for GPT, Claude, and Gemini',
    category: 'text',
    cardBlurb: 'Estimate tokens for the GPT, Claude, and Gemini families.',
    buttonLabel: 'Count tokens',
    intro:
      'Paste text, or upload a text or code file, and see an estimated token count for GPT, Claude, or Gemini. The same approximation is used for each family, so the token number does not change when you switch. Characters and words update as you type. The text and the file stay in this browser.',
    disclaimer:
      'Every token figure on this page is an estimate for the family you select. It is not certified for every current or future model, and it is not a vendor bill. A chat API can add tokens for message framing that are not in the box. Your text stays in this browser.',
    howToTitle: 'How to use this token counter',
    howTo: [
      'Choose GPT, Claude, or Gemini. The token number uses the same estimate for each family.',
      'Paste text, type, or press Upload file. You can also drop a text file on the box. The file is read in this browser and is not uploaded.',
      'Read the Estimate badge next to Tokens. The number is approximate, not a certified count for every model in that family.',
      'To price a call, type what you pay per 1 million tokens. The page does not keep a price list.',
      'Press Clear text to empty the box. This page does not save what you pasted or the file you opened.',
    ],
    sections: [
      {
        heading: 'What a token is',
        paragraphs: [
          'A token is a chunk of text a model reads. It is not always a word. Common words are often one token. Longer or less common words are split. Spaces and punctuation are part of the count.',
          'This page does not run a separate tokenizer for each family or model version. It estimates the length of the text in the box. “hello world” is 11 characters and 3 estimated tokens.',
        ],
      },
      {
        heading: 'Why this count is an estimate',
        paragraphs: [
          'GPT, Claude, and Gemini do not share one vocabulary, and a later model in the same family can split text differently from an earlier one. A figure that matches one model can miss another.',
          'The selector names the family you have in mind. The token number itself uses one rule for all three, so switching family does not change it. The page does not invent a gap between vendors.',
          'The estimate does not add tokens for roles, tools, images, or a system message you did not paste. It is a rough length, not a bill.',
        ],
      },
      {
        heading: 'How the estimate is calculated',
        paragraphs: [
          'Characters are Unicode code points, the same rule as the character total and the word counter. A single emoji such as “😀” is one character. The estimate is zero when the box is empty. Otherwise it is the character count divided by 4, rounded up.',
          '“hello world” is 11 characters, so the estimate is 3 tokens. Code, emoji, and many languages other than English can land far from that guess. An emoji can be one character and several tokens, so the estimate can be low. The badge says Estimate for GPT, Claude, and Gemini.',
        ],
      },
      {
        heading: 'How cost is estimated',
        paragraphs: [
          'Type a price per 1 million tokens. Cost equals the estimated token count divided by 1,000,000, then multiplied by that price. The page does not store OpenAI, Anthropic, or Google prices, because they change and they differ for input and output.',
          'If you are pricing a reply, count the prompt and the completion separately and type the rate that applies to each. The box holds one price at a time.',
        ],
      },
      {
        heading: 'What this counter does not do',
        paragraphs: [
          'It does not call an API, log the text, or save a draft. Closing the tab clears the box.',
          'It does not open PDF, Word, or other binary files. Those are not supported yet. A text or code file up to 5 MB can be read in this browser. It also does not apply cached-input discounts or batch rates. Type the price you actually want to use.',
          'Word and character totals follow the same splitting rules as the word counter. Use that page when you want sentences, paragraphs, and a reading time instead of tokens.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'The text never leaves your browser. A file you choose is read on this device and is not sent to BabelDoc. Counting does not download a tokenizer. Closing the tab clears the box.',
          'If analytics is on, it measures the visit, not the text. The privacy policy describes the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is my text uploaded?',
        answer:
          'No. Typing, pasting, and opening a file all stay in your browser. The file is not sent to BabelDoc and is not saved by this page.',
      },
      {
        question: 'Can I upload a file?',
        answer:
          'Yes. Use Upload file, or drop a file on the text box. Text and code files are supported, including .txt, .md, .csv, .json, .html, .xml, .yaml, and source files such as .py, .js, and .ts. The limit is 5 MB. PDF, Word, and other binary files are not supported yet. The file is read as UTF-8 in this browser and is not uploaded.',
      },
      {
        question: 'How accurate is the token count?',
        answer:
          'It is an estimate for the family you select, not a certified count for every current or future model. The rule is the character count divided by 4, rounded up. The same rule is used for GPT, Claude, and Gemini.',
      },
      {
        question: 'Why does the count stay the same when I switch family?',
        answer:
          'The selector records which family you are estimating. It does not apply a different formula. GPT, Claude, and Gemini can tokenize differently, and this page does not invent a separate number for each.',
      },
      {
        question: 'Will this match my API bill?',
        answer:
          'Do not expect it to. The estimate can miss the vendor’s own split, and an API request can add framing you did not paste, such as role labels. Use the vendor’s usage page when the bill matters.',
      },
      {
        question: 'What price should I enter?',
        answer:
          'Use the price from your own account, per 1 million tokens. Input and output prices are often different. This page does not ship a vendor price list.',
      },
      {
        question: 'Is a word the same as a token?',
        answer:
          'No. The word total splits on whitespace, the same rule as the word counter. This page estimates tokens from characters, so one word can be one estimated token or several. Use the word counter when you only need words, sentences, and a reading time.',
      },
    ],
    related: ['word-counter'],
    added: '2026-11-19',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to update the counts and to read a file you choose. The guide on the page is available without JavaScript.',
    component: TokenCounter,
  },
  {
    slug: 'super-bowl-squares-generator',
    name: 'Super Bowl Squares Generator',
    h1: 'Super Bowl Squares Generator',
    title: 'Super Bowl Squares Generator — Printable Sheet | BabelDoc',
    description:
      'Make a free printable Super Bowl squares template with names, random numbers, and a fundraiser pot. Share a link, or print the sheet and save it as a PDF.',
    ogTitle: 'Printable Super Bowl squares with names, numbers, and a pot',
    category: 'events',
    cardBlurb: 'Fill a 10 by 10 squares sheet, shuffle the numbers, and print it.',
    buttonLabel: 'Make a sheet',
    intro:
      'Set the two side names, type a name into each square, or paste a list and fill the empty squares. Shuffle the digits 0 through 9 when the group is ready to draw. Add a price if you are collecting for a fundraiser. You can share a link, print the sheet, or save it as a PDF. It is an unofficial pool sheet.',
    disclaimer:
      'This is an unofficial squares sheet for a private pool. It is not affiliated with the NFL, the teams, or the game, and it does not use their logos. Check the rules where you live before you collect money. Names stay in this browser unless you copy the share link yourself.',
    howToTitle: 'How to use this squares generator',
    howTo: [
      'Rename the two sides if you want. They start as AFC and NFC. The labels are plain text, and you can change them.',
      'Click a square and type a name, or paste one name per line and fill the empty squares in order or at random.',
      'Set a price per square and the share for Q1, half, Q3, and the final score. The pot updates from those figures.',
      'Press Randomize numbers when the group is ready to draw. Each side gets the digits 0 through 9 in a new order. Every digit is used once.',
      'Press Copy share link when you want to send the sheet. The link stores it in the address hash, not on a server. This browser also keeps a copy after you edit.',
      'Press Print / Save as PDF. In the print dialog, choose a printer or Save as PDF. The dialog belongs to your browser.',
    ],
    sections: [
      {
        heading: 'How Super Bowl squares work',
        paragraphs: [
          'A squares sheet is a 10 by 10 grid, 100 squares in all. People take squares before the game, usually by writing a name in each one they buy. The digits on the top and the side are a shuffled set of 0 through 9. They stand for the last digit of each side’s score, not the full score.',
          'The across name is the columns. The down name is the rows. If the across side has 17 and the down side has 24, the square in column 7 and row 4 wins that period. You can rename the sides. The 2027 game is in February. This page does not list a kickoff date or a stadium.',
        ],
      },
      {
        heading: 'How to run a pool',
        paragraphs: [
          'Agree on the price and the payout split before anyone pays. A common split is even quarters, or a larger share for the final score. Type those numbers and the page multiplies them by the pot. The full-sheet pot is the price times 100. The current pot is the price times the number of squares that already have a name.',
          'Let people pick squares, or paste the list and assign the empty squares at random. Draw the numbers only when you said you would. Many groups wait until the grid is full so nobody can chase a digit. You can shuffle both sides together, or one side at a time.',
          'Share the link so everyone sees the same names and digits. Print a copy for the party. The sheet on this device is saved locally, so a refresh keeps your latest edits unless you opened someone else’s link and have not changed it yet.',
        ],
      },
      {
        heading: 'How winners are decided',
        paragraphs: [
          'After each scoring period, take the last digit of each side’s score and find that column and row. Q1 uses the score at the end of the first quarter. Half uses the score at halftime. Q3 uses the score at the end of the third quarter. Final uses the score at the end of the game.',
          'The same square can win more than one period. A blank square has no name on it. Decide in advance whether that prize rolls over, is redrawn, or stays with the host. Overtime is a house rule too. Many pools fold overtime into the final score. Write the choice down before kickoff. This page does not pick a winner for you. It only builds the grid.',
        ],
      },
      {
        heading: 'Printing and the share link',
        paragraphs: [
          'Print / Save as PDF opens the browser’s print dialog. Choose a printer, or choose Save as PDF, to keep a file. Nothing is uploaded. The printed page hides the editing controls and keeps the grid, the side names, and the pot.',
          'The share link holds the sheet in the URL hash. A hash is not sent to BabelDoc with the page request. Anyone you send the link to can read the names and numbers, because that is what the link is for. Do not put anything in a square that you would not hand to that person on paper.',
        ],
      },
      {
        heading: 'What this sheet does not do',
        paragraphs: [
          'It does not take payments, track who has paid, or connect to a score feed. You read the score and match the last digits yourself.',
          'It does not store the sheet on a BabelDoc server. Your browser keeps a copy in local storage for this site. A different browser, or cleared site storage, will not have it. The share link is how you move the sheet to someone else.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'Names you type are saved in local storage on this device after you edit the sheet. They are not sent to BabelDoc. Creating a share link puts those names in the address bar. Copy that link only when you want someone else to see the sheet.',
          'Analytics, when it is running, records the page without the hash, so the names in a share link are not part of the analytics address. The privacy policy has the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this an official NFL sheet?',
        answer:
          'No. It is an unofficial generator for a private pool. It is not affiliated with the NFL or the game, and it does not use league or team logos. The side names are editable text. They start as AFC and NFC so the grid has labels.',
      },
      {
        question: 'When is the 2027 game?',
        answer:
          'The 2027 game is in February. This page does not give a day or a venue. Print the sheet whenever your group is ready, and draw the numbers on the schedule you agreed to.',
      },
      {
        question: 'How do the random numbers work?',
        answer:
          'Each side gets a shuffle of the digits 0 through 9. Every digit appears once on that side. The shuffle uses the browser’s cryptographic random numbers. Shuffle again only if you have not revealed the draw yet. Do not reshuffle after people have started playing to those digits.',
      },
      {
        question: 'Can I print the grid or save a PDF?',
        answer:
          'Yes. Press Print / Save as PDF. In the dialog, pick a printer or Save as PDF. The grid is laid out for a paper page. On a phone, the system print sheet is the same control.',
      },
      {
        question: 'Does the share link upload the names?',
        answer:
          'No. The link stores the sheet in the URL hash on your device. BabelDoc does not keep a copy. Sending the link shows the recipient the names, the digits, the price, and the payout split. This page also saves your edits in local storage in this browser.',
      },
      {
        question: 'What if the quarter shares do not add up to 100%?',
        answer:
          'The page still multiplies each share by the full-sheet pot and shows the total of the four percentages. Change the four numbers if you wanted them to use the whole pot. An empty box counts as zero. Amounts are rounded to the nearest hundredth.',
      },
      {
        question: 'Can two people share one square?',
        answer:
          'The grid has one line per square. Type both names in that line, such as “Sam and Jo”, if they are splitting the cost. There is no second layer of squares.',
      },
    ],
    related: [],
    added: '2026-11-19',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to shuffle numbers, calculate the pot, share a link, and save the sheet on this device. You can still read the guide without JavaScript. Printing uses the browser print dialog.',
    component: SuperBowlSquares,
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
