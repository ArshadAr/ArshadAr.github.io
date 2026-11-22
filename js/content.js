/* Shared copy for services / process / FAQ — edit freely */
import { S } from './core.js';
const id = (b, t) => (S.works.find(w => w.brand === b && w.title === t) || S.works[0]).id;

export const SERVICES = [
  {
    key: 'motion', cat: 'motion', name: 'Motion design', short: 'Motion design',
    line: 'Logo reveals, brand films and social motion with a signature rhythm — so your brand feels premium on every screen.',
    long: 'Good motion is invisible until it’s missing. I build motion that gives a brand its own rhythm: how the logo arrives, how type moves, how a product is revealed. Everything is designed to be recognisable in the first second and consistent across every format you publish.',
    deliver: ['Logo animation & sonic-ready intros', 'Brand motion systems & guidelines', 'Social reels & ad creatives', '3D product animation', 'Title design & kinetic type', 'Event & launch openers'],
    good: ['Launching or refreshing a brand', 'Making social content look premium', 'Product launches that need a hero video'],
    preview: id('Eleven 11', 'Brand film & showreel'),
  },
  {
    key: 'cgi', cat: 'cgi', name: 'CGI & FOOH billboards', short: 'CGI / VFX',
    line: 'Photoreal 3D drops on real streets — the “is this real?” ads that people stop for, screenshot and share.',
    long: 'Fake out-of-home (FOOH) and CGI films are the fastest way to make a brand feel bigger than it is. I track real locations, build the product in 3D, light it to match and composite it so well that the only question people ask is “where is this?”.',
    deliver: ['FOOH / CGI billboard films', 'Photoreal 3D product renders', 'Launch & opening-day films', 'VFX compositing & clean-up', 'Landmark & city CGI', 'Breakdowns for social proof'],
    good: ['Store openings and launches', 'Brands that want viral reach', 'Products that need studio-grade renders'],
    preview: id('Hive UAE', 'A bigger kind of reveal'),
  },
  {
    key: 'explainer', cat: 'motion', name: 'Explainers & UI motion', short: 'Explainers',
    line: '2D explainers and product walkthroughs that make a complex product click in about a minute.',
    long: 'If people don’t understand it, they don’t buy it. I script, design and animate explainers that remove confusion — characters, UI and diagrams that walk viewers from problem to “I get it” without a single wasted frame.',
    deliver: ['2D animated explainers', 'App & SaaS promo videos', 'UI animation & prototypes', 'Onboarding motion', 'Pitch & investor videos', 'Script & storyboard'],
    good: ['Startups and SaaS products', 'Apps launching new features', 'Teams explaining a big idea simply'],
    preview: id('Basari', 'A vision, explained'),
  },
  {
    key: 'film', cat: 'film', name: 'Brand films & production', short: 'Brand films',
    line: 'Concept, shoot, edit and colour — campaign films and reels for food, retail and lifestyle brands.',
    long: 'From the first idea to the final grade, under one creative eye. I direct and shoot product films, campaign stories and social reels, then edit, colour and finish them myself — so nothing gets lost between a camera crew, an editor and a designer.',
    deliver: ['Campaign & festive films', 'Product & food cinematography', 'Reels & social series', 'Edit, colour & sound design', 'Product photography', 'TV & performance ad cuts'],
    good: ['F&B, retail and lifestyle brands', 'Seasonal campaigns', 'Monthly social content'],
    preview: id('AIBI', 'The one-minute film'),
  },
  {
    key: 'ai', cat: 'ai', name: 'AI films & ads', short: 'AI films',
    line: 'AI-generated characters and commercials — directed, edited and finished with a designer’s eye.',
    long: 'AI makes production faster, but taste still decides what works. I use AI video tools to create characters, worlds and full commercials, then direct, edit, grade and composite them so the result feels on-brand, not generated.',
    deliver: ['AI commercials', 'AI brand characters & series', 'Concept & pitch visualisation', 'Hybrid AI + live action + VFX', 'Rapid ad variations', 'Storyboards & animatics'],
    good: ['Tight timelines and budgets', 'Ideas impossible to shoot', 'Testing many ad variations'],
    preview: id('Clinava', 'AI ad'),
  },
];

export const PROCESS = [
  { t: 'Chat', d: 'A quick WhatsApp or call. Tell me the brand, the goal, the deadline and where it will run.' },
  { t: 'Concept', d: 'You get a clear idea, references or style frames, a timeline and a fixed quote — before anything starts.' },
  { t: 'Create', d: 'I design, shoot, animate or render, sharing progress so there are never any surprises.' },
  { t: 'Deliver', d: 'Final files in every size you need — Reels, YouTube, TV, billboards — plus two rounds of revisions.' },
];

export const FAQ = [
  ['How much does a project cost?', 'Every project is different, so I quote after understanding the brief. You always get a fixed price before work starts — no surprise invoices. Share your budget range in the brief and I’ll suggest the best way to use it.'],
  ['How long does it take?', 'Logo animations and social pieces usually take a few days. Explainers, CGI billboards and brand films usually take one to three weeks depending on scope. If you have a hard deadline, tell me early.'],
  ['Do you work with clients outside Kerala?', 'Yes. I work with brands across India, the UAE and beyond. Everything — briefs, reviews and delivery — happens online, so location is never a problem.'],
  ['How many revisions do I get?', 'Two rounds of revisions are included in every project. Most clients don’t need more because we agree on the idea and style frames before production starts.'],
  ['Can you handle the whole project — idea to final file?', 'That’s the point. Concept, script, design, shooting, 3D, animation, edit, colour and sound can all happen with one person, so the idea stays intact from start to finish.'],
  ['What do you need from me to start?', 'Your brand assets (logo, fonts, colours), the goal of the video, where it will be published and your deadline. If you don’t have everything yet, we can figure it out together.'],
];
