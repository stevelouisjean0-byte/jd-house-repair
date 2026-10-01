// Builds the static pages from shared parts so the header, footer and house
// drawing stay identical everywhere. Run: node tools/build.cjs
// The generated .html files are what GitHub Pages serves; edit here, not there.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const PHONE = '(407) 668-2768';
const TEL = 'tel:+14076682768';

/* ---------------- rooms (only jobs reviewers describe) ---------------- */
const ROOMS = [
  {
    key: 'kitchen', n: '01', file: 'kitchen.html', name: 'Kitchen',
    sub: 'Backsplash, cabinet hardware, pendant lighting.',
    title: 'Kitchen: backsplash, hardware & pendant lighting',
    desc: 'Kitchen backsplash, cabinet hardware and pendant lighting by JD House Repair Services in Sorrento, FL. Call (407) 668-2768.',
    quote: 'Joel added my backsplash, cabinet hardware and pendant lighting. The quality of work is amazing and his fee is fair.',
    by: 'DustinJohns · Google review · 3 years ago',
    hint: 'Say which part of the kitchen: the wall behind the counter, the cabinet doors and drawers, or the light over the island or sink.',
    media: `
      <div class="media m-kitchen">
        <figure class="mf mf-a"><img src="assets/img/backsplash-install.jpg" alt="A hand pressing a sheet of mosaic tile onto a kitchen wall" loading="lazy" width="1400" height="934"></figure>
        <figure class="mf mf-b"><video class="lazyvid" muted loop playsinline preload="none" poster="assets/vid/light-fixture.jpg" aria-label="A man fitting a light fixture to a ceiling"><source src="assets/vid/light-fixture.mp4" type="video/mp4"></video></figure>
        <figure class="mf mf-c"><video class="lazyvid" muted loop playsinline preload="none" poster="assets/vid/hinge-drill.jpg" aria-label="Drilling a hinge into a cabinet board"><source src="assets/vid/hinge-drill.mp4" type="video/mp4"></video></figure>
        <figure class="mf mf-d"><img src="assets/img/brass-pulls.jpg" alt="Ornate brass pulls on wooden cabinet doors" loading="lazy" width="900" height="1350"></figure>
      </div>
      <figure class="mf mf-band"><img src="assets/img/pendants.jpg" alt="Glass pendant lamps glowing over a kitchen" loading="lazy" width="1200" height="800"></figure>`,
  },
  {
    key: 'ceilings', n: '02', file: 'ceilings-walls.html', name: 'Ceilings &amp; walls',
    sub: 'Repairs after plumbing leaks.',
    title: 'Ceiling & wall repair after leaks',
    desc: 'Ceiling and wall repairs after plumbing leaks by JD House Repair Services in Sorrento, FL. Call (407) 668-2768.',
    quote: 'Joel was amazing at getting my house repaired after several plumbing leaks, the specific repairs he performed included ceiling and wall repairs, and replacement of my water heater.',
    by: 'Lia Lopez · Google review · 2 years ago',
    hint: 'If it came from a leak, say whether the leak has been stopped, and roughly how big the stain or damaged patch is.',
    media: `
      <div class="media m-ceil">
        <figure class="mf mf-wide"><video class="lazyvid" muted loop playsinline preload="none" poster="assets/vid/ceiling-patch.jpg" aria-label="A worker skimming compound over a patched ceiling"><source src="assets/vid/ceiling-patch.mp4" type="video/mp4"></video></figure>
        <figure class="mf"><img src="assets/img/ceiling-sand.jpg" alt="A worker sanding taped drywall seams on a ceiling" loading="lazy" width="1400" height="934"></figure>
        <figure class="mf"><img src="assets/img/plaster-hand.jpg" alt="A gloved hand working plaster into a wall corner" loading="lazy" width="1000" height="667"></figure>
      </div>`,
  },
  {
    key: 'heater', n: '03', file: 'water-heater.html', name: 'Water heater',
    sub: 'Replacement, from the same job.',
    title: 'Water heater replacement',
    desc: 'Water heater replacement by JD House Repair Services in Sorrento, FL. Call (407) 668-2768.',
    quote: '&hellip;and replacement of my water heater. The work was done to a high standard, and I was impressed by his expertise and skill.',
    by: 'Lia Lopez · Google review · 2 years ago',
    hint: 'A photo of the label on the side of the tank, and where it sits (garage, closet, laundry room), saves a lot of back and forth.',
    media: `
      <div class="media m-one">
        <figure class="mf"><img src="assets/img/utility-heater.jpg" style="object-position:50% 12%" alt="A laundry room with a wall-mounted water heater above a washer and dryer" loading="lazy" width="1200" height="800"></figure>
      </div>`,
  },
  {
    key: 'other', n: '04', file: 'other-repairs.html', name: 'Other repairs',
    sub: 'General home repair and handyman work.',
    title: 'Home repair & handyman work',
    desc: 'General home repair and handyman services by JD House Repair Services in Sorrento, FL. Call (407) 668-2768.',
    quote: 'They were reliable, easy to work with, and made sure everything was completed properly. I&rsquo;d definitely recommend them for home repair and handyman services.',
    by: 'Noah Williams · Local Guide · Google review · 3 weeks ago',
    hint: 'Got a job that isn&rsquo;t in one of the rooms here? Describe it and ask. A short list of several small jobs is fine too.',
    media: `
      <div class="media m-two">
        <figure class="mf"><img src="assets/img/tool-pouch.jpg" alt="A leather tool pouch holding hand tools against a dark wall" loading="lazy" width="1000" height="667"></figure>
        <figure class="mf"><img src="assets/img/tools-flat.jpg" alt="A saw, hammer, gloves and tape measure laid out on a wooden surface" loading="lazy" width="1200" height="800"></figure>
      </div>`,
  },
];

