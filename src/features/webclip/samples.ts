// Bundled sample pages so the demo works offline and on hosts where public fetch proxies are blocked.
// All copy here is original.

export type Sample = { id: string; title: string; site: string; byline: string; url: string; blurb: string; html: string }

const PIC = (seed: string, w = 900, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export const SAMPLES: Sample[] = [
  {
    id: 'sourdough',
    title: 'The 48-Hour Sourdough: A Recipe That Forgives You',
    site: 'crumbandcrust.example',
    byline: 'By Ida Ferreira',
    url: 'https://crumbandcrust.example/48-hour-sourdough',
    blurb: 'Recipe page with ads, a sidebar and a comment wall, the classic print nightmare.',
    html: `
<figure><img src="${PIC('sourdough')}" alt="A round loaf of sourdough bread with a scored crust"><figcaption>A long, cold ferment does most of the work for you.</figcaption></figure>
<p>Most sourdough recipes assume you have a free Saturday and the patience of a monk. This one assumes you have a job, a fridge, and a vague desire to eat bread on Sunday. The dough spends almost all of its life cold, which slows everything down and makes the timing forgiving.</p>
<h2>What you need</h2>
<ul>
<li>500 g bread flour (or 450 g bread flour + 50 g whole wheat)</li>
<li>375 g water at room temperature</li>
<li>100 g active sourdough starter</li>
<li>10 g fine sea salt</li>
</ul>
<h2>Day one, evening</h2>
<p>Mix the flour and water in a large bowl until no dry flour remains. Cover and leave it for 45 minutes. Add the starter and salt, then squeeze and fold the dough with a wet hand until it feels uniform. It will be shaggy and sticky. That is fine.</p>
<p>Over the next two hours, do three sets of stretch-and-folds spaced thirty minutes apart. Then cover the bowl and put it in the fridge.</p>
<blockquote><p>The fridge is not a pause button. It is a slow-motion button. Flavour keeps developing the whole time.</p></blockquote>
<h2>Day two, any time</h2>
<p>Take the dough out, shape it into a tight round on a lightly floured counter, and put it seam-side up in a floured banneton or a bowl lined with a tea towel. Back into the fridge it goes.</p>
<figure><img src="${PIC('dough', 900, 420)}" alt="Hands shaping bread dough on a floured counter"></figure>
<h2>Day three, morning</h2>
<p>Heat the oven to 250 °C with a Dutch oven inside for 45 minutes. Turn the cold dough out onto parchment, score it, and lower it into the pot. Bake 20 minutes with the lid on, then 22 to 25 minutes with the lid off until deeply browned.</p>
<h3>Troubleshooting</h3>
<table>
<thead><tr><th>Problem</th><th>Likely cause</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>Dense crumb</td><td>Under-fermented</td><td>Warmer first rise, or a stronger starter</td></tr>
<tr><td>Flat loaf</td><td>Over-proofed</td><td>Shorten the day-two rest</td></tr>
<tr><td>Pale crust</td><td>Oven too cool</td><td>Preheat longer, bake uncovered longer</td></tr>
</tbody>
</table>
<p>Let it cool for an hour before slicing. Yes, really. The inside is still cooking.</p>
<p><a href="https://crumbandcrust.example/starter">Need a starter? Start here.</a></p>
`,
  },
  {
    id: 'lighthouse',
    title: 'Why We Still Build Lighthouses',
    site: 'coastnotes.example',
    byline: 'By Marcus Adeyemi',
    url: 'https://coastnotes.example/why-we-still-build-lighthouses',
    blurb: 'Long-form essay with pull quotes, images and lots of links.',
    html: `
<p>GPS made lighthouses obsolete in the 1990s, or so the story goes. Yet coastal authorities keep maintaining them, and a handful of countries have built new ones this decade. The reasons say a lot about how we think about redundancy.</p>
<figure><img src="${PIC('lighthouse')}" alt="A white lighthouse on a rocky headland at dusk"><figcaption>A working light on the North Atlantic coast.</figcaption></figure>
<h2>The failure you cannot see</h2>
<p>Satellite positioning fails quietly. A jammed or spoofed receiver reports a confident, wrong position. A lighthouse fails loudly: the light goes out and everyone knows. Mariners describe this as the difference between <em>being lost</em> and <em>knowing you are lost</em>.</p>
<blockquote><p>"You do not navigate by the light. You navigate by the fact that the light agrees with everything else."</p></blockquote>
<h2>Cheap insurance</h2>
<p>A modern LED lantern draws less power than a kettle and runs unattended for years. Compared with the cost of a single grounding, the arithmetic is not close. The <a href="https://coastnotes.example/costs">full cost breakdown</a> is surprisingly small.</p>
<h2>What replaced the keepers</h2>
<p>Automation removed the people, not the buildings. Sensors report lamp health and fog conditions to a control room hundreds of kilometres away. The romance is gone; the reliability is better than it ever was.</p>
<figure><img src="${PIC('lantern', 900, 420)}" alt="Close-up of a Fresnel lens in a lighthouse lantern room"></figure>
<h3>Further reading</h3>
<ol>
<li><a href="https://coastnotes.example/fresnel">How a Fresnel lens bends light</a></li>
<li><a href="https://coastnotes.example/spoofing">GNSS spoofing incidents, 2019 to today</a></li>
<li><a href="https://coastnotes.example/keepers">Interviews with the last keepers</a></li>
</ol>
<p>Lighthouses are not nostalgia. They are the simplest possible answer to a question every engineer eventually asks: what happens when the clever thing breaks?</p>
`,
  },
  {
    id: 'onboarding',
    title: 'Employee Onboarding Checklist (Engineering)',
    site: 'people-ops.example',
    byline: 'People Operations',
    url: 'https://people-ops.example/handbook/onboarding-engineering',
    blurb: 'Internal doc with headings, checklists and a table. Great for testing text sizes.',
    html: `
<p>Use this checklist for every new engineer. Managers own the first week; buddies own the first month.</p>
<h2>Before day one</h2>
<ul>
<li>Laptop ordered and imaged</li>
<li>Accounts created: email, chat, source control, issue tracker</li>
<li>Buddy assigned and introduced by email</li>
<li>First-week calendar populated</li>
</ul>
<h2>Week one</h2>
<table>
<thead><tr><th>Day</th><th>Focus</th><th>Owner</th></tr></thead>
<tbody>
<tr><td>Monday</td><td>Welcome, hardware, security training</td><td>IT</td></tr>
<tr><td>Tuesday</td><td>Codebase tour, local environment</td><td>Buddy</td></tr>
<tr><td>Wednesday</td><td>Ship a one-line change to production</td><td>Buddy</td></tr>
<tr><td>Thursday</td><td>Meet the product team</td><td>Manager</td></tr>
<tr><td>Friday</td><td>Retro and questions</td><td>Manager</td></tr>
</tbody>
</table>
<h2>Month one</h2>
<ul>
<li>Own a small feature end to end</li>
<li>Join on-call shadow rotation</li>
<li>Write one page of documentation nobody asked for</li>
</ul>
<h2>Useful commands</h2>
<pre><code>git clone git@example.com:core/app.git
cd app && make setup
make test</code></pre>
<p>Questions about this page go to <a href="mailto:people@people-ops.example">people@people-ops.example</a>.</p>
`,
  },
]

export const sampleById = (id: string) => SAMPLES.find((s) => s.id === id)
