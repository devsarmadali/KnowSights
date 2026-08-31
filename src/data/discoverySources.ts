import { DiscoverySource, DiscoveryArticle, GeneratedTopicIdea } from '../types';

export const DISCOVERY_SOURCES: DiscoverySource[] = [
  // --------------------------------------------------------------------------
  // 1. WORLD HISTORY & CIVILIZATIONS (7 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'history-com',
    name: 'History.com',
    type: 'History media/education site',
    category: 'General & world history',
    group: 'history',
    bestFor: 'Short, engaging articles on historical events, people, wars and civilizations',
    officialUrl: 'https://www.history.com/',
    feedUrl: 'https://news.google.com/rss/search?q=site:history.com/news+OR+site:history.com/topics&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:history.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'World History & Pivotal Events',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'emerald'
  },
  {
    id: 'bbc-history',
    name: 'BBC History',
    type: 'Public broadcaster',
    category: 'World history',
    group: 'history',
    bestFor: 'Accessible articles, historical events, biographies and civilizations',
    officialUrl: 'https://www.bbc.co.uk/history',
    feedUrl: 'https://news.google.com/rss/search?q=site:bbc.co.uk/history+OR+site:bbc.com/history&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:bbc.com+history+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Global Historical Chronicles',
    defaultFormat: 'SF05 — Historical Analogy',
    badgeColor: 'emerald'
  },
  {
    id: 'smithsonian-history',
    name: 'Smithsonian Magazine – History',
    type: 'Museum/research publication',
    category: 'History & archaeology',
    group: 'history',
    bestFor: 'Unusual historical stories, discoveries, people and forgotten events',
    officialUrl: 'https://www.smithsonianmag.com/history/',
    feedUrl: 'https://www.smithsonianmag.com/rss/history/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:smithsonianmag.com/history+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Forgotten Historical Narratives',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'emerald'
  },
  {
    id: 'history-extra',
    name: 'HistoryExtra',
    type: 'History magazine',
    category: 'General history',
    group: 'history',
    bestFor: 'Readable historical stories, biographies, battles and historical mysteries',
    officialUrl: 'https://www.historyextra.com/',
    feedUrl: 'https://www.historyextra.com/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:historyextra.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Medieval & Modern Battles',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'emerald'
  },
  {
    id: 'history-today',
    name: 'History Today',
    type: 'Historical magazine',
    category: 'World history',
    group: 'history',
    bestFor: 'Historical analysis, events, biographies and lesser-known history',
    officialUrl: 'https://www.historytoday.com/',
    feedUrl: 'https://news.google.com/rss/search?q=site:historytoday.com&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:historytoday.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Scholarly Historical Analysis',
    defaultFormat: 'SF05 — Historical Analogy',
    badgeColor: 'emerald'
  },
  {
    id: 'thoughtco-history',
    name: 'ThoughtCo History',
    type: 'Educational reference site',
    category: 'General history',
    group: 'history',
    bestFor: 'Explanatory history articles, civilizations and historical concepts',
    officialUrl: 'https://www.thoughtco.com/history-4133512',
    feedUrl: 'https://news.google.com/rss/search?q=site:thoughtco.com+history&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:thoughtco.com+history+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Historical Concepts & Timelines',
    defaultFormat: 'SF03 — Evolution Over Time',
    badgeColor: 'emerald'
  },
  {
    id: 'smithsonian-discoveries',
    name: 'Smithsonian Discoveries',
    type: 'Research/museum publication',
    category: 'History, archaeology, science',
    group: 'history',
    bestFor: 'Strange discoveries, lost artifacts, fossils, ancient mysteries',
    officialUrl: 'https://www.smithsonianmag.com/tag/discoveries/',
    feedUrl: 'https://www.smithsonianmag.com/rss/latest_articles/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:smithsonianmag.com/tag/discoveries+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Historical Curiosities & Discoveries',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'emerald'
  },

  // --------------------------------------------------------------------------
  // 2. ARCHAEOLOGY & ANCIENT MYSTERIES (7 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'smithsonian-archaeology',
    name: 'Smithsonian Archaeology',
    type: 'Museum/research publication',
    category: 'Archaeology',
    group: 'archaeology',
    bestFor: 'Ancient discoveries, excavations, artifacts, human history',
    officialUrl: 'https://www.smithsonianmag.com/category/archaeology/',
    feedUrl: 'https://www.smithsonianmag.com/rss/archaeology/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:smithsonianmag.com/category/archaeology+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Excavations & Lost Settlements',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'amber'
  },
  {
    id: 'natgeo-history',
    name: 'National Geographic – History',
    type: 'Science/history media',
    category: 'History & archaeology',
    group: 'archaeology',
    bestFor: 'Ancient civilizations, archaeology, exploration and historical discoveries',
    officialUrl: 'https://www.nationalgeographic.com/history',
    feedUrl: 'https://news.google.com/rss/search?q=site:nationalgeographic.com/history+OR+site:nationalgeographic.com+archaeology&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:nationalgeographic.com+history+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Ancient Civilizations & Expeditions',
    defaultFormat: 'SF03 — Evolution Over Time',
    badgeColor: 'amber'
  },
  {
    id: 'world-history-encyclopedia',
    name: 'World History Encyclopedia',
    type: 'Historical reference site',
    category: 'Ancient & world history',
    group: 'archaeology',
    bestFor: 'Civilizations, battles, rulers, cultures, timelines and historical biographies',
    officialUrl: 'https://www.worldhistory.org/',
    feedUrl: 'https://news.google.com/rss/search?q=site:worldhistory.org&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:worldhistory.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Ancient Cultures & Rulers',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'amber'
  },
  {
    id: 'ancient-origins',
    name: 'Ancient Origins',
    type: 'History/archaeology publication',
    category: 'Ancient history',
    group: 'archaeology',
    bestFor: 'Archaeological discoveries, mysteries, ancient civilizations and unusual historical stories',
    officialUrl: 'https://www.ancient-origins.net/',
    feedUrl: 'https://news.google.com/rss/search?q=site:ancient-origins.net+artifacts+OR+excavations+OR+civilizations&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:ancient-origins.net+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Ancient Enigmas & Lost Architecture',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'amber'
  },
  {
    id: 'live-science-history',
    name: 'Live Science – History',
    type: 'Science/history media',
    category: 'Archaeology & ancient history',
    group: 'archaeology',
    bestFor: 'New discoveries, archaeology and surprising historical findings',
    officialUrl: 'https://www.livescience.com/history',
    feedUrl: 'https://news.google.com/rss/search?q=site:livescience.com/history+OR+site:livescience.com+archaeology&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:livescience.com/history+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Surprising Archaeological Finds',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'amber'
  },
  {
    id: 'archaeology-magazine',
    name: 'Archaeology Magazine',
    type: 'Archaeology publication',
    category: 'Archaeology',
    group: 'archaeology',
    bestFor: 'Archaeological discoveries and ancient civilizations',
    officialUrl: 'https://archaeology.org/',
    feedUrl: 'https://archaeology.org/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:archaeology.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Ancient Civilizations & Relics',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'amber'
  },
  {
    id: 'archaeology-archive-hoaxes',
    name: 'Archaeology Magazine Archive',
    type: 'Archaeological archive',
    category: 'Strange archaeology',
    group: 'archaeology',
    bestFor: 'Archaeological mysteries, hoaxes, unusual discoveries and disputed artifacts',
    officialUrl: 'https://archive.archaeology.org/online/features/hoaxes/',
    feedUrl: 'https://news.google.com/rss/search?q=site:archive.archaeology.org+OR+site:archaeology.org+hoax+OR+disputed+OR+mysteries&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:archaeology.org+{query}+hoax+OR+disputed+OR+mystery&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Disputed Artifacts & Antiquity Hoaxes',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'amber'
  },

  // --------------------------------------------------------------------------
  // 3. ACADEMIC, IDEAS & CULTURAL ESSAYS (5 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'the-collector',
    name: 'The Collector',
    type: 'History/culture publication',
    category: 'Art, history & civilizations',
    group: 'academic',
    bestFor: 'Accessible stories about historical figures, civilizations, art and culture',
    officialUrl: 'https://www.thecollector.com/',
    feedUrl: 'https://www.thecollector.com/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:thecollector.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Arts, Culture & Literature',
    topicFamily: 'Art History & Ancient Icons',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'indigo'
  },
  {
    id: 'the-conversation-history',
    name: 'The Conversation – History',
    type: 'Academic journalism',
    category: 'Academic history made accessible',
    group: 'academic',
    bestFor: 'University researchers explaining historical discoveries and debates',
    officialUrl: 'https://theconversation.com/us/topics/history-8',
    feedUrl: 'https://theconversation.com/global/topics/history-8/articles.atom',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:theconversation.com+{query}+evidence+OR+history&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Human Behavior & Society',
    topicFamily: 'Academic Historical Debates',
    defaultFormat: 'SF08 — Visualized Rules & Quirks',
    badgeColor: 'indigo'
  },
  {
    id: 'jstor-daily',
    name: 'JSTOR Daily',
    type: 'Academic-publication platform',
    category: 'History & humanities',
    group: 'academic',
    bestFor: 'Engaging articles derived from scholarly research',
    officialUrl: 'https://daily.jstor.org/',
    feedUrl: 'https://daily.jstor.org/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:daily.jstor.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Philosophy & Human Thought',
    topicFamily: 'Academic Papers Decoded',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'indigo'
  },
  {
    id: 'aeon-history',
    name: 'Aeon – History',
    type: 'Ideas/history publication',
    category: 'Intellectual & cultural history',
    group: 'academic',
    bestFor: 'Deep, unusual stories about civilizations, ideas and historical figures',
    officialUrl: 'https://aeon.co/essays',
    feedUrl: 'https://aeon.co/feed.rss',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:aeon.co+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Philosophy & Human Thought',
    topicFamily: 'Intellectual Movements & Civilizational Ideas',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'indigo'
  },
  {
    id: 'laphams-quarterly',
    name: "Lapham's Quarterly",
    type: 'Historical publication',
    category: 'World history',
    group: 'academic',
    bestFor: 'Historical events and ideas presented through primary sources and essays',
    officialUrl: 'https://www.laphamsquarterly.org/',
    feedUrl: 'https://news.google.com/rss/search?q=site:laphamsquarterly.org&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:laphamsquarterly.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Primary Archives & Historical Voices',
    defaultFormat: 'SF05 — Historical Analogy',
    badgeColor: 'indigo'
  },

  // --------------------------------------------------------------------------
  // 4. CURIOSITIES, HIDDEN PLACES & LORE (4 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'atlas-obscura-history',
    name: 'Atlas Obscura – History',
    type: 'Cultural discovery publication',
    category: 'Hidden history',
    group: 'curiosities',
    bestFor: 'Forgotten places, unusual events, strange traditions and historical curiosities',
    officialUrl: 'https://www.atlasobscura.com/',
    feedUrl: 'https://www.atlasobscura.com/feeds/latest',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:atlasobscura.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Geography & Exploration',
    topicFamily: 'Hidden Geography & Forgotten Monuments',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'purple'
  },
  {
    id: 'public-domain-review',
    name: 'The Public Domain Review',
    type: 'Historical/cultural archive',
    category: 'Historical curiosities',
    group: 'curiosities',
    bestFor: 'Strange, fascinating and forgotten historical texts, images and ideas',
    officialUrl: 'https://publicdomainreview.org/',
    feedUrl: 'https://publicdomainreview.org/rss.xml',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:publicdomainreview.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Arts, Culture & Literature',
    topicFamily: 'Bizarre Manuscripts & Forgotten Inventions',
    defaultFormat: 'SF08 — Visualized Rules & Quirks',
    badgeColor: 'purple'
  },
  {
    id: 'mental-floss-history',
    name: 'Mental Floss – History',
    type: 'Popular knowledge publication',
    category: 'Interesting facts',
    group: 'curiosities',
    bestFor: 'Short historical facts, unusual events and obscure knowledge',
    officialUrl: 'https://www.mentalfloss.com/',
    feedUrl: 'https://www.mentalfloss.com/rss.xml',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:mentalfloss.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'History & Civilizations',
    topicFamily: 'Obscure Historical Inventions & Facts',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'purple'
  },
  {
    id: 'amusing-planet',
    name: 'Amusing Planet',
    type: 'Popular history/geography site',
    category: 'Curiosities',
    group: 'curiosities',
    bestFor: 'Unusual historical places, events, objects and geographical stories',
    officialUrl: 'https://www.amusingplanet.com/',
    feedUrl: 'https://feeds.feedburner.com/amusingplanet',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:amusingplanet.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Architecture & Design',
    topicFamily: 'Odd Architectural Feats & Physical Anomalies',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'purple'
  },

  // --------------------------------------------------------------------------
  // 5. SCIENCE & NATURE DISCOVERIES (4 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'live-science',
    name: 'Live Science',
    type: 'Science publication',
    category: 'Science, archaeology & discoveries',
    group: 'science',
    bestFor: 'Mysterious discoveries, archaeology, fossils, animals, space and unusual science',
    officialUrl: 'https://www.livescience.com/',
    feedUrl: 'https://www.livescience.com/feeds/all',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:livescience.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Biological Anomalies & Fossils',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'cyan'
  },
  {
    id: 'science-alert',
    name: 'ScienceAlert',
    type: 'Science publication',
    category: 'Science & discoveries',
    group: 'science',
    bestFor: 'Strange scientific findings, archaeology, space, biology and natural phenomena',
    officialUrl: 'https://www.sciencealert.com/',
    feedUrl: 'https://www.sciencealert.com/feed',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:sciencealert.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Emerging Phenomena & Physics',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'cyan'
  },
  {
    id: 'smithsonian-science',
    name: 'Smithsonian Science',
    type: 'Research institution',
    category: 'Science & nature',
    group: 'science',
    bestFor: 'New species, fossils, biology, astronomy and unusual scientific discoveries',
    officialUrl: 'https://www.si.edu/newsdesk/research-news',
    feedUrl: 'https://news.google.com/rss/search?q=site:si.edu/newsdesk+OR+site:smithsonianmag.com/science-nature&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:si.edu+{query}+research&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Nature & Organisms',
    topicFamily: 'Species Evolution & Paleontology',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'cyan'
  },
  {
    id: 'popular-mechanics-science',
    name: 'Popular Mechanics',
    type: 'Science/technology publication',
    category: 'Science & technology',
    group: 'science',
    bestFor: 'Strange inventions, unusual science, engineering and historical technology',
    officialUrl: 'https://www.popularmechanics.com/science/',
    feedUrl: 'https://www.popularmechanics.com/rss/science.xml',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:popularmechanics.com/science+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Technology & Engineering',
    topicFamily: 'Unusual Engineering & Physics',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'cyan'
  }
];