const PAGES_NAV = [
  ...ROOMS.map((r) => ({ file: r.file, label: r.name, key: r.key })),
  { file: 'reviews.html', label: 'Reviews', key: 'reviews' },
  { file: 'contact.html', label: 'Contact', key: 'contact' },
];

/* ---------------- shared parts ---------------- */
const head = ({ title, desc }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#14161C">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700&family=Rethink+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "JD House Repair Services LLC",
  "telephone": "+1-407-668-2768",
  "address": { "@type": "PostalAddress", "streetAddress": "25444 FL-46 Unit 1", "addressLocality": "Sorrento", "addressRegion": "FL", "postalCode": "32776", "addressCountry": "US" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "reviewCount": "9" }
}
</script>
</head>`;

const header = (active) => `
<a class="skip" href="#main">Skip to content</a>

<header class="bar" id="top">
  <a class="mark" href="index.html" aria-label="JD House Repair Services, home">
    <svg class="mark-house" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 15 16 4l13 11v13H3z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><rect x="12" y="18" width="8" height="10" fill="currentColor"/></svg>
    <span class="mark-text">JD House Repair</span>
  </a>
  <nav class="nav" id="siteNav" aria-label="Site">
    <p class="nav-k">Rooms</p>
${PAGES_NAV.map((p) => `    <a href="${p.file}"${p.key === active ? ' aria-current="page"' : ''}${p.key === 'reviews' ? ' class="nav-sec nav-first-sec"' : p.key === 'contact' ? ' class="nav-sec"' : ''}>${p.label}</a>`).join('\n')}
  </nav>
  <a class="call-pill" href="${TEL}"><span class="dot" aria-hidden="true"></span>${PHONE}</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="siteNav"><span class="menu-lines" aria-hidden="true"></span><span class="menu-word">Menu</span></button>
  <div class="tape" aria-hidden="true">
    <div class="tape-blade" id="tapeBlade"><span class="tape-hook"></span></div>
  </div>
