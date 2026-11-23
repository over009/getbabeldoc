import WordCounter from '../tools/word-counter.astro';
import TokenCounter from '../tools/token-counter.astro';
import SuperBowlSquares from '../tools/super-bowl-squares-generator.astro';
import DiscordTimestamp from '../tools/discord-timestamp-generator.astro';
import TournamentBracket from '../tools/tournament-bracket-generator.astro';
import SeatingChart from '../tools/ai-seating-chart-generator.astro';
import OrgChart from '../tools/ai-org-chart-generator.astro';
import FunnelChart from '../tools/ai-funnel-chart-generator.astro';

/**
 * Tool registry.
 *
 * A new tool is two steps:
 * 1. Add `src/tools/<slug>.astro` for the interactive UI. Give it no required props.
 * 2. Add one object to `tools` below. The slug becomes `/tools/<slug>/`.
 *
 * Do not add a new route file. `src/pages/tools/[slug].astro` reads this list.
 * `related` is the preferred order. The page still links three other tools: those
 * slugs first, then the same category, then the rest of the library. Never itself.
 */

export const categories = [
  {
    id: 'text-tools',
    name: 'Text & AI Tools',
    navLabel: 'Text Tools',
    description: 'Count words and characters, or estimate tokens for GPT, Claude, and Gemini.',
  },
  {
    id: 'event-tools',
    name: 'Events & Games',
    navLabel: 'Event Tools',
    description: 'Seat a guest list, make a Super Bowl squares grid, or build a single-elimination bracket.',
  },
  {
    id: 'chart-tools',
    name: 'Charts & Diagrams',
    navLabel: 'Chart Tools',
    description: 'Draw an org chart or a funnel chart from a list or a CSV, in this browser.',
  },
  {
    id: 'time-tools',
    name: 'Time & Date Tools',
    navLabel: 'Time Tools',
    description: 'Generate a Discord timestamp from a date and time you choose.',
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
  /** Short label used on related-tool links. */
  buttonLabel: string;
  /** Homepage card button. An action phrase, different from `name`. */
  cardCta: string;
  intro: string;
  disclaimer: string;
  howToTitle: string;
  howTo: string[];
  features: string[];
  sections: ToolSection[];
  faqs: ToolFaq[];
  related: string[];
  added: string;
  browserRequirements: string;
  /** Wide tools use the full content column so a diagram can sit beside the reading width. */
  layout?: 'wide';
  component:
    | typeof WordCounter
    | typeof TokenCounter
    | typeof SuperBowlSquares
    | typeof DiscordTimestamp
    | typeof TournamentBracket
    | typeof SeatingChart
    | typeof OrgChart
    | typeof FunnelChart;
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
    category: 'text-tools',
    cardBlurb: 'Count words, characters, sentences, and paragraphs as you type.',
    buttonLabel: 'Count words',
    cardCta: 'Count Words Now →',
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
    features: [
      'Words, characters, characters without spaces, sentences, and paragraphs update as you type.',
      'Reading time is estimated at 200 words per minute.',
      'Counting runs in your browser. The text is not uploaded and this page does not save it.',
      'Clear text empties the box and resets every total.',
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
        question: 'How is reading time calculated?',
        answer:
          'It divides the word count by 200 and rounds up, except that 1 to 200 words is shown as “Under 1 min”. The figure is a reading estimate, not a speaking time.',
      },
      {
        question: 'Will the count match Microsoft Word or Google Docs?',
        answer:
          'Often it is close, and sometimes it is not. Those editors have their own rules for hyphenated words and punctuation. Use this page as a quick local count, then confirm in the editor that will submit the work if an exact number matters.',
      },
    ],
    related: ['token-counter', 'discord-timestamp-generator', 'super-bowl-squares-generator'],
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
    category: 'text-tools',
    cardBlurb: 'Estimate tokens for the GPT, Claude, and Gemini families.',
    buttonLabel: 'Count tokens',
    cardCta: 'Count Tokens →',
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
    features: [
      'Estimates tokens for the GPT, Claude, and Gemini families with one rule: about 4 characters per token, rounded up.',
      'Shows characters and words beside the token estimate.',
      'Reads a text or code file in this browser, up to 5 MB. The file is not uploaded. PDF and Word files are not supported.',
      'Estimates cost from a price you type per 1 million tokens. This page does not include a vendor price list.',
      'Labels the token figure as an estimate. It is not a certified count for every model and it is not an API bill.',
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
    ],
    related: ['word-counter', 'discord-timestamp-generator', 'tournament-bracket-generator'],
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
    category: 'event-tools',
    cardBlurb: 'Fill a 10 by 10 squares sheet, shuffle the numbers, and print it.',
    buttonLabel: 'Make a sheet',
    cardCta: 'Create Squares Grid →',
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
    features: [
      'Builds a 10 by 10 squares sheet and lets you rename the two sides.',
      'Type a name into a square, or paste a list and fill the empty squares in order or at random.',
      'Shuffles the digits 0 through 9 for each side. Every digit is used once on that side.',
      'Figures a pot from the price per square and the shares for Q1, half, Q3, and the final score.',
      'Prints the sheet, saves it as a PDF, or copies a share link. The link stores the sheet in the address hash, not on a server.',
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
          'Agree on the price and the payout split before anyone pays. A common split is even quarters, or a larger share for the final score. Type those numbers and the page multiplies them by the pot. The full-sheet pot is the price times 100. The current pot is the price times the number of squares that already have a name. If the four shares do not add up to 100%, the page still multiplies each share by the full-sheet pot and shows the total of the four percentages. An empty box counts as zero. Amounts are rounded to the nearest hundredth.',
          'Let people pick squares, or paste the list and assign the empty squares at random. The grid has one line per square. Type both names in that line, such as “Sam and Jo”, if they are splitting the cost. Draw the numbers only when you said you would. Many groups wait until the grid is full so nobody can chase a digit. You can shuffle both sides together, or one side at a time.',
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
    ],
    related: ['tournament-bracket-generator', 'ai-seating-chart-generator', 'discord-timestamp-generator'],
    added: '2026-11-19',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to shuffle numbers, calculate the pot, share a link, and save the sheet on this device. You can still read the guide without JavaScript. Printing uses the browser print dialog.',
    component: SuperBowlSquares,
  },
  {
    slug: 'ai-seating-chart-generator',
    name: 'AI Seating Chart Generator',
    h1: 'AI Seating Chart Generator',
    title: 'AI Seating Chart Generator | BabelDoc',
    description:
      'Paste a guest list, set tables and seats, and generate a seating chart in your browser. Groups stay together. Export a PNG or CSV. Nothing is uploaded.',
    ogTitle: 'Seating chart from a guest list, in your browser',
    category: 'event-tools',
    cardBlurb: 'Assign guests to round tables, keep groups together, and export the chart.',
    buttonLabel: 'Build a seating chart',
    cardCta: 'Build a Seating Chart →',
    intro:
      'Paste a guest list, set how many tables you have, and generate a seating chart. People in the same group sit together when the table can hold them. You can drag someone to another table afterward. The assignment uses fixed rules in this browser. It does not call a language model.',
    disclaimer:
      'The chart follows the rules below. It is a planning aid, not a reservation system. Guest names stay in this browser and are not saved.',
    howToTitle: 'How to use this seating chart generator',
    howTo: [
      'Paste one guest per line. To keep people together, add a comma and a group, as in “Avery Chen, Speakers”.',
      'Set the number of tables and the seats at each table. Every table uses the same seat count.',
      'Optional: list keep-apart pairs, one pair per line, as in “Avery Chen, Jules Moreau”.',
      'Press Generate. The same list, tables, seats, and pairs always produce the same chart. Load sample fills an example and generates it.',
      'Drag a name onto another table, or onto Unseated. You can also pick a guest and a destination, then press Move.',
      'Read the check panel under the tables. Then press Download PNG, Download CSV, or Print.',
    ],
    features: [
      'Assigns seats automatically so a group shares a table when that group fits and a keep-apart pair does not force a split.',
      'Draws one round table per table, with each guest’s name around it.',
      'Drag a guest to another table, or use Move a guest when dragging is awkward.',
      'Check panel confirms each guest appears once and flags duplicate names, over-full tables, and guests with no seat.',
      'Download a PNG or a CSV of the current seats, or print the page. Nothing is uploaded.',
    ],
    sections: [
      {
        heading: 'How seats are assigned',
        paragraphs: [
          'A line is read as CSV. The first column is the name and the second is the group. A line with no comma is a guest with no group. Quotes work when a name itself contains a comma, as in “Chen, Avery”, Speakers. Extra columns are ignored, and the check panel says so. Blank lines are skipped. Letter case and repeated spaces do not make a second person: “Avery Chen” and “avery  chen” are the same guest, and only the first spelling is seated.',
          'Named groups are seated first, largest group first. Groups of the same size go in alphabetical order. A group is placed whole on the table that already has the fewest guests, if that table can hold everyone and nobody in the group must be kept apart from someone at that table or from each other. A tie goes to the lowest table number. People with no group are seated after the groups, one at a time, onto the emptiest table that does not break a keep-apart pair. The same input always gives the same chart. There is no shuffle.',
          'If a group is larger than the seats at one table, or it contains a keep-apart pair, or no open table can hold it without a clash, its members are seated one at a time. When every open seat would break a keep-apart pair, the guest is seated anyway and the check panel marks the pair. When there is no open seat, the guest is left unseated. This page accepts up to 200 guests, 30 tables, and 12 seats per table. A name longer than 80 characters is shortened.',
        ],
      },
      {
        heading: 'The check panel',
        paragraphs: [
          'After you generate, and again after every move, the panel reads the current chart. A Pass line means that check is clear. A Check line names what needs a look. Every accepted guest should appear once. Duplicate names from the paste are listed and were not seated a second time. Any table with more guests than the seat limit is named. Guests with no seat are listed. A group that is not all at one table is named, including a group that had more people than one table can hold. Keep-apart pairs who still share a table are named. If you typed a keep-apart name that matches nobody, that name is listed too.',
        ],
      },
      {
        heading: 'Export and print',
        paragraphs: [
          'Download PNG draws the current tables in this browser, including moves you made after generating. Download CSV writes Table, Seat, Name, and Group. Seat 1 is the first person clockwise from the top. Unseated guests are included with the table name Unseated and a blank seat. Print opens your browser’s print dialog, where you can choose a printer or Save as PDF. The dialog hides the form and keeps the tables and the check panel.',
        ],
      },
      {
        heading: 'What this page does not do',
        paragraphs: [
          'It does not call a language model, score guests, or learn from past events. “AI” in the title is the phrase people search for. The seats come from the rules above.',
          'It does not save the list on this device or on a BabelDoc server. A refresh clears the chart. It does not email guests, take payments, or draw a floor plan of a real room. Dragging can put a table over its seat limit on purpose, so you can override the assignment. The check panel will say so.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'The guest list and the keep-apart pairs stay in this browser. Generating, dragging, printing, and the downloads do not send them to BabelDoc. This page does not write them to local storage.',
          'If analytics is on, it records the visit, not the names. The privacy policy has the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does this use an AI model?',
        answer:
          'No. The title says AI because that is the phrase people search for. The chart is built in your browser with fixed rules: groups sit together when they fit, the emptiest suitable table is filled next, and a keep-apart pair is split when another seat is open. No language model is called, and the guest list is not uploaded.',
      },
      {
        question: 'Is the guest list uploaded or saved?',
        answer:
          'No. Generating, dragging, printing, and the PNG or CSV download all happen in this browser. This page does not save the list. Closing the tab or refreshing the page clears it.',
      },
      {
        question: 'How does a group stay together?',
        answer:
          'The first column is the name and the second is the group. People with the same group, ignoring letter case, share a table when the group fits in the seats per table and a keep-apart pair does not force a split. A group larger than one table is split, and the check panel says so.',
      },
      {
        question: 'What does the check panel verify?',
        answer:
          'It checks that every accepted guest appears once, lists duplicate names that were kept only once, marks any table over the seat limit, and lists guests with no seat. It also marks a group that is not all at one table, and a keep-apart pair that still shares a table.',
      },
      {
        question: 'Can I move people after generating?',
        answer:
          'Yes. Drag a name to another table or to Unseated, or use Move a guest. A move can put more people at a table than the seat limit. The check panel marks that table. Download PNG and Download CSV use the chart after your moves.',
      },
    ],
    related: ['tournament-bracket-generator', 'super-bowl-squares-generator', 'ai-org-chart-generator'],
    added: '2026-11-23',
    layout: 'wide',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to assign seats, drag guests, and download a PNG or CSV. The guide on the page is available without JavaScript. Printing uses the browser print dialog.',
    component: SeatingChart,
  },
  {
    slug: 'ai-org-chart-generator',
    name: 'AI Org Chart Generator',
    h1: 'AI Org Chart Generator',
    title: 'AI Org Chart Generator | BabelDoc',
    description:
      'Paste names, titles, and managers, or open a CSV, and draw an org chart in your browser. Collapse branches. Export PNG or SVG. The file is not uploaded.',
    ogTitle: 'Org chart from names, titles, and managers',
    category: 'chart-tools',
    cardBlurb: 'Turn a name, title, and manager list into a collapsible org chart.',
    buttonLabel: 'Draw an org chart',
    cardCta: 'Draw an Org Chart →',
    intro:
      'Paste a row for each person, or open a CSV, and draw an org chart. Each row is a name, a title, and a manager. Click a person to hide the people under them. The tree is built in this browser from those rows. It does not call a language model.',
    disclaimer:
      'The drawing follows the rows you provide and the checks below. It is not a directory or an HR system. The file stays in this browser and is not saved.',
    howToTitle: 'How to use this org chart generator',
    howTo: [
      'Paste one person per row: name, title, then the manager’s name. Leave the manager blank for the person at the top.',
      'Or press Upload CSV. The file is copied into the box on this page. It is not uploaded.',
      'Leave “First row is column names” checked when the first row says Name, Title, and Manager. Uncheck it when the first row is a person.',
      'Press Generate. Load sample fills an example company and draws it.',
      'Click a person to hide or show the people who report to them. Press Download PNG or Download SVG for the chart as it looks now.',
    ],
    features: [
      'Builds a top-down org chart from pasted rows or from a CSV opened on this page.',
      'Recognizes Name, Title, and Manager headings, and falls back to the first three columns when those headings are missing.',
      'Click a person to collapse or expand the people under them.',
      'Check panel flags duplicate names, managers who are not on the list, more than one person at the top, and reporting loops.',
      'Download a PNG or an SVG of the current chart. The file never leaves this browser.',
    ],
    sections: [
      {
        heading: 'How the rows are read',
        paragraphs: [
          'Each data row becomes one person. The name column is required. The title can be blank. A blank manager means that person is drawn at the top. Matching ignores letter case and repeated spaces, so “Avery Chen” and “avery chen” are the same person. A second row with the same name is skipped, and the check panel names the first spelling.',
          'When the header box is checked, the columns are chosen by their headings. Name, Employee, or Person selects the name. Title, Role, or Position selects the title. Manager, Reports to, or Supervisor selects the manager. If those headings are not all present, the first three columns are used in that order and the panel says so. This page draws up to 150 people. A name longer than 120 characters is shortened.',
        ],
      },
      {
        heading: 'Loops, missing managers, and several trees',
        paragraphs: [
          'A manager must be the name of someone else on the list. A name that matches nobody is reported, and that person is drawn at the top because there is no one to connect them to. A person listed as their own manager is reported, and no link is drawn.',
          'If the rows loop, for example Avery reports to Blake and Blake reports to Avery, the chart cannot be a single tree until one link is left off. The page keeps the link from the earlier row and drops the later link that would circle back. The check panel names the people in the loop and the link that was left off. If more than one person ends up at the top, both trees are drawn side by side and the panel says so. One person at the top is the usual case, and the panel says Pass for that.',
        ],
      },
      {
        heading: 'Export',
        paragraphs: [
          'Download SVG saves the drawing you see, including branches you have collapsed. Download PNG makes a picture of that same drawing in this browser. Neither file is uploaded. The chart is not written to local storage. A refresh clears it.',
        ],
      },
      {
        heading: 'What this page does not do',
        paragraphs: [
          'It does not call a language model, infer who manages whom, or fill in missing people. “AI” in the title is the phrase people search for. If a manager is not in the list, the panel says so instead of inventing a person.',
          'It does not import a live directory, sign in to a company account, or edit the source file on disk. Upload CSV only reads a copy into the box.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'Names, titles, and the file you open stay in this browser. They are not sent to BabelDoc and they are not saved by this page.',
          'If analytics is on, it records the visit, not the rows. The privacy policy has the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does this use an AI model?',
        answer:
          'No. The title says AI because that is the phrase people search for. The chart is a tree built in your browser from the rows you paste or from a CSV you open. No language model is called.',
      },
      {
        question: 'Does the file leave this browser?',
        answer:
          'No. Upload CSV reads the file into the text box on this page. It is not uploaded and it is not saved. Closing the tab or refreshing the page clears it.',
      },
      {
        question: 'What do the rows mean?',
        answer:
          'Each row is a name, a title, and a manager. A blank manager means that person is at the top. If the first row is column names, leave “First row is column names” checked. Name, Title, and Manager are recognized. If those headings are missing, the first three columns are used in that order.',
      },
      {
        question: 'What does the check panel verify?',
        answer:
          'It checks that each name is drawn once, that every manager matches a person, that nobody is their own manager, that there is one person at the top, and that the reporting lines do not loop. A missing manager, a second person at the top, a duplicate name, or a loop is marked. A loop is drawn by leaving off the later link that would circle back.',
      },
      {
        question: 'Can I collapse a branch and export it?',
        answer:
          'Yes. Click a person to hide or show the people under them. Download PNG and Download SVG use the chart as it is on screen, including branches you have hidden.',
      },
    ],
    related: ['ai-funnel-chart-generator', 'ai-seating-chart-generator', 'tournament-bracket-generator'],
    added: '2026-11-23',
    layout: 'wide',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to draw the chart, collapse a branch, read a CSV, and download a PNG or SVG. The guide on the page is available without JavaScript.',
    component: OrgChart,
  },
  {
    slug: 'ai-funnel-chart-generator',
    name: 'AI Funnel Chart Generator',
    h1: 'AI Funnel Chart Generator',
    title: 'AI Funnel Chart Generator | BabelDoc',
    description:
      'Paste or upload a CSV, or type stages, and draw a funnel chart in your browser. See conversion rates and the rows behind each number. Nothing is uploaded.',
    ogTitle: 'Funnel chart from a CSV, with the math shown',
    category: 'chart-tools',
    cardBlurb: 'Chart stage values and conversion rates from a CSV or from numbers you type.',
    buttonLabel: 'Make a funnel chart',
    cardCta: 'Make a Funnel Chart →',
    intro:
      'Paste a CSV, open a file, or type the stages yourself, and draw a funnel chart. Each stage shows its value, the share of the stage above, and the share of the top. Select a stage to see the rows behind the number. The math runs in this browser. It does not call a language model.',
    disclaimer:
      'The numbers are the sum or the count of the rows you chose, not a forecast. A file you open stays in this browser and is not saved. This page does not connect to Tableau.',
    howToTitle: 'How to use this funnel chart generator',
    howTo: [
      'Choose Paste or upload a CSV, or choose Type stages and values.',
      'For a CSV, paste it or press Upload CSV. A spreadsheet export, or a CSV you downloaded from Tableau, can go in the box. The file is read here and is not uploaded.',
      'Pick the stage column. Then either sum a value column or count the rows in each stage. Leave “First row is column names” checked when the first row is headings.',
      'For typed stages, enter one stage per line: the name, a comma, and the number.',
      'Press Generate. Load sample fills a small CSV and draws it. Click a stage to read how its number was computed and to see the rows.',
      'Use Up and Down to change the stage order. That changes the percentages, not the stage values. Then download a PNG, an SVG, or a CSV of the computed table.',
    ],
    features: [
      'Reads a pasted or uploaded CSV, or stages you type, without sending the file anywhere.',
      'Sums a value column for each stage, or counts the rows in that stage.',
      'Shows the share of the previous stage and the share of the top stage.',
      'Click a stage to see the calculation in words and the source rows that produced the number.',
      'A reconciliation panel counts rows, blanks, duplicates, and the sum of the stages against the column total. Export PNG, SVG, or CSV.',
    ],
    sections: [
      {
        heading: 'How a stage value is computed',
        paragraphs: [
          'Stage labels are matched exactly after trimming extra space. “Visit” and “visit” stay separate. The chart lists stages in the order they first appear, until you move one. Sum the value column adds the numbers on rows whose stage cell equals that label. A value can be a plain number, or it can include a dollar sign and thousands separators, such as $1,200. Words and percents are not numbers and those rows are left out. Count rows uses how many rows have that stage, and ignores the value column.',
          'Select a stage. The panel states the calculation in the form SUM of column “Amount” where “Stage” = “Visit” (2 rows), or COUNT of rows where “Stage” = “Visit” (2 rows). Typed stages say Typed value for “Visit” (1 line). When a sum uses 12 or fewer numbers, the panel also shows the addition, such as 30 + 20 = 50. The source rows are listed under that sentence. A stage with more than 100 rows shows the first 100 and the full count. The total still uses every included row.',
        ],
      },
      {
        heading: 'Percentages',
        paragraphs: [
          'Percent of previous is this stage’s value divided by the stage directly above it, rounded to one decimal. Percent of top is this stage’s value divided by the first stage. The first stage has no previous stage, so that spot is a dash. If the stage you divide by is 0, the percentage is a dash rather than a made-up number. Up and Down change which stage is above which. The stage values stay the same, and both percentages are recalculated from the new order.',
          'The shape of each band follows the size of the value compared with the largest value. A later stage that is larger than an earlier one is drawn wider. The chart does not force the funnel to shrink.',
        ],
      },
      {
        heading: 'Reconciliation',
        paragraphs: [
          'The panel under the chart is there so you can check the drawing against the file. For a CSV it shows how many data rows were read, how many were left out because the stage was blank, and which stage labels appeared on more than one row and were combined. An exact duplicate of an earlier row is counted and is still included, because the file contained it. When you sum a column, it also counts rows left out because the value was not a number, and it compares the sum of the stages with the sum of every numeric value in that column. A gap is the numeric values on rows with a blank stage, when that is what explains it.',
          'For typed stages, the panel shows how many lines were read, how many were skipped because the stage or the value was missing or not a number, and any stage that was typed more than once. Those repeated lines are added together.',
        ],
      },
      {
        heading: 'Files and export',
        paragraphs: [
          'Upload CSV reads the file with the browser’s file reader and puts the text in the box. BabelDoc does not receive it. This page does not sign in to Tableau, Google Sheets, or Excel. If you exported a CSV from one of those, you can paste or open that file here. The limit is 1.5 MB and 5,000 data rows.',
          'Download PNG and Download SVG save the drawing. Download CSV saves the computed table: stage, value, row count, percent of previous, percent of top, and the calculation sentence. A blank percentage is left blank in the file. Nothing is stored after you leave the page.',
        ],
      },
      {
        heading: 'What this page does not do',
        paragraphs: [
          'It does not call a language model, predict a future stage, or decide which column is the stage until you pick one. “AI” in the title is the phrase people search for, including searches about a funnel chart made from a Tableau CSV. The numbers are arithmetic on the rows you supplied.',
          'It does not drop duplicate rows on its own. It tells you they are there and keeps them in the sum. Remove them from the box if you do not want them counted.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'The CSV and the numbers you type stay in this browser. Reading a file, drawing the chart, and the downloads do not send them to BabelDoc. This page does not save them.',
          'If analytics is on, it records the visit, not the file. The privacy policy has the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does this use an AI model or Tableau?',
        answer:
          'No. The title says AI because that is the phrase people search for. The chart is calculated in your browser from the CSV you paste or open, or from numbers you type. It does not call a language model, and it does not connect to Tableau. A CSV you exported from Tableau can be pasted here. The file never leaves this browser.',
      },
      {
        question: 'How is a stage number computed?',
        answer:
          'In a CSV, choose the stage column. Sum the value column adds the numbers on rows with that stage. Count rows uses how many of those rows there are. Typed stages use the numbers you entered. Select a stage and the panel states the calculation, for example SUM of column “Amount” where “Stage” = “Visit” (2 rows), and lists the rows. The first 100 rows are shown when a stage has more, and the total still uses every row.',
      },
      {
        question: 'What do the percentages mean?',
        answer:
          'Percent of previous is this stage’s value divided by the stage above it. Percent of top is this stage’s value divided by the first stage. The first stage has no previous stage, so that percentage is a dash. If a stage you divide by is 0, the percentage is a dash. Moving a stage with Up or Down changes these percentages. It does not change the stage value.',
      },
      {
        question: 'What does the reconciliation panel show?',
        answer:
          'For a CSV it shows the data-row count, blank stages, repeated stage labels that were combined, and exact duplicate rows, which are still included. When you sum a column, it also shows non-numeric values that were left out, and the sum of the stages next to the sum of the numeric values in that column. For typed stages it shows how many lines were read, how many were skipped, and stages that were typed more than once.',
      },
      {
        question: 'Can I export the chart?',
        answer:
          'Yes. Download PNG and Download SVG save the drawing. Download CSV saves the computed table: stage, value, row count, percent of previous, percent of top, and the calculation sentence. All three are made in this browser.',
      },
    ],
    related: ['ai-org-chart-generator', 'ai-seating-chart-generator', 'tournament-bracket-generator'],
    added: '2026-11-23',
    layout: 'wide',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to read a CSV, calculate the stages, and download a PNG, SVG, or CSV. The guide on the page is available without JavaScript.',
    component: FunnelChart,
  },
  {
    slug: 'discord-timestamp-generator',
    name: 'Discord Timestamp Generator',
    h1: 'Discord Timestamp Generator',
    title: 'Discord Timestamp Generator — Every Chat Style | BabelDoc',
    description:
      'Free Discord timestamp generator for every chat style. Pick a date and time, preview how each code reads, and copy it. Nothing leaves this browser.',
    ogTitle: 'Discord timestamp codes for every chat style',
    category: 'time-tools',
    cardBlurb: 'Build a chat timestamp code for every style and copy it.',
    buttonLabel: 'Make a timestamp',
    cardCta: 'Generate Timestamp →',
    intro:
      'Pick a date and time and get a Discord timestamp code for every style the chat box accepts. Copy the one you need. The preview uses this device’s clock and language. This page is not affiliated with Discord.',
    disclaimer:
      'Not affiliated with Discord. The preview is how this browser formats the time, so a Discord app set to another language can differ in small ways. The date you pick is not uploaded and is not saved.',
    howToTitle: 'How to use this timestamp generator',
    howTo: [
      'Set the date and time. The box starts at the current time on this device, including seconds.',
      'Leave the timezone on this device, or choose another one if the clock you typed belongs somewhere else. The numbers in the box stay put. The Unix time changes to match that timezone.',
      'Press +1 hour, +1 day, or Next week to move the clock. Next week adds 7 days. Now returns to the current time.',
      'Read the row for the style you want. The f row is Discord’s default. Each row shows the code and a preview of how a Discord app on this device would render it.',
      'Press Copy on that row and paste the code into Discord. The relative row updates on its own while this page is open.',
      'To check a code you already have, paste it or a Unix time into the decode box and press Decode.',
    ],
    features: [
      'Builds a Discord timestamp code for every chat style: t, T, d, D, f, F, and R.',
      'Previews each style with this device’s language and timezone.',
      'Reads the date box in the timezone you pick, and can move that time by an hour, a day, or seven days.',
      'Decodes a pasted Discord timestamp code or a Unix time.',
      'Runs in this browser. It does not post to Discord, and it is not affiliated with Discord.',
    ],
    sections: [
      {
        heading: 'What a Discord timestamp code is',
        paragraphs: [
          'A Discord timestamp is a short code that stores a Unix time and a style letter. Unix time is a count of seconds. The code looks like <t:1710000000:f>. Discord turns that into a date for each person who reads the message, using that person’s own timezone.',
          'This page builds the code. It does not send the message, and it does not talk to Discord. You copy the code and paste it where you want it.',
        ],
      },
      {
        heading: 'What each style shows',
        paragraphs: [
          'The letter after the second colon picks the layout. t is a short time. T adds seconds. d is a numeric date. D spells the month. f is the default, a date and a time without the weekday. F adds the weekday. R is a relative phrase, such as “in 3 hours” or “2 days ago”.',
          'The preview uses your browser’s language and this device’s timezone, because that is what a Discord app on this same device would do. Someone in another timezone will see a different clock from the same code. The Unix time in the code does not change for them.',
        ],
      },
      {
        heading: 'Timezones and the date box',
        paragraphs: [
          'The date box has no timezone of its own. This page reads those numbers in the timezone you select. If you type 15:00 and choose Asia/Tokyo, the code is for 15:00 in Tokyo, even when this device is set somewhere else.',
          'Changing the timezone keeps the numbers in the box and recalculates the Unix time. It does not move the clock to show the same instant in the new timezone. The line under the box names this device’s timezone and the offset used for the selected one.',
          'A jump forward for daylight saving has a missing hour. A time in that gap is read as the next valid instant. A repeated hour in the fall is read as the first one. If the exact instant matters, check the Unix time and the UTC line.',
        ],
      },
      {
        heading: 'Relative times',
        paragraphs: [
          'The R preview updates about once a second. The phrase uses the usual ranges: seconds, then minutes, hours, days, months, and years. The words come from the browser, so they follow this device’s language.',
          'A Discord client can choose a slightly different unit or a different phrase for the same gap. Use the preview as a close reading, not as a pixel match of the Discord app.',
        ],
      },
      {
        heading: 'Decoding a code you already have',
        paragraphs: [
          'Paste a code such as <t:1710000000:f>, or the number by itself. The page sets the date box to that instant in the timezone you have selected and marks the matching row. A code with no style letter is treated as the default, f.',
          'A whole number with 13 digits is treated as milliseconds and divided by 1,000. That covers a time copied from JavaScript’s Date.now(). Longer numbers, such as a Discord snowflake id, are not timestamps and are rejected.',
        ],
      },
      {
        heading: 'What this page does not do',
        paragraphs: [
          'It does not post to Discord, look up a server, or check that a channel will accept the code. It does not use the Discord logo, and it is not an official Discord tool.',
          'It does not save the date. A refresh starts at the current time again. It also does not format times outside years 1 through 9999, which is the range this browser’s date formatter supports.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'The date stays in this browser. Building a code does not send it to BabelDoc, and this page does not write it to local storage.',
          'If analytics is on, it records the visit, not the time you picked. The privacy policy has the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is this affiliated with Discord?',
        answer:
          'No. It is an unofficial generator. It does not use the Discord logo, and it does not connect to a Discord account or server.',
      },
      {
        question: 'Will the preview match Discord exactly?',
        answer:
          'It will be close on this device. The preview uses this browser’s language and timezone. A Discord app in another language can use different punctuation, a 12-hour or 24-hour clock, or a slightly different relative phrase.',
      },
      {
        question: 'Why does the preview ignore the timezone I selected?',
        answer:
          'The timezone menu says how to read the date box, so 15:00 can mean 15:00 in Tokyo. Discord then shows that instant in the viewer’s own timezone. The preview is that second step for this device. The UTC line shows the same instant with the timezone taken out.',
      },
      {
        question: 'Can I paste a code to see what time it is?',
        answer:
          'Yes. Paste the full code, or the Unix time in seconds, and press Decode. The date box moves to that instant in the selected timezone, and the matching style row is marked.',
      },
      {
        question: 'Is the time I pick uploaded?',
        answer:
          'No. The codes are built in your browser. This page does not save the date and does not send it to BabelDoc.',
      },
    ],
    related: ['word-counter', 'token-counter', 'tournament-bracket-generator'],
    added: '2026-11-23',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to build the codes, preview them, and decode a pasted value. The guide on the page is available without JavaScript.',
    component: DiscordTimestamp,
  },
  {
    slug: 'tournament-bracket-generator',
    name: 'Tournament Bracket Generator',
    h1: 'Tournament Bracket Generator',
    title: 'Tournament Bracket Generator — Single Elimination | BabelDoc',
    description:
      'Free tournament bracket generator for a single-elimination draw. Paste 2 to 64 names, click winners, and save a PNG. It stays in your browser.',
    ogTitle: 'Single-elimination bracket you can fill in and save',
    category: 'event-tools',
    cardBlurb: 'Paste names, click winners, and export a single-elimination bracket.',
    buttonLabel: 'Build a bracket',
    cardCta: 'Make a Bracket →',
    intro:
      'Paste names, one per line, and build a single-elimination bracket for an office pool, an esports night, or a sports league you run. Click a name to advance it. Share a link, print the page, or save a PNG.',
    disclaimer:
      'Generic bracket for a private event. Not affiliated with any league or organizer. Names stay in this browser unless you copy the share link yourself. A very large bracket is easier to share as a PNG than to print.',
    howToTitle: 'How to use this bracket generator',
    howTo: [
      'Type a title if you want one. It is optional and shows above the bracket and on the PNG.',
      'Paste one name per line. The first line is seed 1. Turn on random seeding if you want the list shuffled when you build.',
      'Press Build bracket. If the count is not a power of two, the top seeds get a bye and move on without a first-round match.',
      'Click a name to mark the winner of that match. Click that winner again to take it back. Changing a result clears winners in later rounds that depended on it. Undo steps back one change.',
      'Press Download PNG for a picture, or Print for a paper copy. In the print dialog, landscape fits a wide bracket better.',
      'Press Copy share link when you want to send the bracket. The link stores it in the address hash, not on a server. This browser also keeps a copy after you build.',
    ],
    features: [
      'Builds a single-elimination bracket for 2 to 64 names.',
      'Uses list order as the seeds, or shuffles once when random seeding is on.',
      'Adds byes when the number of names is not 2, 4, 8, 16, 32, or 64. Top seeds face those byes.',
      'Click a name to advance the winner. Undo steps back one change in this visit.',
      'Downloads a PNG, prints the page, or copies a share link stored in the address hash.',
    ],
    sections: [
      {
        heading: 'How the bracket is seeded',
        paragraphs: [
          'The list order is the seed order, unless you turn on random seeding. Seed 1 is the first name. The draw places seeds so that seed 1 and seed 2 are on opposite sides and would meet in the final if both keep winning.',
          'Random seeding shuffles the list once, when you press Build bracket. The bracket then treats that shuffled order as the seeds. The text box keeps the list you typed, so you can turn the shuffle off and build again to go back to list order. Building again with random seeding still on draws a new order.',
        ],
      },
      {
        heading: 'Byes',
        paragraphs: [
          'A single-elimination bracket needs a field size of 2, 4, 8, 16, 32, or 64. If you enter another count, the page rounds up to the next of those sizes and fills the empty spots with byes.',
          'Byes go to the top seeds. A name facing a bye moves to the next round automatically. You do not click it. With 5 names, the field is 8, so 3 byes are added and seeds 1, 2, and 3 advance. Seeds 4 and 5 play each other.',
        ],
      },
      {
        heading: 'Round names',
        paragraphs: [
          'The last round is the Final. The round before that is the Semifinals, and the one before that is the Quarterfinals, when the field is large enough to have them. Earlier rounds are Round 1, Round 2, and so on.',
          'A 2-name bracket is only the Final. A 4-name bracket is Semifinals and the Final. An 8-name bracket adds the Quarterfinals.',
        ],
      },
      {
        heading: 'Winners',
        paragraphs: [
          'Click either name once both sides of a match are filled in. The winner moves to the next round. The other name stays in place so you can still see who lost.',
          'Click the highlighted winner to clear that match. Undo puts back the previous set of winners, up to 30 steps in this visit. Clearing winners removes the ones you clicked and leaves byes alone. A later match that had been using the old winner is cleared too, so a new winner does not inherit someone else’s path.',
        ],
      },
      {
        heading: 'Saving, sharing, and export',
        paragraphs: [
          'After you build, the bracket is written to local storage in this browser. A refresh on this device loads it. Reset deletes that copy. A different browser, or cleared site storage, will not have it.',
          'The share link holds the title, the names, the seeding, and the winners in the URL hash. A hash is not sent to BabelDoc with the page request. Anyone you send the link to can read the names, because that is what the link is for.',
          'Download PNG draws the bracket onto a picture in this browser and saves the file. It is not a screenshot of a league template. Print opens your browser’s print dialog. The dialog can save a PDF. Wide brackets are scaled down to fit a landscape page width. A 64-name bracket is tall, so the PNG is the cleaner copy.',
        ],
      },
      {
        heading: 'What this page does not do',
        paragraphs: [
          'It does not run a double-elimination bracket, a third-place match, groups, or a series that is first to more than one win. One click advances a name.',
          'It does not use another organization’s name, logo, or bracket artwork. It does not record scores, only who won the match. It does not store the bracket on a BabelDoc server.',
        ],
      },
      {
        heading: 'Privacy',
        paragraphs: [
          'Names you type are saved in local storage on this device after you build the bracket. They are not sent to BabelDoc. Creating a share link puts those names in the address bar. Copy that link only when you want someone else to see them.',
          'Analytics, when it is running, records the page without the hash, so the names in a share link are not part of the analytics address. The privacy policy has the site-wide rules.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How many names can I add?',
        answer:
          'From 2 to 64. Extra lines past 64 are left out, and the page says so. Blank lines are skipped. A name longer than 48 characters is shortened.',
      },
      {
        question: 'What if I do not have a power-of-two number of names?',
        answer:
          'The bracket grows to the next size of 2, 4, 8, 16, 32, or 64. The empty spots are byes. The top seeds face those byes and advance without a click.',
      },
      {
        question: 'How are seeds assigned?',
        answer:
          'With random seeding off, the first line is seed 1, the second is seed 2, and so on. Seed 1 and seed 2 are placed on opposite sides of the bracket. With random seeding on, the list is shuffled once each time you build, and that new order becomes the seeds.',
      },
      {
        question: 'Does the share link upload the names?',
        answer:
          'No. The link stores the bracket in the URL hash on your device. BabelDoc does not keep a copy. Sending the link shows the recipient the title, the names, and any winners you marked.',
      },
      {
        question: 'Is this an official league bracket?',
        answer:
          'No. It is a generic single-elimination bracket for an office pool, an esports night, or a league you run yourself. It is not affiliated with any league or organizer, and it does not use their names or logos.',
      },
    ],
    related: ['super-bowl-squares-generator', 'ai-seating-chart-generator', 'discord-timestamp-generator'],
    added: '2026-11-23',
    layout: 'wide',
    browserRequirements:
      'Requires a modern web browser. JavaScript is required to build the bracket, record winners, share a link, save it on this device, and download a PNG. You can still read the guide without JavaScript. Printing uses the browser print dialog.',
    component: TournamentBracket,
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

const RELATED_LIMIT = 3;

export function getRelated(tool: ToolDefinition): ToolDefinition[] {
  const picked: ToolDefinition[] = [];
  const seen = new Set<string>([tool.slug]);

  const take = (candidate: ToolDefinition | undefined) => {
    if (!candidate || seen.has(candidate.slug) || picked.length >= RELATED_LIMIT) return;
    seen.add(candidate.slug);
    picked.push(candidate);
  };

  for (const slug of tool.related) take(toolsBySlug.get(slug));
  for (const candidate of tools) {
    if (candidate.category === tool.category) take(candidate);
  }
  for (const candidate of tools) take(candidate);

  return picked;
}
