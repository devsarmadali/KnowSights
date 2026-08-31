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
  },

  // --------------------------------------------------------------------------
  // 6. SPACE EXPLORATION & ASTRONOMY (5 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'nasa-news',
    name: 'NASA News & Features',
    type: 'Government space agency',
    category: 'Space exploration & missions',
    group: 'space',
    bestFor: 'Mission updates, planetary discoveries, cosmic phenomena, telescope imagery and launch reports',
    officialUrl: 'https://www.nasa.gov/news/',
    feedUrl: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:nasa.gov+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Space & Astronomy',
    topicFamily: 'Space Missions & Planetary Probes',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'sky'
  },
  {
    id: 'space-com',
    name: 'Space.com',
    type: 'Space science publication',
    category: 'Space exploration',
    group: 'space',
    bestFor: 'Exoplanet discoveries, black holes, galaxy formation, auroras and cosmic events',
    officialUrl: 'https://www.space.com/',
    feedUrl: 'https://www.space.com/feeds/all',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:space.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Space & Astronomy',
    topicFamily: 'Exoplanets, Black Holes & Galactic Events',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'sky'
  },
  {
    id: 'astronomy-com',
    name: 'Astronomy Magazine',
    type: 'Astronomy publication',
    category: 'Astronomy & astrophysics',
    group: 'space',
    bestFor: 'Deep-sky observations, astrophysics research, telescope reviews and cosmology',
    officialUrl: 'https://astronomy.com/',
    feedUrl: 'https://astronomy.com/feed',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:astronomy.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Space & Astronomy',
    topicFamily: 'Astrophysics & Deep Space Observations',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'sky'
  },
  {
    id: 'esa-news',
    name: 'ESA (European Space Agency) News',
    type: 'Government space agency',
    category: 'Space science & exploration',
    group: 'space',
    bestFor: 'European missions, Mars rovers, climate satellites, gravitational wave detectors and reusable launchers',
    officialUrl: 'https://www.esa.int/Newsroom',
    feedUrl: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:esa.int+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Space & Astronomy',
    topicFamily: 'European Space Missions & Earth Observation',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'sky'
  },
  {
    id: 'sky-telescope',
    name: 'Sky & Telescope',
    type: 'Astronomy magazine',
    category: 'Observational astronomy',
    group: 'space',
    bestFor: 'Skywatching guides, planetary alignments, nebula photography, cosmological theories',
    officialUrl: 'https://skyandtelescope.org/',
    feedUrl: 'https://skyandtelescope.org/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:skyandtelescope.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Space & Astronomy',
    topicFamily: 'Observational Cosmology & Skywatching',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'sky'
  },

  // --------------------------------------------------------------------------
  // 7. AI, FUTURE TECHNOLOGIES & INNOVATION (6 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'mit-tech-review',
    name: 'MIT Technology Review',
    type: 'Technology research publication',
    category: 'AI, computing & emerging tech',
    group: 'ai-tech',
    bestFor: 'Breakthrough AI models, quantum computing, biotechnology, chip design and future tech policy',
    officialUrl: 'https://www.technologyreview.com/',
    feedUrl: 'https://www.technologyreview.com/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:technologyreview.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Technology & Engineering',
    topicFamily: 'AI Breakthroughs & Tech Ethics',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'violet'
  },
  {
    id: 'wired-science',
    name: 'WIRED Science & Future',
    type: 'Technology & culture publication',
    category: 'Technology, AI & society',
    group: 'ai-tech',
    bestFor: 'AI society impacts, biotech, geopolitics of tech, science reporting and digital futures',
    officialUrl: 'https://www.wired.com/science/',
    feedUrl: 'https://www.wired.com/feed/tag/science/latest/rss',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:wired.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Technology & Engineering',
    topicFamily: 'Digital Society & Tech Geopolitics',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'violet'
  },
  {
    id: 'new-scientist',
    name: 'New Scientist',
    type: 'Science & technology magazine',
    category: 'Science, AI & future discoveries',
    group: 'ai-tech',
    bestFor: 'Cognitive science, AI research, physics breakthroughs, biology and environmental science',
    officialUrl: 'https://www.newscientist.com/',
    feedUrl: 'https://www.newscientist.com/feed/home/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:newscientist.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Frontier Science & Cognitive Research',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'violet'
  },
  {
    id: 'ieee-spectrum',
    name: 'IEEE Spectrum',
    type: 'Technical engineering publication',
    category: 'Technology & engineering',
    group: 'ai-tech',
    bestFor: 'Semiconductor engineering, robotics, AI chips, power grids, autonomous systems and electronics',
    officialUrl: 'https://spectrum.ieee.org/',
    feedUrl: 'https://spectrum.ieee.org/feeds/feed.rss',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:spectrum.ieee.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Technology & Engineering',
    topicFamily: 'Engineering Systems & Semiconductor Design',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'violet'
  },
  {
    id: 'futurism-tech',
    name: 'Futurism',
    type: 'Future technology publication',
    category: 'AI, biotech & future tech',
    group: 'ai-tech',
    bestFor: 'AGI developments, CRISPR gene editing, longevity research, autonomous vehicles and climate tech',
    officialUrl: 'https://futurism.com/',
    feedUrl: 'https://futurism.com/feed',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:futurism.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Technology & Engineering',
    topicFamily: 'AGI, Biotech & Longevity Science',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'violet'
  },
  {
    id: 'singularity-hub',
    name: 'Singularity Hub',
    type: 'Exponential technology publication',
    category: 'AI, biotech & exponential tech',
    group: 'ai-tech',
    bestFor: 'Exponential technologies: robotics, synthetic biology, 3D printing, nanotech, AI ethics',
    officialUrl: 'https://singularityhub.com/',
    feedUrl: 'https://singularityhub.com/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:singularityhub.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Technology & Engineering',
    topicFamily: 'Exponential Tech & AI Futures',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'violet'
  },

  // --------------------------------------------------------------------------
  // 8. WORLD IN DATA, STATISTICS & EVIDENCE (5 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'our-world-in-data',
    name: 'Our World in Data',
    type: 'Research & data publication (Oxford)',
    category: 'Global statistics & evidence',
    group: 'data-stats',
    bestFor: 'Long-run datasets on poverty, health, energy, education, war, population and economic growth',
    officialUrl: 'https://ourworldindata.org/',
    feedUrl: 'https://ourworldindata.org/atom.xml',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:ourworldindata.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Economics & Wealth',
    topicFamily: 'Long-Run Global Data & Trend Reversals',
    defaultFormat: 'SF03 — Evolution Over Time',
    badgeColor: 'rose'
  },
  {
    id: 'statista-research',
    name: 'Statista Research & Reports',
    type: 'Statistics & market research platform',
    category: 'Market data & statistics',
    group: 'data-stats',
    bestFor: 'Consumer behaviour, media, industry revenues, tech adoption and regional market comparisons',
    officialUrl: 'https://www.statista.com/',
    feedUrl: 'https://news.google.com/rss/search?q=site:statista.com+{query}&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:statista.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Economics & Wealth',
    topicFamily: 'Market Intelligence & Consumer Trends',
    defaultFormat: 'SF08 — Visualized Rules & Quirks',
    badgeColor: 'rose'
  },
  {
    id: 'pew-research',
    name: 'Pew Research Center',
    type: 'Nonpartisan research & polling institution',
    category: 'Public opinion, society & demographics',
    group: 'data-stats',
    bestFor: 'Generational shifts, religious demographics, tech adoption by age, political polarization data',
    officialUrl: 'https://www.pewresearch.org/',
    feedUrl: 'https://www.pewresearch.org/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:pewresearch.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Human Behavior & Society',
    topicFamily: 'Social Behaviour & Demographic Shifts',
    defaultFormat: 'SF03 — Evolution Over Time',
    badgeColor: 'rose'
  },
  {
    id: 'gapminder-foundation',
    name: 'Gapminder Foundation',
    type: 'Factfulness & development data NGO',
    category: 'Global development & misconceptions',
    group: 'data-stats',
    bestFor: 'Data-busting global myths, child mortality trends, income convergence and human progress metrics',
    officialUrl: 'https://www.gapminder.org/',
    feedUrl: 'https://news.google.com/rss/search?q=site:gapminder.org+{query}&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:gapminder.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Human Behavior & Society',
    topicFamily: 'Myth-Busting Development Facts',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'rose'
  },
  {
    id: 'human-progress-org',
    name: 'HumanProgress.org (Cato)',
    type: 'Long-run human flourishing data',
    category: 'Progress, wellbeing & prosperity',
    group: 'data-stats',
    bestFor: 'Long-run data on life expectancy, literacy, violence decline, calorie access and democratic spread',
    officialUrl: 'https://www.humanprogress.org/',
    feedUrl: 'https://news.google.com/rss/search?q=site:humanprogress.org+{query}&hl=en-US&gl=US&ceid=US:en',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:humanprogress.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Human Behavior & Society',
    topicFamily: 'Long-Run Human Progress & Wellbeing',
    defaultFormat: 'SF03 — Evolution Over Time',
    badgeColor: 'rose'
  },

  // --------------------------------------------------------------------------
  // 9. FASCINATING FACTS, MYSTERIES & DISCOVERIES (5 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'how-stuff-works',
    name: 'HowStuffWorks Science',
    type: 'Explanatory science publication',
    category: 'Mechanisms, facts & explanations',
    group: 'facts-mysteries',
    bestFor: 'How everyday mechanisms work, strange physical phenomena, human biology quirks',
    officialUrl: 'https://science.howstuffworks.com/',
    feedUrl: 'https://feeds.howstuffworks.com/HowStuffWorks',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:howstuffworks.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Mechanism Explainers & Physical Quirks',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'orange'
  },
  {
    id: 'ripley-believe-it',
    name: "Ripley's Believe It or Not",
    type: 'Odd facts & curiosities publication',
    category: 'Bizarre world records & curiosities',
    group: 'facts-mysteries',
    bestFor: 'Extraordinary people, bizarre records, strange phenomena and impossible-sounding truths',
    officialUrl: 'https://www.ripleys.com/',
    feedUrl: 'https://www.ripleys.com/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:ripleys.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Bizarre World Records & Human Oddities',
    defaultFormat: 'SF08 — Visualized Rules & Quirks',
    badgeColor: 'orange'
  },
  {
    id: 'unexplained-mysteries',
    name: 'Unexplained Mysteries',
    type: 'Mystery & paranormal research site',
    category: 'Unsolved mysteries & anomalies',
    group: 'facts-mysteries',
    bestFor: 'Unsolved disappearances, cryptozoology, ancient enigmas and scientific anomalies',
    officialUrl: 'https://www.unexplained-mysteries.com/',
    feedUrl: 'https://www.unexplained-mysteries.com/rss.php',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:unexplained-mysteries.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Archaeology & Ancient Mysteries',
    topicFamily: 'Unsolved Anomalies & Cryptic Phenomena',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'orange'
  },
  {
    id: 'popular-science',
    name: 'Popular Science',
    type: 'Science & technology publication',
    category: 'Engaging science & technology',
    group: 'facts-mysteries',
    bestFor: 'Science breakthroughs, inventions, environmental discoveries and technology milestones',
    officialUrl: 'https://www.popsci.com/',
    feedUrl: 'https://www.popsci.com/arcio/rss/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:popsci.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Science Innovations & Breakthroughs',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'orange'
  },
  {
    id: 'strange-horizons',
    name: 'Discover Magazine',
    type: 'Science publication',
    category: 'Science discoveries & mysteries',
    group: 'facts-mysteries',
    bestFor: 'Brain science, evolutionary biology, animal cognition, space and surprising scientific reversals',
    officialUrl: 'https://www.discovermagazine.com/',
    feedUrl: 'https://www.discovermagazine.com/rss/blog/d0',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:discovermagazine.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Brain Science & Evolutionary Reversals',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'orange'
  },

  // --------------------------------------------------------------------------
  // 10. DEEP SCIENCE JOURNALS (ACCESSIBLE) (6 Sources)
  // --------------------------------------------------------------------------
  {
    id: 'nature-news',
    name: 'Nature News & Comment',
    type: 'Peer-reviewed science journal',
    category: 'Cutting-edge science research',
    group: 'deep-science',
    bestFor: 'Landmark discoveries in genetics, neuroscience, materials science, physics and climate',
    officialUrl: 'https://www.nature.com/news',
    feedUrl: 'https://www.nature.com/nature.rss',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:nature.com+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Peer-Reviewed Landmark Discoveries',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'emerald'
  },
  {
    id: 'science-mag',
    name: 'Science Magazine (AAAS)',
    type: 'Peer-reviewed science journal',
    category: 'General science research',
    group: 'deep-science',
    bestFor: 'Physics, chemistry, ecology, anthropology and engineering breakthroughs from AAAS',
    officialUrl: 'https://www.science.org/',
    feedUrl: 'https://www.science.org/rss/news_current.xml',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:science.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'AAAS Science Reports & Findings',
    defaultFormat: 'SF17 — Under the Hood',
    badgeColor: 'emerald'
  },
  {
    id: 'pnas-science',
    name: 'PNAS (Proceedings of the National Academy)',
    type: 'Peer-reviewed multidisciplinary journal',
    category: 'Multidisciplinary science',
    group: 'deep-science',
    bestFor: 'Human evolution, genetics, neuroscience, ecology and climate science research papers',
    officialUrl: 'https://www.pnas.org/',
    feedUrl: 'https://www.pnas.org/rss/current.xml',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:pnas.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Human Evolution & Genetic Research',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'emerald'
  },
  {
    id: 'the-conversation-science',
    name: 'The Conversation – Science',
    type: 'Academic journalism',
    category: 'Accessible science research',
    group: 'deep-science',
    bestFor: 'University researchers explaining complex science clearly: climate, health, AI, physics',
    officialUrl: 'https://theconversation.com/us/science',
    feedUrl: 'https://theconversation.com/global/topics/science-11/articles.atom',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:theconversation.com+science+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Academic Science Explained Plainly',
    defaultFormat: 'SF04 — Case Study Breakdown',
    badgeColor: 'emerald'
  },
  {
    id: 'phys-org',
    name: 'Phys.org',
    type: 'Science news aggregator',
    category: 'Physics, astronomy & materials',
    group: 'deep-science',
    bestFor: 'Quantum physics, materials science, astrophysics and environmental science news',
    officialUrl: 'https://phys.org/',
    feedUrl: 'https://phys.org/rss-feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:phys.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Quantum Physics & Materials Science',
    defaultFormat: 'SF01 — Hidden System',
    badgeColor: 'emerald'
  },
  {
    id: 'quanta-magazine',
    name: 'Quanta Magazine',
    type: 'Science journalism (Simons Foundation)',
    category: 'Mathematics, physics & biology',
    group: 'deep-science',
    bestFor: 'Accessible explanations of the deepest puzzles in math, physics, and biology',
    officialUrl: 'https://www.quantamagazine.org/',
    feedUrl: 'https://www.quantamagazine.org/feed/',
    searchFeedPattern: 'https://news.google.com/rss/search?q=site:quantamagazine.org+{query}&hl=en-US&gl=US&ceid=US:en',
    subjectMapping: 'Science & Discoveries',
    topicFamily: 'Mathematics, Quantum Physics & Biology Puzzles',
    defaultFormat: 'SF02 — Counterintuitive Mechanism',
    badgeColor: 'emerald'
  }
];