</header>`;

const footer = () => `
<footer class="foot">
  <div class="foot-top">
    <p class="foot-mark">JD House Repair Services&nbsp;LLC</p>
    <p class="foot-line">Handyman · 25444 FL-46 Unit 1, Sorrento, FL 32776 · <a href="${TEL}">${PHONE}</a></p>
  </div>
  <nav class="foot-nav" aria-label="Footer">
    <a href="index.html">Home</a>
${PAGES_NAV.map((p) => `    <a href="${p.file}">${p.label}</a>`).join('\n')}
  </nav>
  <div class="foot-fine">
    <p>Images are illustrative. Reviews are quoted as written on Google.</p>
    <p><strong>Hiring any contractor in Florida?</strong> You can look up licence status at <a href="https://www.myfloridalicense.com/" target="_blank" rel="noopener">myfloridalicense.com</a>.</p>
  </div>
</footer>

<a class="dock" href="${TEL}" aria-label="Call JD House Repair, ${PHONE}">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>
  <span>Call now</span>
</a>

<script src="assets/site.js" defer></script>
</body>
</html>
`;

/* the cutaway house; lit = room key to light, or 'all' for the home menu */
const roomLink = (key) => ROOMS.find((r) => r.key === key).file;
const cutaway = (lit, id = 'cutaway') => {
  const cls = (k) => `room${lit === k ? ' lit' : ''}`;
  const a = (k, inner) => `<a href="${roomLink(k)}" class="${cls(k)}" data-room="${k}" aria-label="${ROOMS.find((r) => r.key === k).name.replace('&amp;', 'and')}">${inner}</a>`;
  return `<svg class="cutaway" id="${id}" viewBox="0 0 600 560" role="img" aria-labelledby="${id}T">
        <title id="${id}T">Cutaway drawing of a two-storey house. Each room links to its page.</title>
        <defs>
          <radialGradient id="glow" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#F4B93A"/></radialGradient>
          <pattern id="tiles" width="12" height="8" patternUnits="userSpaceOnUse"><path d="M0 0h12M0 4h12M0 8h12M6 0v4M0 4v4M12 4v4" stroke="rgba(23,24,28,.4)" stroke-width=".8" fill="none"/></pattern>
        </defs>
        <g class="sky" fill="#C9CEDA"><circle cx="48" cy="40" r="1.4"/><circle cx="130" cy="78" r="1"/><circle cx="210" cy="24" r="1.2"/><circle cx="392" cy="30" r="1"/><circle cx="520" cy="60" r="1.5"/><circle cx="570" cy="120" r="1"/><circle cx="92" cy="140" r="1"/></g>
        <rect x="418" y="78" width="40" height="96" class="shell"/>
        <polygon points="36,212 300,44 564,212" class="roof"/>
        <rect x="64" y="208" width="472" height="314" class="shell"/>
        <text x="300" y="168" class="attic">JD</text>
        ${a('ceilings', `<rect x="74" y="218" width="220" height="136" class="fill"/>
          <g class="det"><path d="M176 224c10 4 20 2 26 7s18 4 24-1 12 1 16 4" class="patch"/><path d="M214 238c0 6-4 9-4 13a4 4 0 0 0 8 0c0-4-4-7-4-13z" class="drip"/><rect x="96" y="300" width="96" height="30" rx="3"/><rect x="96" y="290" width="26" height="14" rx="3"/><path d="M92 340h110M244 250v96M270 250v96M244 272h26M244 296h26M244 320h26"/></g>
          <text x="86" y="244" class="rlabel">02 · Ceilings &amp; walls</text>`)}
        ${a('other', `<rect x="306" y="218" width="220" height="136" class="fill"/>
          <g class="det"><rect x="340" y="258" width="46" height="36" rx="2"/><path d="M346 288l10-12 8 8 6-6 10 10"/><rect x="440" y="252" width="52" height="102"/><circle cx="482" cy="306" r="2.4" class="solid"/><rect x="334" y="318" width="70" height="30" rx="3"/><path d="M354 318v-8h30v8M334 330h70"/></g>
          <text x="318" y="244" class="rlabel">04 · Other repairs</text>`)}
        ${a('kitchen', `<rect x="74" y="366" width="220" height="146" class="fill"/>
          <g class="det"><rect x="86" y="410" width="196" height="30" class="tilewall"/><rect x="86" y="440" width="196" height="10"/><rect x="86" y="450" width="196" height="54"/><path d="M151 450v54M216 450v54"/><path d="M136 470v12M166 470v12M201 470v12M231 470v12" class="pull"/><rect x="86" y="392" width="62" height="14"/><rect x="212" y="378" width="70" height="28"/>
            <g class="lamps"><g class="lamp"><path d="M184 366v18"/><path d="M174 394a10 10 0 0 1 20 0z" class="shade"/></g><g class="lamp l2"><path d="M198 366v12"/><path d="M188 388a10 10 0 0 1 20 0z" class="shade"/></g></g></g>
          <text x="86" y="384" class="rlabel">01 · Kitchen</text>`)}
        ${a('heater', `<rect x="306" y="366" width="220" height="146" class="fill"/>
          <g class="det"><rect x="340" y="416" width="54" height="88" rx="18"/><path d="M352 416v-12h10M382 416v-12h-10M340 440h54"/><circle cx="367" cy="484" r="5"/><rect x="420" y="446" width="58" height="58" rx="4"/><circle cx="449" cy="478" r="16"/><path d="M420 458h58"/></g>
          <text x="318" y="386" class="rlabel">03 · Water heater</text>`)}
        <path d="M64 360h472" class="floor"/>
        <path d="M300 208v314" class="floor"/>
        <path d="M0 522h600" class="ground"/>
      </svg>`;
};

const reviewCard = (q, name, meta, off = false) => `
    <article class="so${off ? ' so-off' : ''} rv">
      <span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
      <p class="so-q">${q}</p>
      <p class="so-by"><strong>${name}</strong> ${meta}</p>
    </article>`;

const REVIEWS = {
  dustin: ['Joel is so kind and really takes his time to make sure he is providing quality work. Joel added my backsplash, cabinet hardware and pendant lighting. The quality of work is amazing and his fee is fair. If you have the chance to meet his wife, she is just as wonderful. If you need something done in your house, Joel is your guy!', 'DustinJohns', 'Local Guide · 21 reviews · 3 years ago'],
  noah: ['Had a great experience with JD House Repair Services. The work was handled professionally and efficiently, with great attention to detail. They were reliable, easy to work with, and made sure everything was completed properly. I&rsquo;d definitely recommend them for home repair and handyman services.', 'Noah Williams', 'Local Guide · 87 reviews · 3 weeks ago'],
  lia: ['Joel was amazing at getting my house repaired after several plumbing leaks, the specific repairs he performed included ceiling and wall repairs, and replacement of my water heater. The work was done to a high standard, and I was impressed by his expertise and skill. I highly recommend him to anyone that needs his services.', 'Lia Lopez', '8 reviews · 2 years ago'],
};
const MAPS = 'https://www.google.com/maps/search/?api=1&amp;query=JD+house+repair+services+llc+25444+FL-46+Sorrento+FL';
const DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&amp;destination=25444+FL-46+Unit+1+Sorrento+FL+32776';

const scoreBlock = (h, tag = 'h2', withLink = true) => `
    <p class="eyebrow">Signed off</p>
    <${tag} class="h2 h2-ink">${h}</${tag}>
    <div class="score-num">
      <span class="score-big" data-count="4.6">4.6</span>
      <span class="score-meta">
        <span class="stars stars-lg" style="--fill:92%" aria-label="4.6 out of 5 stars"></span>
        <span class="score-of">from 9 Google reviews</span>
      </span>
    </div>
    <p class="mentions">What reviewers mention most</p>
    <ul class="tags">
      <li><span class="tag-w">workmanship</span><span class="tag-c">4</span></li>
      <li><span class="tag-w">work</span><span class="tag-c">3</span></li>
      <li><span class="tag-w">on time</span><span class="tag-c">2</span></li>
    </ul>
    ${withLink ? `<a class="link-arrow" href="${MAPS}" target="_blank" rel="noopener">Read all 9 on Google Maps</a>` : ''}`;

const ctaBand = () => `
<section class="band">
  <div class="band-in">
    <h2 class="band-h">Something in your house need fixing?</h2>
    <div class="band-cta">
      <a class="btn btn-ink" href="${TEL}">Call ${PHONE}</a>
      <a class="btn btn-line" href="contact.html">Send the details</a>
    </div>
  </div>
