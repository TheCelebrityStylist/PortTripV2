import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import OpenAI from 'npm:openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

// ─── INLINE PORT REGISTRY ────────────────────────────────────────────────────
const PORT_REGISTRY = {
  dublin: {
    displayName: 'Dublin', country: 'Ireland', portType: 'dock', tenderMin: 0, defaultBuffer: 90,
    portToCity: [
      { mode: 'bus', label: 'Bus 130', instruction: 'Walk 8min through port gate to Alexandra Road bus stop. Board Bus 130 towards city centre. Exit at Connolly Station.', duration: 26, cost: 3.3, note: 'Runs every 30min. Best value.' },
      { mode: 'taxi', label: 'Taxi from port gate', instruction: 'Taxis wait at the port exit. Agree a fixed price before entering — should be €12–15 to O\'Connell St.', duration: 18, cost: 14, note: 'Faster but more expensive. Use if bus is missed.' },
      { mode: 'walk', label: 'Walk to city', instruction: 'Walk along the North Wall Quay for 25min to reach O\'Connell Street. Flat, straightforward route.', duration: 25, cost: 0, note: 'Free but tiring if carrying bags.' },
    ],
    areas: ['City Centre / Trinity', 'Temple Bar & South Bank', 'Smithfield & Liberties', 'DART villages (Howth / Dún Laoghaire)'],
    attractions: [
      { name: 'Trinity College & Book of Kells', area: 'City Centre', dur: 90, cost: 18, score: 94, type: 'culture', why: 'Ireland\'s oldest university — the Long Room library and illuminated Book of Kells are genuinely world-class. Pre-book online.', tip: 'Visit the Long Room before 10am for unobstructed shots. Buy tickets online to save €6 and skip the queue.', trap: false },
      { name: 'Guinness Storehouse', area: 'Liberties', dur: 100, cost: 26, score: 88, type: 'culture', why: 'Seven floors of brewing history topped by a panoramic bar with a free pint. Required stop for first-timers.', tip: 'Pre-book; saves €6 and skips the queue. The Gravity Bar pint is included in ticket price.', trap: false },
      { name: 'Kilmainham Gaol', area: 'Kilmainham', dur: 90, cost: 8, score: 92, type: 'history', why: 'Where 1916 Rising leaders were executed — the emotional core of Irish independence. The guided tour is extraordinary.', tip: 'Sells out WEEKS ahead. If not booked, skip — walk-ins are rarely available. Priority #1 to book in advance.', trap: false },
      { name: 'St Patrick\'s Cathedral', area: 'Liberties', dur: 45, cost: 8, score: 82, type: 'history', why: 'Jonathan Swift\'s burial place, medieval gothic interior, less crowded than Trinity. Clusters with Guinness Storehouse.', tip: 'The south aisle has Swift\'s grave and his writing desk. Often overlooked by visitors.', trap: false },
      { name: 'National Museum of Ireland', area: 'City Centre', dur: 75, cost: 0, type: 'culture', score: 85, why: 'Celtic gold treasures and Bog People — among the finest collections in Europe. Completely free.', tip: 'The Treasury room with the Ardagh Chalice alone is worth 20 minutes.', trap: false },
      { name: 'Temple Bar Quarter', area: 'Temple Bar', dur: 60, cost: 0, type: 'culture', score: 72, why: 'Cobblestone streets, street art, galleries and buskers. Worth a 30min walk-through for the atmosphere.', tip: 'Drink prices here are 50–80% higher than normal Dublin pubs. Walk through, don\'t stop to eat.', trap: true },
      { name: 'Phoenix Park (deer viewing)', area: 'Phoenix Park', dur: 60, cost: 0, type: 'nature', score: 78, why: 'Europe\'s largest enclosed urban park — free-roaming wild deer. Peaceful escape.', tip: 'Deer congregate near the Papal Cross in the morning. Take Bus 37 from O\'Connell St — 15min.', trap: false },
      { name: 'Grafton Street & St Stephen\'s Green', area: 'City Centre', dur: 40, cost: 0, type: 'culture', score: 70, why: 'Premium shopping street with buskers + adjacent Victorian park. Good for the end of a walk.', tip: 'Bewley\'s Oriental Café on Grafton St has been serving coffee since 1840 — worth a stop.', trap: false },
    ],
    food: [
      { name: 'Mulligan\'s of Poolbeg Street', area: 'City Centre', cost: 8, tip: 'Best Guinness pint in Dublin — unchanged since 1782, no tourists, all locals. 3min walk from Trinity.', meal: 'pint + toastie', price: '€7–10' },
      { name: 'The Winding Stair', area: 'Ha\'penny Bridge', cost: 35, tip: 'Modern Irish cuisine in a beautiful bookshop setting. Wicklow beef, local seafood. Book ahead.', meal: 'Irish lunch', price: '€30–40' },
      { name: 'Fallon & Byrne', area: 'City Centre', cost: 20, tip: 'Artisan food hall — best quick but high-quality lunch. Deli counter, hot food, wine cellar.', meal: 'deli lunch', price: '€12–20' },
      { name: 'Leo Burdock\'s Fish & Chips', area: 'Liberties (near Christchurch)', cost: 10, tip: 'The most famous chipper in Dublin since 1913. Eat standing outside on Werburgh Street.', meal: 'fish & chips', price: '€8–12' },
    ],
    hiddenGems: [
      { name: 'Howth Village (DART)', instruction: 'Take DART from Connolly Station (25min, €5 return) — clifftop walks, fresh lobster at pier. Only if >5hrs in port.', dur: 180 },
      { name: 'Merrion Square', instruction: '5min walk from Trinity — Georgian townhouses, Oscar Wilde\'s birthplace, free Wilde statue. 20min walk-through.', dur: 20 },
      { name: 'The Little Museum of Dublin', instruction: 'On St Stephen\'s Green — intimate, witty, locally loved. 45min. Often no queue. €10.', dur: 45 },
    ],
    traps: ['Temple Bar pubs: €8+ for a Guinness (vs €5 in normal pubs)', 'Horse & carriage rides', 'Hop-on buses (unnecessary, city is walkable)'],
    shipVsDiy: 120, avgDiy: 45,
    safeReturn: 'Taxi back to port €12–15, always <20min. Very low risk. Allow 30min for safety.',
  },

  barcelona: {
    displayName: 'Barcelona', country: 'Spain', portType: 'dock', tenderMin: 0, defaultBuffer: 90,
    portToCity: [
      { mode: 'walk', label: 'Walk to Las Ramblas', instruction: 'Exit terminal and walk north along Passeig de Colom for 15min. The Columbus Monument marks the start of Las Ramblas.', duration: 15, cost: 0, note: 'Best if staying in Gothic Quarter area.' },
      { mode: 'metro', label: 'Metro from Drassanes', instruction: 'Walk 5min to Drassanes Metro station. Take Line 3 (Green) for 2 stops to Passeig de Gràcia for Eixample sights.', duration: 12, cost: 2.4, note: 'Best for Sagrada Família or Park Güell days.' },
      { mode: 'taxi', label: 'Taxi from port gate', instruction: 'Taxis queue at the port exit. €10–12 to city centre, 10min. Insist on meter.', duration: 10, cost: 11, note: 'Fastest option, fair price.' },
    ],
    areas: ['Gothic Quarter', 'El Born / Sant Pere', 'Eixample (Gaudí zone)', 'Barceloneta / waterfront', 'Gràcia / Park Güell zone'],
    attractions: [
      { name: 'Sagrada Família', area: 'Eixample', dur: 90, cost: 26, score: 97, type: 'culture', why: 'Gaudí\'s unfinished masterpiece — the interior is transcendently beautiful, unlike anything on earth. Non-negotiable.', tip: 'MUST book timed entry days ahead — sold out daily. Book the tower access add-on for rooftop views.', trap: false },
      { name: 'Gothic Quarter (Barri Gòtic)', area: 'Gothic Quarter', dur: 75, cost: 0, score: 90, type: 'culture', why: 'Roman-era ruins beneath medieval streets — free to explore, genuinely ancient. Contains a 2,000-year-old temple.', tip: 'Find Plaça de Sant Felip Neri — a hidden square with a bullet-pocked wall from the Civil War. Easy to miss.', trap: false },
      { name: 'La Boqueria Market', area: 'Las Ramblas', dur: 45, cost: 15, score: 82, type: 'food', why: 'World-famous food market. Best for browsing and quick bites — jamón, fresh juice, pintxos.', tip: 'Go before 10am. By midday it\'s too crowded to enjoy. The stalls toward the back have better prices and authenticity.', trap: false },
      { name: 'Park Güell (Monumental Zone)', area: 'Gràcia', dur: 75, cost: 10, score: 88, type: 'culture', why: 'Mosaic dragon, undulating benches, panoramic city view from the terrace.', tip: 'Timed entry mandatory — book 2 days ahead. The free area around the park is still beautiful if tickets are sold out.', trap: false },
      { name: 'Barceloneta Beach', area: 'Waterfront', dur: 60, cost: 0, score: 80, type: 'relaxation', why: 'Mediterranean swimming 15min walk from port. Best for relaxed days.', tip: 'Bring your own water — beach bar prices are 3x supermarket. Lidl on La Rambla del Mar sells snacks and sunscreen.', trap: false },
      { name: 'Casa Batlló', area: 'Passeig de Gràcia', dur: 60, cost: 35, score: 86, type: 'culture', why: 'Gaudí\'s \'house of bones\' — dragon-scale roof, bone facade, extraordinary interior. Premium but worth it.', tip: 'Book magic nights show for sunset — but daytime visit is cheaper and equally spectacular inside.', trap: false },
    ],
    food: [
      { name: 'El Xampanyet', area: 'El Born', cost: 15, tip: 'Best cava bar in Barcelona — Catalan anchovies, house cava, standing counter. Come before 1pm.', meal: 'tapas + cava', price: '€12–18' },
      { name: 'Bar del Pla', area: 'El Born', cost: 25, tip: 'Modern Catalan tapas in a beautiful tiled bar. Excellent patatas bravas and croquetas.', meal: 'tapas lunch', price: '€20–28' },
    ],
    hiddenGems: [
      { name: 'Bunkers del Carmel', instruction: 'Take Metro L4 to Joanic, 15min walk up. Anti-aircraft bunkers with 360° city panorama — the best free view in Barcelona.', dur: 60 },
    ],
    traps: ['Las Ramblas restaurants: €25+ for €10 food', 'Sagrada without pre-booked tickets: 2hr queue'],
    shipVsDiy: 95, avgDiy: 45,
    safeReturn: 'Metro/walk back to port is simple — allow 20min.',
  },

  rome: {
    displayName: 'Rome / Civitavecchia', country: 'Italy', portType: 'dock', tenderMin: 0, defaultBuffer: 150,
    portToCity: [
      { mode: 'train', label: 'Regional train to Roma Termini', instruction: 'Exit port gate, walk 8min to Civitavecchia station. Regionale train departs every 30min (€5.90, 1h15min to Roma Termini). Buy ticket at station machine.', duration: 83, cost: 5.9, note: 'Only realistic option for independent travel. MUST allow 2h45min total travel per leg.' },
      { mode: 'bus', label: 'Organised coach', instruction: 'Coaches depart from port terminal — check ship excursion desk or port board for scheduled departures. Typically €25–35pp return.', duration: 75, cost: 30, note: 'Eliminates train logistics — good if time is tight.' },
    ],
    areas: ['Vatican (Prati neighbourhood)', 'Centro Storico (Pantheon / Trevi)', 'Colosseum / Forum zone', 'Trastevere'],
    attractions: [
      { name: 'Colosseum & Roman Forum', area: 'Colosseum zone', dur: 150, cost: 18, score: 96, type: 'history', why: 'The defining monument of ancient Rome. Forum is included and equally spectacular.', tip: 'MUST buy timed entry online — walk-up queue is 2+ hours. The Forum is massive — allow full 2.5hrs.', trap: false },
      { name: 'Vatican Museums & Sistine Chapel', area: 'Vatican', dur: 180, cost: 30, score: 95, type: 'culture', why: 'Largest private art collection on earth. Raphael Rooms + Sistine Chapel is one of the greatest experiences in art history.', tip: 'Book 30 days ahead for timed entry — non-negotiable. Allow 3hrs minimum.', trap: false },
      { name: 'Pantheon', area: 'Centro Storico', dur: 45, cost: 5, score: 90, type: 'history', why: '2,000-year-old concrete dome still the largest unreinforced concrete dome on earth. Enter and tilt your head back.', tip: 'Now charges €5 entry — still absurd value. Go at opening time for no queue.', trap: false },
      { name: 'Trevi Fountain', area: 'Centro Storico', dur: 20, cost: 0, score: 75, type: 'culture', why: 'You have to see it, but manage expectations — it\'s spectacular but extremely crowded.', tip: 'Go at 7:30am before cruise coaches arrive. Completely different experience.', trap: false },
      { name: 'Trastevere neighbourhood', area: 'Trastevere', dur: 75, cost: 0, score: 88, type: 'culture', why: 'Medieval Rome neighbourhood — hanging laundry, cobbled alleys, vibrant evening scene. Clusters well with Vatican.', tip: 'Best lunch value in Rome is here — look for €12 pasta at basic trattorias away from the main piazza.', trap: false },
    ],
    food: [
      { name: 'Pizzarium Bonci', area: 'Prati (near Vatican)', cost: 10, tip: 'Rome\'s finest pizza al taglio by weight — extraordinary flavour combinations.', meal: 'pizza al taglio', price: '€8–12' },
      { name: 'Supplì Roma', area: 'Trastevere or Testaccio', cost: 6, tip: 'Fried rice balls stuffed with ragù — the Roman street food. €2.50 each. Best snack in the city.', meal: 'street snack', price: '€5–8' },
    ],
    hiddenGems: [
      { name: 'Borghese Gallery', instruction: 'Book EXACTLY 3 days ahead (no more, no less) — the rule of the gallery. Most beautiful small museum in Italy, worth reshaping an itinerary for.', dur: 120 },
    ],
    traps: ['Restaurants within 200m of Colosseum or Vatican — €30+ pasta', 'Gladiator costume photo ops outside Colosseum — free to shoot, €20 demanded after'],
    shipVsDiy: 110, avgDiy: 48,
    safeReturn: 'CRITICAL: Last train from Roma Termini must depart 3h before all-aboard. Train takes 1h15min. Miss it and you miss the ship.',
  },

  santorini: {
    displayName: 'Santorini', country: 'Greece', portType: 'tender', tenderMin: 30, defaultBuffer: 120,
    portToCity: [
      { mode: 'ferry', label: 'Tender to Old Port (Fira Skala)', instruction: 'Tender boats run every 15–20min from ship to Fira Skala (Old Port). Allow 25–35min total including queue.', duration: 30, cost: 0, note: 'Included in ship transfer. Factor in 45min extra per direction for tender logistics.' },
      { mode: 'walk', label: 'Cable car or donkeys to Fira', instruction: 'From Old Port: Cable car to Fira (€6, 3min but 30–45min queue midday). Alternative: donkey ride (€5, 10min). Or walk 587 steps up.', duration: 20, cost: 6, note: 'Cable car recommended. Avoid donkeys — slow and ethically questionable.' },
    ],
    areas: ['Fira (main town)', 'Oia (clifftop village)', 'Imerovigli', 'Pyrgos (hilltop medieval)', 'Akrotiri (south)'],
    attractions: [
      { name: 'Oia village & caldera views', area: 'Oia', dur: 120, cost: 0, score: 96, type: 'viewpoint', why: 'Blue-domed churches, caldera panoramas, the sunset — world-class. Arrive before 10am.', tip: 'Walk the back alleys of Oia, not the main street. Tiny galleries and local shops hidden everywhere.', trap: false },
      { name: 'Akrotiri Bronze Age Excavation', area: 'Akrotiri (south)', dur: 75, cost: 12, score: 88, type: 'history', why: 'A complete Minoan city buried in 1628BC — better preserved than Pompeii, far fewer visitors.', tip: 'Covered and cool inside — good on hot days. Combine with the Red Beach (10min walk from site).', trap: false },
      { name: 'Fira to Imerovigli caldera walk', area: 'Fira–Imerovigli', dur: 90, cost: 0, score: 85, type: 'nature', why: 'The footpath along the caldera edge — the most dramatic volcanic scenery in the Aegean. Free.', tip: 'Do the walk towards Oia direction (north) for the best views and better light.', trap: false },
    ],
    food: [
      { name: 'Metaxy Mas', area: 'Exo Gonia village', cost: 30, tip: 'Authentic Santorinian cuisine — fava purée, fresh octopus, tomatokeftedes. Ask locals, not Google.', meal: 'Santorinian lunch', price: '€25–35' },
    ],
    hiddenGems: [
      { name: 'Santo Winery terrace', instruction: 'Above Fira, 10min taxi. Free entry, wine by the glass (€12), best mid-afternoon caldera view without Oia tourist crush.', dur: 60 },
    ],
    traps: ['Oia caldera restaurants: €60+ for average food', 'Donkey rides: slow, expensive, ethically questionable'],
    shipVsDiy: 85, avgDiy: 28,
    safeReturn: 'TENDER PORT — be at Old Port by all-aboard minus 45min. Tender queue can be 20–30min.',
  },

  amsterdam: {
    displayName: 'Amsterdam', country: 'Netherlands', portType: 'dock', tenderMin: 0, defaultBuffer: 90,
    portToCity: [
      { mode: 'walk', label: 'Walk to Central Station', instruction: 'Exit Passenger Terminal Amsterdam (PTA). Walk south 8min along the IJ waterfront to Amsterdam Central Station.', duration: 8, cost: 0, note: 'Quickest option. Central Station has all tram, metro and ferry connections.' },
      { mode: 'tram', label: 'Tram 26 to city centre', instruction: 'Take Tram 26 from IJplein stop (2min walk from PTA). Runs every 7min to Spui and Muntplein.', duration: 12, cost: 3.5, note: 'Good for Rijksmuseum / Museumplein destinations.' },
    ],
    areas: ['Jordaan', 'Canal Ring (Grachtengordel)', 'Museumplein', 'De Pijp', 'Centrum / Damrak'],
    attractions: [
      { name: 'Rijksmuseum', area: 'Museumplein', dur: 120, cost: 22.5, score: 96, type: 'culture', why: 'Rembrandt\'s Night Watch, Vermeer, 8,000 Dutch masterpieces. The most important art collection in the Netherlands.', tip: 'Book online — no queues for ticket holders. The Garden is free and beautiful.', trap: false },
      { name: 'Canal Ring walk (Jordaan to Herengracht)', area: 'Jordaan / Canal Ring', dur: 90, cost: 0, score: 90, type: 'culture', why: 'UNESCO 17th-century merchant canal loop — the most beautiful city walk in Northern Europe.', tip: 'Walk Brouwersgracht to Prinsengracht to Herengracht loop. Best early morning light before 10am.', trap: false },
      { name: 'Van Gogh Museum', area: 'Museumplein', dur: 90, cost: 22, score: 90, type: 'culture', why: 'World\'s largest Van Gogh collection. Intimate, chronologically curated, deeply moving.', tip: 'Book timed entry online — essential. Combines perfectly with Rijksmuseum (5min walk).', trap: false },
      { name: 'Anne Frank House', area: 'Jordaan', dur: 90, cost: 16, score: 93, type: 'history', why: 'The actual hiding place — profoundly moving original spaces preserved intact.', tip: 'Sells out MONTHS ahead. Only same-day option: website releases small batch at 9am.', trap: false },
    ],
    food: [
      { name: 'Albert Cuyp Market', area: 'De Pijp', cost: 10, tip: 'Stroopwafels fresh off the iron, raw herring in a bun, Dutch cheese — the real Amsterdam food experience.', meal: 'market food', price: '€8–15' },
      { name: 'Brouwerij \'t IJ windmill', area: 'Funenkade', cost: 12, tip: 'Artisan beer brewed inside a working 18th-century windmill. Extraordinary setting.', meal: 'craft beer', price: '€4–8 per beer' },
    ],
    hiddenGems: [
      { name: 'Begijnhof', instruction: '2min walk from Spui — a hidden medieval courtyard of complete peace in the centre of the city. Free, open daily.', dur: 20 },
    ],
    traps: ['Canal boat tours near Central Station — walk the canals yourself, free and better'],
    shipVsDiy: 90, avgDiy: 42,
    safeReturn: 'Tram 26 or walk back to PTA — simple and reliable. Allow 20min.',
  },

  venice: {
    displayName: 'Venice', country: 'Italy', portType: 'dock', tenderMin: 0, defaultBuffer: 90,
    portToCity: [
      { mode: 'walk', label: 'Walk from Marittima to Piazzale Roma', instruction: 'Exit terminal and walk east along the waterfront for 15min to Piazzale Roma — the main entry point to Venice.', duration: 15, cost: 0, note: 'Then walk across the Scalzi bridge into Venice on foot.' },
      { mode: 'ferry', label: 'Vaporetto Line 1 or 2', instruction: 'From Marittima terminal, take Vaporetto Line 2 (fast) or Line 1 (scenic) down the Grand Canal. Buy 75min ticket at the stop.', duration: 25, cost: 9.5, note: 'Line 1 is the famous Grand Canal route — takes 30min longer but unmissable.' },
    ],
    areas: ['San Marco (tourist centre)', 'Cannaregio (quietest)', 'Castello', 'San Polo & Santa Croce', 'Dorsoduro'],
    attractions: [
      { name: 'St Mark\'s Basilica', area: 'San Marco', dur: 60, cost: 3, score: 92, type: 'culture', why: 'Byzantine gold mosaics covering every surface — one of the most ornate interiors in the world.', tip: 'Arrive at 9am opening. By 11am the queue fills the piazza. Free entrance to the narthex (lobby).', trap: false },
      { name: 'Cannaregio & Jewish Ghetto', area: 'Cannaregio', dur: 60, cost: 0, score: 86, type: 'culture', why: 'World\'s oldest Jewish ghetto and the most authentic, crowd-free Venice neighbourhood.', tip: 'Osteria Alle Testiere on Calle del Mondo Novo — tiny, brilliant, book weeks ahead.', trap: false },
      { name: 'Rialto Bridge & morning market', area: 'San Polo', dur: 45, cost: 0, score: 82, type: 'culture', why: 'The 16th-century stone bridge + the fish market below it. Only worth visiting before 10am.', tip: 'The \'bacaro\' wine bars in this area serve cicchetti (Venetian tapas) for €1–2. Stand at the counter.', trap: false },
      { name: 'Doge\'s Palace', area: 'San Marco', dur: 90, cost: 25, score: 88, type: 'history', why: 'Gothic masterpiece, Tintoretto paintings, Bridge of Sighs. Combined ticket with Basilica is good value.', tip: 'Book online to skip queue. The Secret Itineraries tour (extra fee) goes into areas most visitors never see.', trap: false },
    ],
    food: [
      { name: 'Cicchetti tour of bacaro bars', area: 'Cannaregio / San Polo', cost: 12, tip: 'Stand-up Venetian tapas (€1–2 each) at traditional wine bars. The real Venice food experience. Best 11am–1pm and 5–7pm.', meal: 'cicchetti + wine', price: '€10–15' },
    ],
    hiddenGems: [
      { name: 'Church of Santa Maria dei Miracoli', instruction: 'Cannaregio — tiny jewel-box Renaissance church, rarely visited, €3 entry. The most elegant small church in Venice.', dur: 25 },
    ],
    traps: ['Gondola rides (€80 for 30min)', 'Piazza San Marco restaurants (€8 for coffee + music surcharge)', 'Murano glass factory tours — high-pressure sales'],
    shipVsDiy: 80, avgDiy: 38,
    safeReturn: 'Vaporetto frequent and reliable. Allow 30min back to Marittima.',
  },

  lisbon: {
    displayName: 'Lisbon', country: 'Portugal', portType: 'dock', tenderMin: 0, defaultBuffer: 90,
    portToCity: [
      { mode: 'walk', label: 'Walk from terminal', instruction: 'Santa Apolónia terminal: walk 10min west along the riverfront to reach Alfama / Praça do Comércio. Alcântara terminal: 20min walk east to Belém.', duration: 15, cost: 0, note: 'Both terminals have good walking access.' },
      { mode: 'metro', label: 'Metro from Santa Apolónia', instruction: 'Santa Apolónia Metro station is 5min walk. Blue Line to Marquês de Pombal (3 stops, €1.55). Good for Belém connections at Cais do Sodré.', duration: 12, cost: 1.55, note: 'Best for Belém visitors.' },
    ],
    areas: ['Alfama', 'Baixa / Chiado', 'Belém', 'LX Factory / Alcântara', 'Bairro Alto'],
    attractions: [
      { name: 'Belém Tower & Jerónimos Monastery', area: 'Belém', dur: 120, cost: 22, score: 92, type: 'history', why: 'Manueline Gothic at its most elaborate — and Portugal\'s most important monastery. UNESCO double hit.', tip: 'The original Pastéis de Belém café is next door — queue moves fast, the custard tarts are incomparable.', trap: false },
      { name: 'Alfama District & São Jorge Castle', area: 'Alfama', dur: 120, cost: 15, score: 88, type: 'culture', why: 'Medieval Moorish neighbourhood — cobbled streets, live fado from tiny bars, panoramic castle.', tip: 'The Miradouro da Graça (5min walk from castle) has the best sunset view in Lisbon. Get there at 5pm.', trap: false },
      { name: 'LX Factory', area: 'Alcântara', dur: 75, cost: 0, score: 82, type: 'culture', why: 'Repurposed industrial complex — indie boutiques, Ler Devagar bookshop (with bike hanging from ceiling), rooftop bar.', tip: 'Sunday morning market is the best — food, vinyl, vintage, local designers. Open from 10am.', trap: false },
    ],
    food: [
      { name: 'Time Out Market', area: 'Cais do Sodré', cost: 15, tip: 'Best Portuguese chefs all under one roof. Bifanas, pastel de bacalhau, ginjinha.', meal: 'market food', price: '€12–18' },
      { name: 'Pastéis de Belém', area: 'Belém', cost: 4, tip: 'Original 1837 recipe custard tarts from the oven — sprinkle cinnamon, eat immediately.', meal: 'pastéis', price: '€1.30 each' },
    ],
    hiddenGems: [
      { name: 'Miradouro da Graça', instruction: 'Local\'s viewpoint above Alfama — the best panorama of Lisbon\'s rooftops, free, rarely visited by cruise tourists.', dur: 25 },
    ],
    traps: ['Fado dinner shows in Bairro Alto — €60+ for tourist-grade experience'],
    shipVsDiy: 90, avgDiy: 38,
    safeReturn: 'Metro or short walk back to either terminal.',
  },
};