export const SOURCE_GROUPS = [
  { id: 'all', label: 'All Curated Resources (27)', icon: 'Sparkles', color: 'emerald' },
  { id: 'history', label: '📜 World History (7)', icon: 'Scroll', color: 'emerald' },
  { id: 'archaeology', label: '🏺 Archaeology & Mysteries (7)', icon: 'Landmark', color: 'amber' },
  { id: 'academic', label: '🎓 Academic & Ideas (5)', icon: 'BookOpen', color: 'indigo' },
  { id: 'curiosities', label: '🗺️ Curiosities & Lore (4)', icon: 'Compass', color: 'purple' },
  { id: 'science', label: '🔬 Science & Discoveries (4)', icon: 'Atom', color: 'cyan' },
] as const;

// --------------------------------------------------------------------------
// IDEA TRANSFORMATION & HEURISTIC ENGINE (ZERO-AI DETERMINISTIC GENERATOR)
// --------------------------------------------------------------------------

function cleanText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveVideoConcept(rawTitle: string): string {
  let title = cleanText(rawTitle);
  title = title
    .replace(/\s*\|\s*(History\.com|BBC History|Smithsonian|Live Science|ScienceAlert|Atlas Obscura|Archaeology Magazine|Ancient Origins|National Geographic|Popular Mechanics|HistoryExtra|History Today|The Conversation|JSTOR Daily|Mental Floss|Amusing Planet|World History Encyclopedia|The Collector|ThoughtCo|Aeon|Lapham's Quarterly).*$/i, '')
    .replace(/\s*-\s*(History\.com|BBC History|Smithsonian|Live Science|ScienceAlert|Atlas Obscura|Archaeology Magazine|Ancient Origins|National Geographic|Popular Mechanics|HistoryExtra|History Today|The Conversation|JSTOR Daily|Mental Floss|Amusing Planet|World History Encyclopedia|The Collector|ThoughtCo|Aeon|Lapham's Quarterly).*$/i, '')
    .replace(/^(Watch|Photos|Video|Audio|Podcast):\s*/i, '')
    .trim();

  if (!title.match(/^(Why|How|The|What|When|Inside|Why did)/i) && title.length < 75) {
    if (title.toLowerCase().startsWith('archaeologists') || title.toLowerCase().startsWith('scientists') || title.toLowerCase().startsWith('historians')) {
      title = title.replace(/^(Archaeologists|Scientists|Historians|Researchers)\s+(find|discover|reveal|uncover|explain)\s+/i, 'The Discovery of ');
    }
  }
  return title;
}

function synthesizeCuriosityHook(title: string, summary: string, source: DiscoverySource): string {
  const cleanT = deriveVideoConcept(title);

  if (source.group === 'archaeology') {
    return `Why did an unexpected artifact uncovered in recent excavations completely contradict centuries of conventional historical assumptions about ${cleanT}?`;
  } else if (source.group === 'science') {
    return `What bizarre physical mechanism was captured for the first time, and why does ${cleanT} challenge our fundamental models of nature?`;
  } else if (source.group === 'history') {
    return `The overlooked historical records that reveal how ${cleanT} quietly reshaped civilization without modern textbooks noticing.`;
  } else if (source.group === 'academic') {
    return `Why do centuries of conventional wisdom fail to explain ${cleanT}, and what did new scholarly archival evidence recently uncover?`;
  } else {
    return `Why does ${cleanT} still operate on rules completely alien to modern logic, and what happened when researchers investigated inside?`;
  }
}

function generateThreeQuestions(title: string, summary: string, source: DiscoverySource): [string, string, string] {
  const cleanT = deriveVideoConcept(title);

  if (source.group === 'archaeology') {
    return [
      `What specific physical artifacts or architectural clues were uncovered at the site that altered our timeline of this civilization?`,
      `How did the ancient engineers or inhabitants construct or navigate this without modern tools or technology?`,
      `What does this discovery prove about trade routes, knowledge transmission, or societal dynamics that wasn't previously acknowledged?`
    ];
  } else if (source.group === 'science') {
    return [
      `What experimental observation, fossil analysis, or astronomical measurement confirmed the presence of this anomaly?`,
      `What exact underlying biological, chemical, or physical mechanism explains why this phenomenon occurs?`,
      `How does understanding this system unlock new technological applications or alter our understanding of physical limits?`
    ];
  } else if (source.group === 'history' || source.group === 'academic') {
    return [
      `What primary source documents, diaries, or archival records brought this forgotten episode back to light?`,
      `What economic, religious, or political pressures pushed the key historical figures to make this counterintuitive decision?`,
      `How did the ripple effects of this historical event set the stage for institutions or cultural norms we take for granted today?`
    ];
  } else {
    return [
      `What is the origin story of this peculiar site, object, or tradition, and who originally constructed or designed it?`,
      `What unexpected laws, physical constraints, or eccentric customs govern how this place operates?`,
      `Why was this curious discovery lost to mainstream public memory, and what does it reveal about human idiosyncrasy?`
    ];
  }
}

function matchSignatureFormat(title: string, summary: string, defaultFormat: string): string {
  const combined = (title + ' ' + summary).toLowerCase();
  if (combined.includes('how') && (combined.includes('work') || combined.includes('engine') || combined.includes('built') || combined.includes('mechanism'))) {
    return 'SF17 — Under the Hood';
  }
  if (combined.includes('why') && (combined.includes('paradox') || combined.includes('wrong') || combined.includes('counterintuitive') || combined.includes('mystery'))) {
    return 'SF02 — Counterintuitive Mechanism';
  }
  if (combined.includes('rule') || combined.includes('quirk') || combined.includes('bizarre') || combined.includes('strange')) {
    return 'SF08 — Visualized Rules & Quirks';
  }
  if (combined.includes('evolution') || combined.includes('timeline') || combined.includes('century') || combined.includes('history')) {
    return 'SF03 — Evolution Over Time';
  }
  if (combined.includes('system') || combined.includes('hidden') || combined.includes('network') || combined.includes('code')) {
    return 'SF01 — Hidden System';
  }
  return defaultFormat || 'SF04 — Case Study Breakdown';
}

function calculateScore(title: string, source: DiscoverySource): number {
  let score = 87;
  const t = title.toLowerCase();
  if (t.includes('discovery') || t.includes('ancient') || t.includes('mystery') || t.includes('reveals') || t.includes('hidden') || t.includes('empire')) {
    score += 4;
  }
  if (t.includes('new') || t.includes('first time') || t.includes('uncovers') || t.includes('bizarre') || t.includes('secret')) {
    score += 3;
  }
  return Math.min(96, Math.max(84, score));
}

/**
 * Transforms a raw publication article into a KnowSights-ready topic idea
 */
export function transformArticleToIdea(
  article: DiscoveryArticle,
  source: DiscoverySource
): GeneratedTopicIdea {
  const videoConcept = deriveVideoConcept(article.title);
  const hook = synthesizeCuriosityHook(article.title, article.summary, source);
  const questions = generateThreeQuestions(article.title, article.summary, source);
  const format = matchSignatureFormat(article.title, article.summary, source.defaultFormat);
  const score = calculateScore(article.title, source);

  return {
    id: `GEN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    video_idea: videoConcept,
    curiosity_hook: hook,
    core_questions: questions,
    signature_format: format,
    subject: source.subjectMapping,
    topic_family: source.topicFamily,
    source_name: source.name,
    source_url: article.link || source.officialUrl,
    source_article_title: cleanText(article.title),
    source_published_date: article.pubDate || new Date().toISOString().split('T')[0],
    source_category: source.category,
    production_score: score,
    priority_tier: score >= 90 ? 'Tier 1' : 'Tier 2',
    freshness_class: 'Recent Publication',
    visualization_direction: `Incorporate high-resolution publication imagery, historical timeline maps, 3D structural diagrams, and animated flowcharts demonstrating the core findings of ${source.name}.`,
    source_family_guidance: `Primary publication: ${source.name} (${source.officialUrl}). Refer to original reporting for verified field data, artifact measurements, and scholarly researcher commentary.`,
    added_to_pool: false
  };
}