</section>`;

/* ---------------- pages ---------------- */
function home() {
  return `${head({ title: 'JD House Repair Services · Handyman in Sorrento, FL', desc: 'JD House Repair Services LLC, a handyman in Sorrento, Florida. Backsplash, cabinet hardware, pendant lighting, ceiling and wall repairs, water heater replacement. Call (407) 668-2768.' })}
<body class="pg-home">
${header('home')}

<main id="main">

<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow rv">Handyman · Sorrento, Florida</p>
    <h1 class="hero-h rv">
      <span class="ln">Professional.</span>
      <span class="ln">Quality.</span>
      <span class="ln">Flawless <span class="hl">work.</span></span>
    </h1>
    <p class="hero-attr rv">That's how a Google reviewer summed it up. <strong>JD House Repair Services LLC</strong> handles the repairs, fixtures and finish work that make a house feel finished.</p>
    <div class="hero-cta rv">
      <a class="btn btn-ink" href="${TEL}">Call ${PHONE}</a>
      <a class="btn btn-line" href="#house">Pick a room</a>
    </div>
    <dl class="facts rv">
      <div><dt>Google rating</dt><dd><span class="big" data-count="4.6">4.6</span><span class="stars" style="--fill:92%" aria-label="4.6 out of 5 stars"></span></dd></div>
      <div><dt>Reviews</dt><dd><span class="big">9</span></dd></div>
      <div><dt>Hours on Google</dt><dd><span class="big sm">Open 24&nbsp;hrs</span></dd></div>
    </dl>
  </div>
  <figure class="gable">
    <div class="gable-frame">
      <video class="lazyvid" autoplay muted loop playsinline preload="metadata" poster="assets/vid/hero-tile.jpg" aria-label="Gloved hands setting a large tile into mortar">
        <source src="assets/vid/hero-tile.mp4" type="video/mp4">
      </video>
      <span class="gable-shade" aria-hidden="true"></span>
    </div>
  </figure>