// ─── Port resolution ──────────────────────────────────────────────────────────
function resolvePort(city) {
  if (!city) return null;
  const n = city.toLowerCase().trim()
    .replace(/\s*\/.*$/, '').replace(/\s*\(.*?\)/g, '')
    .replace(/\bport\b|\bterminal\b/g, '')
    .replace(/\bpiraeus\b/, 'athens').replace(/\bcivitavecchia\b/, 'rome')
    .replace(/\blivorno\b/, 'florence').replace(/\bcobh\b|\bcork\b/, 'cobh')
    .replace(/\s+/g, ' ').trim();
  if (PORT_REGISTRY[n]) return PORT_REGISTRY[n];
  for (const [, data] of Object.entries(PORT_REGISTRY)) {
    const dn = data.displayName.toLowerCase().split(',')[0].split('/')[0].trim();
    if (n.includes(dn) || dn.includes(n)) return data;
  }
  return null;
}

function calcMustLeave(allAboardTime, bufferMins, tenderMins) {
  if (!allAboardTime) return null;
  const [h, m] = allAboardTime.split(':').map(Number);
  const mins = h * 60 + m - (bufferMins || 90) - (tenderMins || 0);
  if (mins < 0) return '00:00';
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

// ─── Journey-first output schema ──────────────────────────────────────────────
const JOURNEY_SCHEMA = `
Return ONLY valid JSON (no markdown, no code blocks):
{
  "planName": "evocative name e.g. 'Dublin: The Real Day Out'",
  "summary": "1 compelling premium sentence — why this day is great",
  "variantType": "best_overall|best_value|least_stress|local_vibe|low_walking|max_sights",
  "planScore": 85,
  "planPersonality": ["iconic_day","efficient"],
  "scoreBreakdown": { "cruiseSafety": 92, "timeEfficiency": 85, "sightseeingValue": 88, "costEfficiency": 80, "walkingComfort": 75, "routeLogic": 90, "localCharacter": 84, "personalFit": 80 },
  "whyThisPlanWorks": ["string","string","string"],
  "biggestWeakness": "string",
  "fastestImprovement": "string",
  "routeRationale": "why stops are in this geographic sequence",
  "safeReturnExplanation": "how safe return is guaranteed",
  "totalEstimatedCost": 52,
  "savingsVsShipExcursion": 68,
  "totalWalkingMinutes": 38,
  "totalTransportMinutes": 42,
  "totalSightseeingMinutes": 240,
  "recommendedReturnStartTime": "15:30",
  "safeReturnScore": 90,
  "wowMoment": {
    "title": "the single most memorable moment of the day",
    "why": "why this is the emotional peak",
    "bestTiming": "HH:MM",
    "backup": "fallback if crowded"
  },
  "emotionalArc": {
    "calm_start": "how the day eases in (1 phrase)",
    "wow_peak": "where the wow moment hits (1 phrase)",
    "recharge": "where energy is restored (1 phrase)",
    "final_memory": "last memorable moment before return (1 phrase)",
    "wind_down": "how the return feels (1 phrase)"
  },
  "routeIntelligence": {
    "whyThisOrder": "why stops are in this geographic sequence",
    "biggestTimeSaver": "what saves the most time vs naive route",
    "biggestRisk": "where the day could go wrong",
    "emotionalPeak": "when the day feels most special",
    "timingAdvice": "where the user must NOT be flexible",
    "relaxMoment": "where the day naturally slows down",
    "routeVsAlternative": "why this beats the obvious tourist route"
  },
  "conciergeInsights": {
    "mustPreBook": "single most important thing to book ahead",
    "skipEntirely": "one thing that wastes time and money",
    "biggestTimeSaver": "string",
    "whereToSplurge": "one premium upgrade worth paying for",
    "touristMistake": "what most cruise passengers get wrong here",
    "lunchStrategy": "specific named option + timing"
  },
  "nearbyOpportunities": [
    { "type": "hidden_gem|better_lunch|cheaper_swap|less_crowded", "title": "string", "description": "string", "saving": "e.g. €15" }
  ],
  "watchOuts": [
    { "type": "queue|overrated|bottleneck", "title": "string", "description": "string" }
  ],
  "backupPlan": [
    { "trigger": "string", "action": "string" }
  ],
  "ifAheadOfSchedule": "what to add if running 30min ahead",
  "ifBehindSchedule": "what to cut if running 30min late",
  "bestLunchSuggestion": { "title": "string", "whyThisOne": "string", "specificDish": "string", "price": "string" },
  "hiddenGemSuggestion": { "title": "string", "whyAddIt": "string" },
  "thingToSkip": "one specific thing to avoid and why",
  "journey": [
    {
      "id": "j1",
      "type": "arrival|departure|transport|stop|food",
      "mode": "bus|walk|taxi|metro|tram|train|ferry|cable_car (transport only)",
      "title": "string",
      "subtitle": "string",
      "area": "string (stops: neighbourhood/district name)",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "durationMin": 0,
      "estimatedCostEur": 0,
      "instruction": "step-by-step directions (transport only)",
      "whyThisMode": "why this is the best option (transport only)",
      "alternativeMode": "string or null",
      "stopScore": 0,
      "worthItScore": 0,
      "why": "why this stop made the itinerary (stops only)",
      "insiderTip": "string",
      "touristTrapRisk": "low|medium|high",
      "bestFor": ["first_time","culture"],
      "alternatives": [{"title": "string", "reasonToSwap": "string"}]
    }
  ]
}`;

// ─── Prompt factory ───────────────────────────────────────────────────────────
function buildPrompt(action, plan, dbPort, registry) {
  const mustLeave = calcMustLeave(plan.all_aboard_time, plan.buffer_minutes, plan.tender_delay_minutes);
  const isTender = registry?.portType === 'tender' || plan.tender_delay_minutes > 0;
  const portName = registry?.displayName || plan.port_city;
  const budget = plan.diy_budget || 60;
  const shipPrice = plan.ship_excursion_price || 0;

  const tenderNote = isTender
    ? `⚠️ TENDER PORT: Add ${plan.tender_delay_minutes || 30}min EACH WAY for tender. Must return to dock earlier.`
    : 'Dock port — standard buffer.';

  const portIntel = registry ? `
CITY LOGISTICS (verified for ${portName}):
Port-to-city options:
${registry.portToCity.map(t => `  [${t.mode.toUpperCase()}] "${t.label}" — ${t.instruction} — ${t.duration}min, €${t.cost} — NOTE: ${t.note}`).join('\n')}

City areas: ${registry.areas.join(' | ')}

Curated attractions with real data:
${registry.attractions.map(a =>
  `  • ${a.name} (${a.area}, ${a.dur}min, €${a.cost}, score ${a.score})\n    WHY: ${a.why}\n    TIP: ${a.tip}${a.trap ? '\n    ⚠️ TOURIST TRAP RISK' : ''}`
).join('\n')}

Best food options:
${registry.food.map(f => `  • ${f.name} (${f.area}) — ${f.tip} — ${f.price}`).join('\n')}

Hidden gems:
${registry.hiddenGems.map(g => `  • ${g.name}: ${g.instruction}`).join('\n')}

Things to avoid: ${registry.traps.join(' | ')}

Safe return: ${registry.safeReturn}
Ship vs DIY: Ship excursion ~€${registry.shipVsDiy} → DIY target ~€${registry.avgDiy} → Save ~€${registry.shipVsDiy - registry.avgDiy}
` : '';

  const dbIntel = dbPort ? `
DATABASE GUIDE (supplementary):
${dbPort.transport_port_to_city ? `Transport: ${dbPort.transport_port_to_city.slice(0, 400)}` : ''}
${dbPort.attraction_highlights ? `Attractions: ${dbPort.attraction_highlights.slice(0, 600)}` : ''}
${dbPort.local_food ? `Food: ${dbPort.local_food.slice(0, 300)}` : ''}
${dbPort.unique_experiences ? `Hidden: ${dbPort.unique_experiences.slice(0, 300)}` : ''}
` : '';

  const header = `PORT: ${portName}${registry?.country ? ', ' + registry.country : ''}
DOCK TIME: ${plan.dock_time || '08:00'} | ALL ABOARD: ${plan.all_aboard_time} | MUST LEAVE CITY: ${mustLeave}
${tenderNote}
PREFERENCES: ${plan.travel_mode || 'first_time'} / ${plan.group_type || 'couple'} / ${plan.budget_mode || 'mid_range'}
BUDGET: €${budget}/person | SHIP TOUR: €${shipPrice}

${portIntel}${dbIntel}`;

  const rules = `
CRITICAL RULES:
1. EVERY stop must be preceded by a "transport" journey step — never place two consecutive stops without showing how to get between them.
2. Use REAL bus numbers, metro lines, street names, walking directions from the curated data above.
3. Every transport step must include: mode, title, instruction (step by step), duration, cost, whyThisMode.
4. Stops must use REAL place names — never generic descriptors like "local restaurant" or "famous cathedral".
5. Include between 4–6 stops (excluding arrival/departure).
6. Structure must be: arrival → transport → stop → transport → stop → [transport → stop] → transport → return.
7. Lunch must be a named, specific restaurant with a specific dish recommendation.
8. Plan must feel executable — someone who has never been to ${portName} must be able to follow it step by step.
9. Keep safe return score above 85 — do not pack in stops that risk missing the ship.
`;

  const prompts = {
    build_full_itinerary: `You are a world-class cruise port day planner with deep local knowledge of ${portName}. Build the best possible DIY itinerary.

${header}${rules}
Build a complete day journey from port → city → highlights → return. Include explicit transport steps between every stop.
${JOURNEY_SCHEMA}`,

    optimize_route: `Optimize this existing ${portName} itinerary by fixing routing inefficiencies.

${header}
CURRENT PLAN: ${JSON.stringify(plan.currentStops || [])}
${rules}
Reorder stops to cluster by area, reduce backtracking. Fix transport legs. Show score improvement.
${JOURNEY_SCHEMA}`,

    make_cheaper: `Cut costs on this ${portName} itinerary while keeping the quality excellent.

${header}
BUDGET TARGET: €${budget}/person
${rules}
Replace paid stops with great free alternatives. Use bus/walk over taxis. Target REAL free attractions listed above.
${JOURNEY_SCHEMA}`,

    reduce_walking: `Minimize walking on this ${portName} day using transport more aggressively.

${header}
${rules}
Replace any walk >10min with a bus/metro/tram option using the real lines listed above.
${JOURNEY_SCHEMA}`,

    local_vibe: `Build a non-tourist, local-focused ${portName} itinerary avoiding the obvious cruise stops.

${header}
${rules}
Use the hidden gems and local food data above. Avoid tourist-trap areas. Plan like a local resident showing a friend.
${JOURNEY_SCHEMA}`,

    add_lunch_nearby: `Insert the best possible lunch stop into this ${portName} itinerary.

${header}
${rules}
Use a REAL named restaurant from the food data above. Include specific dish, price. Time it at the natural midpoint.
${JOURNEY_SCHEMA}`,

    family_friendly: `Rebuild this ${portName} itinerary for a family with children.

${header}
${rules}
Short walks (<15min each), outdoor spaces, interactive stops. Remove museums with long queues. Budget-conscious.
${JOURNEY_SCHEMA}`,

    premium_day: `Build a luxury premium day in ${portName}. No cost compromises.

${header}
${rules}
Private taxis over buses. Rooftop dining. Skip-the-line passes. Premium experiences. Justify each upgrade specifically.
${JOURNEY_SCHEMA}`,

    beat_ship_excursion_price: `Build a DIY ${portName} itinerary that demolishes the ship tour cost.

${header}
TARGET: Under €${Math.floor(shipPrice * 0.45)}/person vs ship at €${shipPrice}
${rules}
Same highlights, public transport, itemise every cost. savings must be >€${Math.floor(shipPrice * 0.5)}.
${JOURNEY_SCHEMA}`,

    make_safer: `Rebuild this ${portName} itinerary to guarantee safe return with maximum confidence.

${header}
${rules}
Use safe return route advice from the port data above. Extend return buffer. Only stops near port or with clear fast return route.
${JOURNEY_SCHEMA}`,

    hidden_gem_injection: `Insert one authentic hidden gem into this ${portName} itinerary.

${header}
${rules}
Use the hidden gems data above — specific place, real instructions. Must fit time budget.
${JOURNEY_SCHEMA}`,

    add_wow_moment: `Add one emotionally unforgettable moment to this ${portName} day.

${header}
${rules}
Real, specific, memorable — a viewpoint at perfect light, a cultural encounter, a rooftop with views.
${JOURNEY_SCHEMA}`,

    shorten_plan: `Shorten this ${portName} plan to the best 3 stops if time is limited.

${header}
${rules}
Keep the highest-value stops. Streamline transport. Quality over quantity.
${JOURNEY_SCHEMA}`,

    expand_plan: `Expand this ${portName} plan to fill all available time with additional quality stops.

${header}
${rules}
Add 1–2 more stops that fit geographically and don\'t risk safe return.
${JOURNEY_SCHEMA}`,

    generate_variants: `Generate 3 COMPLETE, MATERIALLY DIFFERENT plan variants for ${portName}.

${header}
${rules}

Each variant must use a genuinely different ROUTE and STOP MIX — not just different labels:
- Variant 1 (variantType: "best_overall"): Best combination — major highlights + efficient transport + strong route logic
- Variant 2 (variantType: "best_value"): Maximum savings — fewer paid entries, public transport, local food, routes with more walking
- Variant 3 (variantType: "least_stress"): Minimal transfers — 3–4 stops max, simple route, extra return buffer, taxi over complex transit

IMPORTANT: Each variant must have materially different stops and transport strategy.
Variant 1 might use Trinity + Guinness + National Museum.
Variant 2 might use National Museum (free) + Phoenix Park (free) + street food.
Variant 3 might use just Trinity + one pub lunch + relaxed return.

Return: { "variants": [ ...3 complete plans... ] }
Each plan must include all fields from the schema including full journey array with transport steps.
${JOURNEY_SCHEMA}`,
  };

  return prompts[action] || prompts.build_full_itinerary;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, plan, currentPlanData, targetStop, userRequest, portGuideData } = await req.json();
    if (!action || !plan) return Response.json({ error: 'action and plan are required' }, { status: 400 });

    const registry = resolvePort(plan.port_city);

    let dbPort = portGuideData;
    if (!dbPort && plan.port_city) {
      try {
        const all = await base44.entities.CruisePort.list('city', 200);
        const city = plan.port_city.toLowerCase();
        dbPort = all.find(p =>
          p.city?.toLowerCase() === city ||
          city.includes(p.city?.toLowerCase()) ||
          p.city?.toLowerCase().includes(city.split('/')[0].trim())
        ) || null;
      } catch (_) { dbPort = null; }
    }

    const prompt = buildPrompt(action, { ...plan, currentStops: currentPlanData?.stops }, dbPort, registry);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a precision cruise port day planner. You produce journey-structured itineraries with EXPLICIT transport steps between every stop. You use ONLY real place names, real bus lines, real costs. NEVER skip a transport step. Return ONLY valid JSON.`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 5000,
      temperature: 0.55,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    let result;
    try { result = JSON.parse(raw); } catch (_) {
      return Response.json({ error: 'AI returned invalid JSON', raw }, { status: 500 });
    }

    if (action === 'generate_variants' && result.variants) {
      return Response.json({ success: true, variants: result.variants, port: plan.port_city });
    }

    return Response.json({ success: true, plan: result, action, port: plan.port_city });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});