export const SOURCE_GROUPS = [
  { id: 'all', label: `All Curated Publications (54)`, icon: 'Sparkles', color: 'emerald' },
  { id: 'history', label: '📜 World History (7)', icon: 'Scroll', color: 'emerald' },
  { id: 'archaeology', label: '🏺 Archaeology & Mysteries (7)', icon: 'Landmark', color: 'amber' },
  { id: 'academic', label: '🎓 Academic & Ideas (5)', icon: 'BookOpen', color: 'indigo' },
  { id: 'curiosities', label: '🗺️ Curiosities & Lore (4)', icon: 'Compass', color: 'purple' },
  { id: 'science', label: '🔬 Science & Nature (4)', icon: 'Atom', color: 'cyan' },
  { id: 'space', label: '🚀 Space Exploration (5)', icon: 'Rocket', color: 'sky' },
  { id: 'ai-tech', label: '🤖 AI & Future Tech (6)', icon: 'Cpu', color: 'violet' },
  { id: 'data-stats', label: '📊 World in Data (5)', icon: 'BarChart2', color: 'rose' },
  { id: 'facts-mysteries', label: '🔮 Facts & Mysteries (5)', icon: 'Zap', color: 'orange' },
  { id: 'deep-science', label: '🧬 Deep Science Journals (6)', icon: 'FlaskConical', color: 'teal' },
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
    .replace(/\s*\|\s*(History\.com|BBC History|Smithsonian|Live Science|ScienceAlert|Atlas Obscura|Archaeology Magazine|Ancient Origins|National Geographic|Popular Mechanics|HistoryExtra|History Today|The Conversation|JSTOR Daily|Mental Floss|Amusing Planet|World History Encyclopedia|The Collector|ThoughtCo|Aeon|Lapham's Quarterly|MIT Technology Review|WIRED|New Scientist|IEEE Spectrum|Futurism|Singularity Hub|NASA|Space\.com|Astronomy|ESA|Sky & Telescope|Our World in Data|Statista|Pew Research|Gapminder|HowStuffWorks|Ripley's|Popular Science|Discover|Nature|Science|PNAS|Phys\.org|Quanta).*$/i, '')
    .replace(/\s*-\s*(History\.com|BBC History|Smithsonian|Live Science|ScienceAlert|Atlas Obscura|Archaeology Magazine|Ancient Origins|National Geographic|Popular Mechanics|HistoryExtra|History Today|The Conversation|JSTOR Daily|Mental Floss|Amusing Planet|World History Encyclopedia|The Collector|ThoughtCo|Aeon|Lapham's Quarterly|MIT Technology Review|WIRED|New Scientist|IEEE Spectrum|Futurism|Singularity Hub|NASA|Space\.com|Astronomy|ESA|Sky & Telescope|Our World in Data|Statista|Pew Research|Gapminder|HowStuffWorks|Ripley's|Popular Science|Discover|Nature|Science|PNAS|Phys\.org|Quanta).*$/i, '')
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
  } else if (source.group === 'science' || source.group === 'deep-science') {
    return `What bizarre physical mechanism was captured for the first time, and why does ${cleanT} challenge our fundamental models of nature?`;
  } else if (source.group === 'history') {
    return `The overlooked historical records that reveal how ${cleanT} quietly reshaped civilization without modern textbooks noticing.`;
  } else if (source.group === 'academic') {
    return `Why do centuries of conventional wisdom fail to explain ${cleanT}, and what did new scholarly archival evidence recently uncover?`;
  } else if (source.group === 'space') {
    return `What did telescopes, probes, or orbital data just confirm about ${cleanT} — and why does this force astronomers to rewrite their models?`;
  } else if (source.group === 'ai-tech') {
    return `Why is the engineering team behind ${cleanT} quietly dismantling every assumption the industry held for the past decade — and what does their approach reveal?`;
  } else if (source.group === 'data-stats') {
    return `The data on ${cleanT} shows the opposite of what most people believe — and the trend behind it has been silently building for fifty years.`;
  } else if (source.group === 'facts-mysteries') {
    return `Why does ${cleanT} still have no satisfying scientific explanation — and what do researchers keep finding every time they try to investigate?`;
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
  } else if (source.group === 'science' || source.group === 'deep-science') {
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
  } else if (source.group === 'space') {
    return [
      `What orbital measurement or telescope array captured the key signal that confirmed this phenomenon exists?`,
      `How does this discovery alter our existing models of planetary formation, stellar evolution, or galactic dynamics?`,
      `What engineering challenge does humanity need to solve before we could physically visit or fully characterize this object?`
    ];
  } else if (source.group === 'ai-tech') {
    return [
      `What technical breakthrough or architectural decision made this AI system or technology suddenly capable in a way previous versions were not?`,
      `What are the three most dangerous second-order consequences if this technology scales to a billion users within five years?`,
      `Which existing industry, profession, or institution is most structurally vulnerable to disruption by this specific technology?`
    ];
  } else if (source.group === 'data-stats') {
    return [
      `What does the long-run historical data on this actually show — and how does it contradict the popular narrative?`,
      `Which country or region is the most surprising outlier in this dataset, and what explains their divergence from the global trend?`,
      `If this trend continues at its current rate for another twenty years, what would the world look like in practical, visible terms?`
    ];
  } else if (source.group === 'facts-mysteries') {
    return [
      `What is the most credible scientific hypothesis currently proposed to explain this mystery — and what evidence still contradicts it?`,
      `How many independent researchers have investigated this, and what is the single piece of evidence they cannot account for?`,
      `If this phenomenon is eventually explained, what would that mean for our understanding of biology, physics, or human cognition?`
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
    source_id: source.id,
    source_name: source.name,
    source_url: article.link || source.officialUrl,
    source_official_url: source.officialUrl,
    source_article_title: cleanText(article.title),
    source_published_date: article.pubDate || new Date().toISOString().split('T')[0],
    source_category: source.category,
    reference_links: [
      { label: `Primary Article: ${cleanText(article.title)}`, url: article.link || source.officialUrl, type: 'Article' },
      { label: `Authority: ${source.name}`, url: source.officialUrl, type: 'Publication' }
    ],
    production_score: score,
    priority_tier: score >= 90 ? 'Tier 1' : 'Tier 2',
    freshness_class: 'Recent Publication',
    visualization_direction: `Incorporate high-resolution publication imagery, historical timeline maps, 3D structural diagrams, and animated flowcharts demonstrating the core findings of ${source.name}.`,
    source_family_guidance: `Primary publication: ${source.name} (${source.officialUrl}). Article link: ${article.link || source.officialUrl}. Refer to original reporting for verified field data, artifact measurements, and scholarly researcher commentary.`,
    added_to_pool: false,
    generated_at: new Date().toISOString(),
    generated_timestamp: Date.now()
  };
}