</section>

<section class="house house-menu" id="house" aria-labelledby="houseH">
  <div class="flash" aria-hidden="true"></div>
  <div class="menu-grid">
    <div class="menu-copy">
      <p class="eyebrow eyebrow-dusk rv">Room by room</p>
      <h2 id="houseH" class="h2 rv">Pick a room. The lights come on where the work was&nbsp;done.</h2>
      <p class="lede rv">No invented service menu. Every room here is a job JD House Repair's own Google reviewers describe.</p>
      <ol class="room-list">
${ROOMS.map((r) => `        <li class="rv"><a class="room-link" href="${r.file}" data-room="${r.key}"><span class="rl-n">${r.n}</span><span class="rl-name">${r.name}</span><span class="rl-sub">${r.sub}</span><span class="rl-go" aria-hidden="true">&rarr;</span></a></li>`).join('\n')}
      </ol>
    </div>
    <div class="menu-stage rv">
      ${cutaway('none')}
      <p class="stage-key">Tap a room to open it.</p>
    </div>
  </div>
</section>

<section class="reviews reviews-teaser" aria-labelledby="revH">
  <div class="score rv">${scoreBlock('What customers put their names&nbsp;to.', 'h2', false)}
    <a class="link-arrow" href="reviews.html">Read the reviews</a>
  </div>
  <div class="signoffs">${reviewCard(...REVIEWS.noah)}
  </div>
</section>

<section class="strip">
  <div class="strip-in">
    <div class="strip-item"><p class="card-k">Call</p><a class="strip-v" href="${TEL}">${PHONE}</a></div>
    <div class="strip-item"><p class="card-k">Find us</p><p class="strip-v">25444 FL-46 Unit 1, Sorrento</p></div>
    <div class="strip-item"><p class="card-k">Hours on Google</p><p class="strip-v">Open 24 hours</p></div>
    <a class="btn btn-tape" href="contact.html">Contact &amp; directions</a>
  </div>
</section>

</main>
${footer()}`;
}

function roomPage(r, i) {
  const prev = ROOMS[(i + ROOMS.length - 1) % ROOMS.length];
  const next = ROOMS[(i + 1) % ROOMS.length];
  return `${head({ title: `${r.title} · JD House Repair Services, Sorrento FL`, desc: r.desc })}
<body class="pg-room">
${header(r.key)}

<main id="main">

<section class="house room-hero" aria-labelledby="roomH">
  <div class="flash" aria-hidden="true"></div>
  <div class="rh-grid">
    <div class="rh-copy">
      <p class="crumbs rv"><a href="index.html#house">Rooms</a> <span aria-hidden="true">/</span> ${r.n}</p>
      <h1 id="roomH" class="rh-h rv">${r.name}</h1>
      <p class="ch-sub rv">${r.sub}</p>
      <blockquote class="ev rv">
        <p>&ldquo;${r.quote}&rdquo;</p>
        <footer>${r.by}</footer>
      </blockquote>
      <div class="ch-cta rv">
        <a class="btn btn-tape" href="${TEL}">Call ${PHONE}</a>
        <a class="btn btn-ghost" href="contact.html?room=${r.key}">Send the details</a>
      </div>
    </div>
    <div class="rh-stage rv">
      ${cutaway(r.key)}
      <p class="stage-key">${r.n} ${r.name}: lights on. Tap another room to go there.</p>
    </div>
  </div>
</section>

<section class="gallery" aria-label="Pictures">
  <div class="gallery-in rv">${r.media}
  </div>
</section>

<section class="prep" aria-labelledby="prepH">
  <div class="prep-in">
    <p class="eyebrow">Before you call</p>
    <h2 id="prepH" class="h2 h2-ink rv">Three things that make the first call&nbsp;quick.</h2>
    <ol class="prep-list">
      <li class="rv"><span class="prep-n">1</span><p><strong>Where it is and what you see.</strong> ${r.hint}</p></li>
      <li class="rv"><span class="prep-n">2</span><p><strong>A photo, if you can take one.</strong> It's the fastest way to explain a repair.</p></li>
      <li class="rv"><span class="prep-n">3</span><p><strong>When you'd like it done.</strong> Mention if it's urgent, like an active leak.</p></li>
    </ol>
  </div>
</section>

<nav class="pager" aria-label="Other rooms">
  <a class="pg pg-prev" href="${prev.file}"><span class="pg-k">&larr; Previous room</span><span class="pg-n">${prev.n}</span><span class="pg-name">${prev.name}</span></a>
  <a class="pg pg-next" href="${next.file}"><span class="pg-k">Next room &rarr;</span><span class="pg-n">${next.n}</span><span class="pg-name">${next.name}</span></a>
</nav>

${ctaBand()}

</main>
${footer()}`;
}

function reviewsPage() {
  return `${head({ title: 'Reviews · JD House Repair Services, Sorrento FL', desc: 'JD House Repair Services LLC has a 4.6 rating from 9 Google reviews. Read what customers wrote.' })}
<body class="pg-reviews">
${header('reviews')}

<main id="main">
<section class="reviews reviews-page" id="reviews" aria-labelledby="revH">
  <div class="score rv">${scoreBlock('What customers put their names&nbsp;to.', 'h1')}
  </div>
  <div class="signoffs">${reviewCard(...REVIEWS.dustin)}${reviewCard(...REVIEWS.noah, true)}${reviewCard(...REVIEWS.lia)}
    <div class="snips rv">
      <p class="snips-h">From Google's review summary</p>
      <p class="snip">&ldquo;On time, great work, and customer service.&rdquo;</p>
      <p class="snip">&ldquo;Professional,Quality,Flawless Work.&rdquo;</p>
    </div>
    <p class="rev-note rv">Showing the 3 reviews with full text. The other 6 are on <a href="${MAPS}" target="_blank" rel="noopener">Google Maps</a>.</p>
  </div>
</section>

${ctaBand()}
</main>
${footer()}`;
}

function contactPage() {
  return `${head({ title: 'Contact & directions · JD House Repair Services, Sorrento FL', desc: 'Call JD House Repair Services at (407) 668-2768, or find us at 25444 FL-46 Unit 1, Sorrento, FL 32776.' })}
<body class="pg-contact">
${header('contact')}

<main id="main">
<section class="visit visit-page" id="visit" aria-labelledby="visH">
  <div class="visit-grid">
    <div class="req rv">
      <p class="eyebrow eyebrow-ink">Start the job</p>
      <h1 id="visH" class="h2 h2-ink">Tell us what needs&nbsp;fixing.</h1>
      <form class="form" id="reqForm" novalidate>
        <fieldset class="chips">
          <legend>Which room?</legend>
          <label><input type="radio" name="room" value="Kitchen" data-key="kitchen" checked><span>Kitchen</span></label>
          <label><input type="radio" name="room" value="Ceilings & walls" data-key="ceilings"><span>Ceilings &amp; walls</span></label>
          <label><input type="radio" name="room" value="Water heater" data-key="heater"><span>Water heater</span></label>
          <label><input type="radio" name="room" value="Something else" data-key="other"><span>Something else</span></label>
        </fieldset>
        <label class="fld"><span>Your name</span><input name="name" autocomplete="name" required></label>
        <label class="fld"><span>What's going on?</span><textarea name="msg" rows="4" required placeholder="e.g. water stain on the bedroom ceiling after a leak"></textarea></label>
        <button class="btn btn-ink btn-wide" type="submit">Text it to ${PHONE}</button>
        <p class="form-note">Opens your phone's messaging app with this pre-filled. Nothing is stored on this site.</p>
      </form>
    </div>
    <aside class="card rv" aria-label="Contact details">
      <div class="card-row">
        <p class="card-k">Call</p>
        <a class="card-v card-phone" href="${TEL}">${PHONE}</a>
      </div>
      <div class="card-row">
        <p class="card-k">Address</p>
        <p class="card-v">25444 FL-46 Unit 1<br>Sorrento, FL 32776</p>
        <p class="card-s">Plus code RF57+4Q Sorrento, Florida</p>
      </div>
      <div class="card-row">
        <p class="card-k">Hours</p>
        <p class="card-v">Open 24 hours</p>
        <p class="card-s">As listed on Google. Call ahead to confirm.</p>
      </div>
      <a class="btn btn-line btn-wide" href="${DIRECTIONS}" target="_blank" rel="noopener">Get directions</a>
    </aside>
  </div>
</section>
</main>
${footer()}`;
}

/* ---------------- write ---------------- */
const out = { 'index.html': home(), 'reviews.html': reviewsPage(), 'contact.html': contactPage() };
ROOMS.forEach((r, i) => { out[r.file] = roomPage(r, i); });
for (const [f, html] of Object.entries(out)) {
  fs.writeFileSync(path.join(ROOT, f), html.replace(/\n{3,}/g, '\n\n'));
  console.log('wrote', f);
}
