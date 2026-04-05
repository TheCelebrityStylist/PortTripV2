/**
 * Curated port registry — used for UI hints, port resolution, and planning fallbacks.
 * Each entry covers: coordinates, transfer info, top stops, food, hidden gems, costs, traps.
 */

export const PORT_REGISTRY = {
  // ── BRITISH ISLES ──────────────────────────────────────────────────────────
  dublin: {
    slug: 'dublin', displayName: 'Dublin', country: 'Ireland', countryCode: 'ie',
    portLat: 53.349, portLng: -6.228, cityLat: 53.3498, cityLng: -6.2603,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Dublin Port is 2km from city centre. Taxi €12–15 (15min). Bus 130 from Alexandra Road (€3.30, 20min). Luas Red Line tram from Connolly Station (€2.50). Walking to O\'Connell St is 25min.',
    defaultTransport: ['bus', 'taxi', 'walk'],
    attractions: [
      { name: 'Trinity College & Book of Kells', duration: 90, cost: 18, type: 'culture', why: 'The Book of Kells is one of the world\'s greatest illuminated manuscripts — genuinely breathtaking up close. Book online to skip queue.' },
      { name: 'Guinness Storehouse', duration: 120, cost: 26, type: 'culture', why: 'Seven floors of brewing history with a panoramic Gravity Bar pint. Pre-book to save €6 and skip the line.' },
      { name: 'St Patrick\'s Cathedral', duration: 45, cost: 8, type: 'history', why: 'Jonathan Swift\'s burial place, stunning medieval gothic interior, far less crowded than Trinity.' },
      { name: 'Temple Bar Cultural Quarter', duration: 60, cost: 0, type: 'culture', why: 'Cobblestone streets, street performers, galleries. Come for the atmosphere, not the pubs — those are tourist-priced.' },
      { name: 'Phoenix Park', duration: 60, cost: 0, type: 'nature', why: 'Europe\'s largest enclosed urban park — wild deer roam freely. Also contains the US Ambassador\'s residence and Dublin Zoo.' },
      { name: 'Kilmainham Gaol', duration: 90, cost: 8, type: 'history', why: 'The emotional core of Irish independence — where 1916 Rising leaders were executed. Book ahead — sells out weeks in advance.' },
      { name: 'Grafton Street & St Stephen\'s Green', duration: 45, cost: 0, type: 'shopping', why: 'Premium pedestrianised shopping street, buskers, and the adjacent Victorian park make for a lovely stroll.' },
      { name: 'National Museum of Ireland', duration: 75, cost: 0, type: 'culture', why: 'World-class Celtic gold collection and bog body exhibits — completely free, hidden gem quality.' },
    ],
    food: [
      { name: 'The Winding Stair', area: 'Ha\'penny Bridge', type: 'restaurant', tip: 'Best modern Irish cuisine — Wicklow beef, local seafood. Book ahead.', cost: 35 },
      { name: 'Mulligan\'s of Poolbeg Street', area: 'City Centre', type: 'pub', tip: 'The best Guinness pint in Dublin, unchanged since 1782. No tourists, all locals.', cost: 7 },
      { name: 'Doheny & Nesbitt', area: 'Baggot Street', type: 'pub', tip: 'Victorian pub with political heritage. Great for a proper pub lunch (toasties, pie).', cost: 12 },
      { name: 'Honest2Goodness Market', area: 'Glasnevin', type: 'market', tip: 'Saturday morning artisan food market — Irish farmhouse cheeses, sourdough, charcuterie.', cost: 15 },
    ],
    hiddenGems: [
      'Howth Village — 25min by DART from Connolly, clifftop walks with sea views, fresh lobster at the pier',
      'Glasnevin Cemetery — the Irish equivalent of Père Lachaise, fascinating free tour',
      'Merrion Square — Georgian townhouses where Oscar Wilde was born, free Wilde statue in the park',
      'The Little Museum of Dublin on St Stephen\'s Green — intimate, witty, locally loved',
    ],
    touristTraps: ['Temple Bar pubs charge 2x Dublin prices for Guinness', 'Horse & carriage rides — very expensive', 'Hop-on buses — unnecessary for a walkable city'],
    typicalCosts: { taxi: 15, bus: 3, lunch: 18, attraction: 15 },
    safeReturnNote: 'Dublin Port is very easy to return to. Take taxi back for guarantee — €12–15, never more than 20 min from city centre.',
    shipVsDiy: 'Most ship excursions to Dublin cost €85–120. A DIY day (bus + 2 paid attractions + lunch) costs €45–60, covering more ground.',
  },

  cobh: {
    slug: 'cobh', displayName: 'Cobh (Cork)', country: 'Ireland', countryCode: 'ie',
    portLat: 51.852, portLng: -8.297, cityLat: 51.898, cityLng: -8.471,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Cobh is 24km from Cork City. Train from Cobh station (next to port) every 30min, €6 return, 25min. Taxi to Cork €30 each way. Cobh town itself is walkable from the pier.',
    defaultTransport: ['train', 'walk', 'taxi'],
    attractions: [
      { name: 'Titanic Experience Cobh', duration: 90, cost: 14, type: 'history', why: 'Cobh was the Titanic\'s last port of call. Powerful, personal exhibition — book online.' },
      { name: 'St Colman\'s Cathedral', duration: 30, cost: 0, type: 'culture', why: 'Neo-Gothic masterpiece dominating the harbour skyline. Carillon with 49 bells.' },
      { name: 'Cobh Heritage Centre', duration: 60, cost: 9, type: 'history', why: 'The Queenstown Story — emigration, Famine, and the Lusitania. Genuinely moving.' },
      { name: 'Cork City', duration: 180, cost: 5, type: 'culture', why: 'English Market food hall, St Fin Barre\'s Cathedral, craft beer scene — all 25min by train.' },
    ],
    food: [
      { name: 'The Quays Bar & Restaurant', area: 'Cobh Waterfront', type: 'pub', tip: 'Best seafood chowder in Cobh. Sits right on the harbour.', cost: 18 },
      { name: 'English Market Cork', area: 'Cork City Centre', type: 'market', tip: 'Queen Elizabeth shopped here. Amazing local cheese, tripe, smoked fish. Worth the train trip.', cost: 12 },
    ],
    hiddenGems: ['Spike Island ferry (from Cobh) — \'Ireland\'s Alcatraz\', stunning historic fort', 'Fota Wildlife Park — open-range wildlife park near the train line, free for kids under 3'],
    touristTraps: ['Overpriced boat tours from the pier — value is low'],
    typicalCosts: { taxi: 30, bus: 6, lunch: 18, attraction: 12 },
  },

  // ── MEDITERRANEAN ──────────────────────────────────────────────────────────
  barcelona: {
    slug: 'barcelona', displayName: 'Barcelona', country: 'Spain', countryCode: 'es',
    portLat: 41.3542, portLng: 2.1717, cityLat: 41.3851, cityLng: 2.1734,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Barcelona Port is 1.5km from Las Ramblas. Walk 20min, or take Drassanes Metro (L3, €2.40). Port Bus (€4, 10min) runs to city centre. Taxi €10–12.',
    defaultTransport: ['walk', 'metro', 'taxi'],
    attractions: [
      { name: 'Sagrada Família', duration: 90, cost: 26, type: 'culture', why: 'Gaudí\'s unfinished masterpiece — the interior is indescribably beautiful. Buy timed tickets well in advance or it\'s sold out.' },
      { name: 'Park Güell', duration: 75, cost: 10, type: 'culture', why: 'Mosaic terraces with city views. Timed entry required for the monumental zone — book 2 days ahead.' },
      { name: 'La Boqueria Market', duration: 45, cost: 15, type: 'food', why: 'World-famous food market. Go before 10am for locals not tourists. Best jamón, pintxos, fresh juice.' },
      { name: 'Gothic Quarter (Barri Gòtic)', duration: 75, cost: 0, type: 'culture', why: 'Roman ruins beneath medieval streets. Free to wander — get genuinely lost in the alleyways.' },
      { name: 'Casa Batlló or Casa Milà', duration: 60, cost: 35, type: 'culture', why: 'Gaudí\'s two street-level masterpieces on Passeig de Gràcia. Casa Batlló has the better night show; Casa Milà the better rooftop.' },
      { name: 'Barceloneta Beach', duration: 60, cost: 0, type: 'relaxation', why: 'Closest beach to port — Mediterranean swimming with the Barcelona skyline behind you.' },
    ],
    food: [
      { name: 'El Xampanyet', area: 'El Born', type: 'bar', tip: 'Best cava bar in Barcelona. Catalan anchovies, house cava, standing room only. No reservations.', cost: 15 },
      { name: 'Bar Cañete', area: 'Raval', type: 'restaurant', tip: 'Counter dining, exceptional modern tapas. Best value fine dining in the city.', cost: 40 },
    ],
    hiddenGems: ['Bunkers del Carmel — panoramic city view, no crowds, free', 'Sant Pere neighbourhood — quieter than Gothic, better tapas'],
    touristTraps: ['Las Ramblas restaurants — massively overpriced', 'Sagrada Família without pre-booked tickets — will waste 2hrs queuing'],
    typicalCosts: { taxi: 12, metro: 2.5, lunch: 22, attraction: 20 },
  },

  santorini: {
    slug: 'santorini', displayName: 'Santorini', country: 'Greece', countryCode: 'gr',
    portLat: 36.397, portLng: 25.432, cityLat: 36.4618, cityLng: 25.3753,
    portType: 'tender', defaultBufferMin: 120, tenderMinDefault: 30,
    transferNotes: 'Tender to Old Port (Fira Skala). Cable car to Fira €6 (queue 30–45min) or donkeys (€5, slower). Buses from Fira to Oia €2.50, 30min. Taxi €15 Fira–Oia.',
    defaultTransport: ['bus', 'taxi', 'cable_car'],
    attractions: [
      { name: 'Oia Village & Sunset View', duration: 120, cost: 0, type: 'viewpoint', why: 'The blue-domed churches, caldera views, and sunsets are genuinely world-class. Go early — Oia is mobbed by midday.' },
      { name: 'Akrotiri Archaeological Site', duration: 75, cost: 12, type: 'history', why: 'Bronze Age Pompeii — a preserved Minoan city buried by the eruption. Remarkably intact, surprisingly few visitors.' },
      { name: 'Fira to Imerovigli Walk', duration: 90, cost: 0, type: 'nature', why: 'Caldera-edge footpath with the most dramatic volcanic scenery in the Aegean — and completely free.' },
      { name: 'Red Beach', duration: 45, cost: 0, type: 'nature', why: 'Dramatic red volcanic cliffs plunging to turquoise water. 10min walk from Akrotiri.' },
    ],
    food: [
      { name: 'Metaxy Mas', area: 'Exo Gonia', type: 'restaurant', tip: 'Authentic Santorinian cuisine, locally known, not in guidebooks. Fava beans, fresh octopus, tomatokeftedes.', cost: 30 },
      { name: 'Fira food market lane', area: 'Fira', type: 'street', tip: 'The small side streets off the main square — local souvlaki stands €5 vs €25 caldera-view restaurants.', cost: 8 },
    ],
    hiddenGems: ['Santo Winery terrace — dramatic caldera view, free entry, wine €12 a glass', 'Pyrgos village — hilltop medieval village, no cruise tourists, panoramic views'],
    touristTraps: ['Caldera view restaurants in Oia — €60+/head for average food', 'Donkey rides — both cruel and slow'],
    typicalCosts: { taxi: 15, bus: 3, lunch: 25, attraction: 12 },
    safeReturnNote: 'Tender port — MUST allow 45min extra. Last tender can get crowded; be at Old Port by all-aboard minus 45min.',
  },

  athens: {
    slug: 'athens', displayName: 'Athens / Piraeus', country: 'Greece', countryCode: 'gr',
    portLat: 37.9475, portLng: 23.6374, cityLat: 37.9755, cityLng: 23.7348,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Piraeus port to Athens: Metro Line 1 from Piraeus station (€1.40, 30min to Monastiraki). Taxi €25–30, 40–60min with traffic. Bus X80 express €5.50, 40min.',
    defaultTransport: ['metro', 'taxi'],
    attractions: [
      { name: 'Acropolis & Parthenon', duration: 120, cost: 20, type: 'history', why: 'One of humanity\'s greatest monuments. Go at opening (8am) to beat heat and crowds.' },
      { name: 'Acropolis Museum', duration: 90, cost: 15, type: 'culture', why: 'The original Parthenon marbles, world-class curation. Better in many ways than the hilltop itself.' },
      { name: 'Plaka Neighbourhood', duration: 60, cost: 0, type: 'culture', why: 'The ancient neighbourhood beneath the Acropolis — beautiful streets, tavernas, the Roman Agora.' },
      { name: 'Monastiraki Flea Market', duration: 45, cost: 0, type: 'shopping', why: 'Sunday market is best — antiques, coins, icons, spices. Haggling expected and fun.' },
    ],
    food: [
      { name: 'Diporto', area: 'Central Market', type: 'taverna', tip: 'Cash only, no menu, the cook tells you what\'s available. Local workers lunch here. Extraordinary value.', cost: 12 },
    ],
    hiddenGems: ['Filopappou Hill — free Acropolis view without the crowds or admission fee', 'Athens Central Market (Varvakios) — raw ingredients stall, the real Athens'],
    touristTraps: ['Monastiraki square restaurants — tourist price, mediocre food', 'Taxi scams at Piraeus — use meter, insist on it'],
    typicalCosts: { taxi: 28, metro: 1.5, lunch: 16, attraction: 18 },
  },

  rome: {
    slug: 'rome', displayName: 'Rome / Civitavecchia', country: 'Italy', countryCode: 'it',
    portLat: 42.093, portLng: 11.796, cityLat: 41.9028, cityLng: 12.4964,
    portType: 'dock', defaultBufferMin: 120, tenderMinDefault: 0,
    transferNotes: 'Civitavecchia to Rome: Regional train every 30min (€5.90, 1h15min) from port gate station. Organised coach transfers €25–35 pp return. Taxi from port to train station is free (300m walk). Allow 2h30 travel each way minimum.',
    defaultTransport: ['train', 'coach'],
    attractions: [
      { name: 'Colosseum & Roman Forum', duration: 150, cost: 18, type: 'history', why: 'Book tickets online — non-negotiable to avoid 2hr queues. The Forum is included and equally spectacular.' },
      { name: 'Vatican Museums & Sistine Chapel', duration: 180, cost: 30, type: 'culture', why: 'Largest art collection in the world. Skip-the-line essential — 4hrs minimum. Book 30 days ahead.' },
      { name: 'Trevi Fountain & Spanish Steps', duration: 45, cost: 0, type: 'culture', why: 'Best visited before 9am — empty, beautiful, no selfie sticks. A midday visit is a crush.' },
      { name: 'Pantheon', duration: 45, cost: 5, type: 'history', why: 'Free entry until 2023, now €5 — still absurdly good value for 2,000 years of history. Avoid midday.' },
    ],
    food: [
      { name: 'Supplì Roma', area: 'Trastevere', type: 'street', tip: 'Roman street food — fried supplì (rice balls) for €2. The authentic fast food of Rome.', cost: 5 },
      { name: 'Pizzarium Bonci', area: 'Prati (near Vatican)', type: 'street', tip: 'Rome\'s best pizza al taglio — sold by weight, extraordinary combinations.', cost: 10 },
    ],
    hiddenGems: ['Trastevere neighbourhood — medieval Rome, washing hanging from buildings, €12 lunch', 'Borghese Gallery (book 3 days ahead) — the most beautiful small museum on earth'],
    touristTraps: ['Restaurant touts near attractions — €30+ pasta of average quality', 'Taxis without meters'],
    typicalCosts: { taxi: 0, train: 6, lunch: 18, attraction: 22 },
    safeReturnNote: 'Allow 1h30 from city to train, plus 1h15 train = 2h45 total. Miss the train and there\'s a big problem. Last train from Roma Termini to Civitavecchia should be before all-aboard minus 3h.',
  },

  naples: {
    slug: 'naples', displayName: 'Naples / Pompeii', country: 'Italy', countryCode: 'it',
    portLat: 40.8375, portLng: 14.2681, cityLat: 40.8522, cityLng: 14.2681,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Naples port is in the city centre — walkable in 10min. For Pompeii: Circumvesuviana train from Garibaldi station (€3, 40min). For Amalfi Coast: organised transfers or hire a driver.',
    defaultTransport: ['walk', 'train', 'taxi'],
    attractions: [
      { name: 'Pompeii Archaeological Site', duration: 180, cost: 16, type: 'history', why: 'One of the greatest archaeological sites on earth — a complete Roman city frozen in 79AD. Allow 3hrs minimum.' },
      { name: 'Mount Vesuvius', duration: 120, cost: 10, type: 'nature', why: 'Combine with Pompeii — bus from Pompeii site to crater takes 20min. Actual crater walk is spectacular.' },
      { name: 'Naples Historic Centre', duration: 90, cost: 0, type: 'culture', why: 'UNESCO world heritage streets, underground Greek-Roman ruins, the best pizza on earth.' },
      { name: 'National Archaeological Museum', duration: 90, cost: 15, type: 'culture', why: 'Pompeii artefacts in incredible detail — the erotic art cabinet is genuinely surprising.' },
    ],
    food: [
      { name: 'L\'Antica Pizzeria da Michele', area: 'Via Cesare Sersale', type: 'restaurant', tip: 'The original Neapolitan pizza — only two choices, Margherita or Marinara, €5–6. Queue moves fast. Featured in Eat Pray Love.', cost: 6 },
      { name: 'Spaccanapoli street food', area: 'Historic Centre', type: 'street', tip: 'Fried pizza (€2), sfogliatelle pastry (€2), cuoppo of fried seafood (€5). The real Naples food experience.', cost: 10 },
    ],
    hiddenGems: ['Catacombs of San Gennaro — underground early Christian art', 'Quartieri Spagnoli neighbourhood — the gritty real Naples, vibrant street life'],
    touristTraps: ['Port-area restaurants — tourist pricing', 'Unofficial "guides" at Pompeii entrance'],
    typicalCosts: { taxi: 15, train: 3, lunch: 15, attraction: 15 },
  },

  florence: {
    slug: 'florence', displayName: 'Florence / Livorno', country: 'Italy', countryCode: 'it',
    portLat: 43.5531, portLng: 10.3041, cityLat: 43.7696, cityLng: 11.2558,
    portType: 'dock', defaultBufferMin: 120, tenderMinDefault: 0,
    transferNotes: 'Livorno to Florence: coach transfers from port (€25pp, 1h30). Train from Livorno Centrale (€10, 1h20). Taxi from port to station €8. Pisa is only 30min from Livorno — easier day trip than Florence.',
    defaultTransport: ['train', 'coach'],
    attractions: [
      { name: 'Uffizi Gallery', duration: 180, cost: 25, type: 'culture', why: 'Botticelli\'s Birth of Venus and Primavera are here. Book online — mandatory, queues are enormous.' },
      { name: 'Duomo & Brunelleschi\'s Dome', duration: 60, cost: 18, type: 'culture', why: 'Climb the dome for spectacular views — book timed entry online. The Cathedral interior is free.' },
      { name: 'Ponte Vecchio & Oltrarno', duration: 60, cost: 0, type: 'culture', why: 'Medieval jewellers bridge + the artisan neighbourhood across the river. Early morning is magical.' },
      { name: 'Piazzale Michelangelo', duration: 30, cost: 0, type: 'viewpoint', why: 'Best panoramic view of Florence — terracotta rooftops, Duomo, hills. Free, but take a taxi up.' },
      { name: 'Pisa', duration: 120, cost: 18, type: 'history', why: 'If doing Livorno, Pisa is 20min by train — Leaning Tower, Baptistery, Campo dei Miracoli all in one square.' },
    ],
    food: [
      { name: 'Trattoria Mario', area: 'San Lorenzo market', type: 'trattoria', tip: 'Communal tables since 1953, cash only, huge portions. Best bistecca fiorentina value in the city.', cost: 20 },
      { name: 'Mercato Centrale', area: 'San Lorenzo', type: 'market', tip: 'Ground floor is the real local food market; upstairs is the food hall — great for lunch.', cost: 15 },
    ],
    hiddenGems: ['Boboli Gardens behind Pitti Palace — Renaissance formal gardens, wonderful views', 'Piazza Santo Spirito — local Florentines\' square, no tourists, great aperitivo'],
    touristTraps: ['Restaurants on Piazza della Signoria — €30 pasta mediocre'],
    typicalCosts: { taxi: 20, train: 10, lunch: 20, attraction: 22 },
  },

  venice: {
    slug: 'venice', displayName: 'Venice', country: 'Italy', countryCode: 'it',
    portLat: 45.4351, portLng: 12.3326, cityLat: 45.4408, cityLng: 12.3155,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Large cruise ships dock at Marittima (800m from Piazzale Roma) or Fusina. Vaporetto water bus: €9.50 single, day pass €25. Walking from Marittima: 20min to Piazzale Roma, then on foot. Water taxi €80+ (luxury).',
    defaultTransport: ['walk', 'vaporetto', 'water_taxi'],
    attractions: [
      { name: 'St Mark\'s Basilica & Square', duration: 75, cost: 3, type: 'culture', why: 'Byzantine mosaics covering every surface — one of the world\'s most beautiful interiors. Arrive at 9am to beat crowds.' },
      { name: 'Rialto Bridge & Market', duration: 45, cost: 0, type: 'culture', why: 'The 16th-century bridge + the market beneath it. Go early for local fishmongers; by 10am it\'s all tourists.' },
      { name: 'Doge\'s Palace', duration: 90, cost: 25, type: 'history', why: 'Gothic masterpiece, Tintoretto paintings, the infamous Bridge of Sighs. Combined with Basilica worth it.' },
      { name: 'Cannaregio / Jewish Ghetto', duration: 60, cost: 0, type: 'culture', why: 'The oldest Jewish ghetto in the world, and the quietest, most authentic part of Venice — zero cruise tourists.' },
      { name: 'Burano Island', duration: 120, cost: 9.5, type: 'culture', why: 'Psychedelically colourful fishing village, 40min vaporetto. Best alternative if Venice feels too crowded.' },
    ],
    food: [
      { name: 'Bacaro jazz cicchetti bars', area: 'Cannaregio / Rialto', type: 'bar', tip: 'Cicchetti (€1–2 each) — Venetian tapas on bread. Stand at the counter. Best between 11–1pm and 5–7pm.', cost: 12 },
      { name: 'Osteria alle Testiere', area: 'Castello', type: 'restaurant', tip: 'Tiny, brilliant, seafood-only. Best meal in Venice. Must book weeks ahead — only 22 seats.', cost: 65 },
    ],
    hiddenGems: ['San Polo area — less visited, better restaurants, local feel', 'Church of Santa Maria dei Miracoli — tiny jewel-box Renaissance church, rarely visited'],
    touristTraps: ['Gondola rides (€80+ for 30min)', 'Piazza San Marco restaurants (€40 for pasta + music surcharge)', 'Murano glass — factory shops aggressively hustle you'],
    typicalCosts: { taxi: 80, vaporetto: 9.5, lunch: 25, attraction: 20 },
  },

  dubrovnik: {
    slug: 'dubrovnik', displayName: 'Dubrovnik', country: 'Croatia', countryCode: 'hr',
    portLat: 42.6507, portLng: 18.0944, cityLat: 42.6401, cityLng: 18.1083,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Gruž port (main dock) is 3km from Old Town. Bus 1A (€2, 15min). Taxi €10–12. Old Town cable car to Mt Srđ: €18 return.',
    defaultTransport: ['bus', 'taxi', 'walk'],
    attractions: [
      { name: 'Old Town City Walls', duration: 120, cost: 35, type: 'culture', why: 'Walking the complete walls (2km) with Adriatic views is worth every cent. Go at 8am opening — by 11am it\'s a furnace of people.' },
      { name: 'Lokrum Island', duration: 120, cost: 15, type: 'nature', why: '15min ferry from Old Town, botanical gardens, peacocks, and a Game of Thrones museum. Magical escape from crowds.' },
      { name: 'Stradun (main street) & Old Town', duration: 60, cost: 0, type: 'culture', why: 'The marble-paved main street of the old city at dawn is genuinely otherworldly — come before 8am.' },
      { name: 'Mount Srđ Cable Car', duration: 75, cost: 18, type: 'viewpoint', why: 'Panoramic view of the old city, islands and coast from 412m — the defining Dubrovnik photo.' },
    ],
    food: [
      { name: 'Lokanda Peskarija', area: 'Old Harbour', type: 'restaurant', tip: 'Best value fresh seafood on the harbour. Arrive early or wait 30min — always worth it.', cost: 30 },
      { name: 'Buffet Škola', area: 'Old Town', type: 'cafe', tip: 'Locals-only €5 burek and coffee spot inside Old Town. No tourist pricing.', cost: 5 },
    ],
    hiddenGems: ['Buža cliff bar — secret bar built into cliff wall, beer €4, Adriatic swimming below', 'Konavle Valley — 30min drive, wineries, local food, zero tourists'],
    touristTraps: ['All restaurants on Stradun — premium prices, average food', 'City Walls after 10am — unbearably hot and crowded'],
    typicalCosts: { taxi: 12, bus: 2, lunch: 28, attraction: 30 },
  },

  lisbon: {
    slug: 'lisbon', displayName: 'Lisbon', country: 'Portugal', countryCode: 'pt',
    portLat: 38.7083, portLng: -9.1483, cityLat: 38.7223, cityLng: -9.1393,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Santa Apolónia or Alcântara terminal — both walkable to city centre (15–25min). Tram 28 from Alfama (€3.30). Metro Terreiro do Paço (€1.55). Taxi €8–12 to centre.',
    defaultTransport: ['walk', 'metro', 'tram'],
    attractions: [
      { name: 'Belém Tower & Jerónimos Monastery', duration: 120, cost: 22, type: 'history', why: 'Manueline Gothic masterpiece + the original pastéis de Belém bakery next door. UNESCO combo.' },
      { name: 'Alfama District & São Jorge Castle', duration: 120, cost: 15, type: 'culture', why: 'Medieval Moorish quarter — cobbled streets, fado music, castle with harbour panorama.' },
      { name: 'LX Factory', duration: 60, cost: 0, type: 'culture', why: 'Repurposed industrial complex — weekend market, bookshop, craft beer, street art. Sunday morning is best.' },
      { name: 'Tram 28 route', duration: 45, cost: 3.3, type: 'experience', why: 'Legendary yellow tram through Alfama\'s impossible streets — but buy ticket in advance, no boarding cash.' },
    ],
    food: [
      { name: 'Time Out Market', area: 'Cais do Sodré', type: 'market', tip: 'Best Portuguese chefs all under one roof. Bifanas (pork sandwiches), pastel de bacalhau, ginjinha.', cost: 15 },
      { name: 'Pastéis de Belém', area: 'Belém', type: 'cafe', tip: 'Original 1837 recipe custard tarts — sprinkle cinnamon, eat hot. The queue moves fast.', cost: 4 },
    ],
    hiddenGems: ['Miradouro da Graça — best sunset view, locals not tourists', 'Mouraria neighbourhood — multicultural, vibrant, pre-gentrification feel'],
    touristTraps: ['Bairro Alto tourist restaurants — fado show meals are expensive and poor quality', 'Tram 28 pickpockets — keep valuables hidden'],
    typicalCosts: { taxi: 10, metro: 1.6, lunch: 16, attraction: 14 },
  },

  copenhagen: {
    slug: 'copenhagen', displayName: 'Copenhagen', country: 'Denmark', countryCode: 'dk',
    portLat: 55.7033, portLng: 12.5983, cityLat: 55.6761, cityLng: 12.5683,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Oceankaj or Langelinie terminals — both close to city. Free shuttle bus to Nordhavn Metro. Metro to city centre (€3.50, 10min). Taxi €20–25. Bike hire available €15/day — Copenhagen is very cycle friendly.',
    defaultTransport: ['metro', 'bike', 'walk'],
    attractions: [
      { name: 'Nyhavn Harbour', duration: 60, cost: 0, type: 'culture', why: 'The colourful canal district is the iconic Copenhagen image. Walk the quay, but eat elsewhere — tourist pricing here.' },
      { name: 'Tivoli Gardens', duration: 150, cost: 22, type: 'culture', why: 'Historic pleasure gardens open since 1843 — the original inspiration for Disneyland. Enchanting even without rides.' },
      { name: 'The Little Mermaid statue', duration: 20, cost: 0, type: 'culture', why: 'Overrated but required — takes 10min, makes for a fine photo. Combine with Kastellet fortress.' },
      { name: 'Strøget & Indre By', duration: 60, cost: 0, type: 'shopping', why: 'Europe\'s longest pedestrian shopping street + the surrounding old city. Very walkable, very Scandinavian.' },
    ],
    food: [
      { name: 'Torvehallerne food market', area: 'Nørreport', type: 'market', tip: 'The city\'s finest food hall — smørrebrød (open sandwiches), coffee, Danish pastries, local cheeses.', cost: 18 },
      { name: 'Juno the Bakery', area: 'Østerbro', type: 'cafe', tip: 'Best cardamom bun and croissant in Scandinavia. Queue opens at 7am.', cost: 8 },
    ],
    hiddenGems: ['Freetown Christiania — the famous alternative community, 50 years old, fascinating walk', 'Assistens Kirkegård — cemetery where Kierkegaard and Hans Christian Andersen are buried, lovely park feel'],
    touristTraps: ['Nyhavn restaurants — pay 30% more for the postcard view', 'Canal tours — skip unless it rains'],
    typicalCosts: { taxi: 25, metro: 3.5, lunch: 22, attraction: 18 },
  },

  amsterdam: {
    slug: 'amsterdam', displayName: 'Amsterdam', country: 'Netherlands', countryCode: 'nl',
    portLat: 52.3833, portLng: 4.9167, cityLat: 52.3676, cityLng: 4.9041,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Passenger Terminal Amsterdam (PTA) is 5min walk from Central Station. Ferry across IJ river (free, 5min). Tram from Central Station (€3.50). Bike hire €12–18/day — essential for Amsterdam.',
    defaultTransport: ['walk', 'tram', 'bike'],
    attractions: [
      { name: 'Rijksmuseum', duration: 120, cost: 22.5, type: 'culture', why: 'Rembrandt\'s Night Watch, Vermeer, and 8,000 masterpieces. Book online — no queues for ticket holders.' },
      { name: 'Anne Frank House', duration: 90, cost: 16, type: 'history', why: 'Deeply moving — the original hiding place. Sells out MONTHS ahead. Only option same-day: website at 9am.' },
      { name: 'Canal Ring (Grachtengordel)', duration: 90, cost: 0, type: 'culture', why: 'A UNESCO walk through 17th-century merchant houses, small bridges, houseboats. Most beautiful city walk in Northern Europe.' },
      { name: 'Jordaan neighbourhood', duration: 60, cost: 0, type: 'culture', why: 'Former working class area now full of indie boutiques, gallery cafes, the best Amsterdam atmosphere.' },
      { name: 'Van Gogh Museum', duration: 90, cost: 22, type: 'culture', why: 'The world\'s largest Van Gogh collection. Book timed entry online — always busy but managed well.' },
    ],
    food: [
      { name: 'Albert Cuyp Market', area: 'De Pijp', type: 'market', tip: 'Amsterdam\'s best street market — stroopwafels, Dutch cheese, raw herring. Free entry, open Mon–Sat.', cost: 10 },
      { name: "Brouwerij 't IJ windmill brewery", area: 'Funenkade', type: 'bar', tip: 'Artisan beers brewed inside a working 18th century windmill. 50ml tasters, remarkable setting.', cost: 12 },
    ],
    hiddenGems: ['Begijnhof — hidden medieval courtyard of peace in the middle of the city', 'NDSM wharf — industrial art scene, huge murals, ferry from Central Station (free)'],
    touristTraps: ['Red Light District coffee shops — for most cruise guests, a wasted hour', 'Canal boat tours near Centraal — skip, just walk the canals'],
    typicalCosts: { taxi: 20, tram: 3.5, lunch: 20, attraction: 22 },
  },

  oslo: {
    slug: 'oslo', displayName: 'Oslo', country: 'Norway', countryCode: 'no',
    portLat: 59.9085, portLng: 10.7314, cityLat: 59.9139, cityLng: 10.7522,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Akershus/Vippetangen terminal is a 15min walk to Karl Johans gate. Bus 60 (€4.20). Tram 12 from Aker Brygge (€4.20). Taxi €15–20 to city centre.',
    defaultTransport: ['walk', 'tram'],
    attractions: [
      { name: 'Vigeland Sculpture Park', duration: 90, cost: 0, type: 'culture', why: '212 bronze and granite sculptures — the life\'s work of Gustav Vigeland. Absolutely free, profoundly moving.' },
      { name: 'The Viking Ship Museum', duration: 75, cost: 15, type: 'history', why: 'Real 9th-century Viking ships — the best preserved in the world. Unmissable for history lovers.' },
      { name: 'Aker Brygge waterfront', duration: 60, cost: 0, type: 'culture', why: 'Former shipyard turned design district, restaurants, galleries. Best place to feel modern Oslo.' },
      { name: 'Holmenkollen Ski Jump', duration: 60, cost: 16, type: 'culture', why: 'Iconic ski jump with view over Oslo fjord — ski museum is unexpectedly fascinating.' },
    ],
    food: [
      { name: 'Mathallen Oslo', area: 'Vulkan', type: 'market', tip: 'Indoor food hall — Norwegian gravlax, smoked meats, artisan coffee. The best food value in expensive Oslo.', cost: 18 },
      { name: 'Fiskeriet', area: 'Youngstorget', type: 'restaurant', tip: 'Fresh fish and shellfish counter — shrimp baguettes are Norway\'s great food moment.', cost: 22 },
    ],
    hiddenGems: ['Ekeberg Sculpture Park — hilltop park with city views and modern sculpture, free', 'Frognerparken rose garden — surrounding Vigeland, beautiful in season'],
    touristTraps: ['Bryggen area restaurants — sky high prices', 'Fjord boat tours (€50+) — Aker Brygge free walk gives better views'],
    typicalCosts: { taxi: 20, bus: 4, lunch: 28, attraction: 15 },
  },

  bergen: {
    slug: 'bergen', displayName: 'Bergen', country: 'Norway', countryCode: 'no',
    portLat: 60.3913, portLng: 5.3221, cityLat: 60.3929, cityLng: 5.3241,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Bergen port is the city centre — dock to Bryggen is a 5min walk. Everything in central Bergen is walkable.',
    defaultTransport: ['walk', 'funicular'],
    attractions: [
      { name: 'Bryggen Wharf (UNESCO)', duration: 75, cost: 0, type: 'culture', why: '14th century Hanseatic trading houses — colourful wooden facades, UNESCO listed. Walk through the backstreets.' },
      { name: 'Mount Fløyen Funicular', duration: 90, cost: 17, type: 'viewpoint', why: 'Cable car up to panoramic Bergen view — forest walks, troll statue, spectacular on a clear day.' },
      { name: 'Fish Market (Fisketorget)', duration: 45, cost: 0, type: 'food', why: 'Outdoor seafood stalls — Norwegian king crab, smoked salmon, whale steak. Best experience before 12pm.' },
      { name: 'KODE Art Museums', duration: 75, cost: 15, type: 'culture', why: 'Edvard Munch collection, Norwegian masters. Often overlooked by cruise visitors.' },
    ],
    food: [
      { name: 'Lysøen café', area: 'Near Fish Market', type: 'restaurant', tip: 'Bergen fish soup (€12) is a national institution. This unpretentious place does it best.', cost: 18 },
    ],
    hiddenGems: ['Sandviken neighbourhood — timber houses above the fjord, no tourists', 'Bergen Storsenter shopping centre food court — Norwegian fast food at real prices'],
    touristTraps: ['Fish Market touristy stalls charge 3x grocery prices for \'authentic Norwegian\' products'],
    typicalCosts: { taxi: 18, funicular: 17, lunch: 22, attraction: 15 },
  },

  stockholm: {
    slug: 'stockholm', displayName: 'Stockholm', country: 'Sweden', countryCode: 'se',
    portLat: 59.3397, portLng: 18.0968, cityLat: 59.3293, cityLng: 18.0686,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Frihamnen or Stadsgårdskajen terminal. Stadsgårdskajen is closest — 10min walk to Gamla Stan. Bus 53 from Frihamnen to T-Centralen (€3.50, 20min).',
    defaultTransport: ['walk', 'metro', 'bus'],
    attractions: [
      { name: 'Gamla Stan (Old Town)', duration: 90, cost: 0, type: 'culture', why: 'Medieval island city, royal palace, cobbled lanes — Europe\'s best preserved medieval old town.' },
      { name: 'Vasa Museum', duration: 90, cost: 19, type: 'history', why: 'Complete 17th-century warship recovered intact — possibly the most impressive museum in Scandinavia.' },
      { name: 'Djurgården Island', duration: 120, cost: 0, type: 'nature', why: 'Royal park island — Skansen open-air museum, Abba Museum, cycling paths, elk spotting.' },
      { name: 'Fotografiska Photography Museum', duration: 90, cost: 19, type: 'culture', why: 'World-class photography exhibitions in a stunning converted 19th-century customs building.' },
    ],
    food: [
      { name: 'Östermalm Saluhall', area: 'Östermalm', type: 'market', tip: 'Stockholm\'s grand food hall — incredible smörgåsbord counter, Swedish cheese, wild game.', cost: 20 },
      { name: 'Café Saturnus', area: 'Östermalm', type: 'cafe', tip: 'Stockholm\'s finest cinnamon bun (kanelbulle), enormous, warm from oven.', cost: 7 },
    ],
    hiddenGems: ['Monteliusvägen cliff walk — hilltop wooden walkway with views of the old city and waterway', 'Södermalm neighbourhood — independent boutiques, local hipster culture, no cruise tourists'],
    touristTraps: ['Gamla Stan restaurants facing main square — pay 40% more for identical food'],
    typicalCosts: { taxi: 25, metro: 3.5, lunch: 22, attraction: 19 },
  },

  valletta: {
    slug: 'valletta', displayName: 'Valletta', country: 'Malta', countryCode: 'mt',
    portLat: 35.904, portLng: 14.511, cityLat: 35.8997, cityLng: 14.5147,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Grand Harbour marina is at the foot of Valletta — 15min walk up to the city. Free shuttle from Valletta Waterfront to City Gate. Bus to Mdina: 45min, €2. Taxi to Mdina €18.',
    defaultTransport: ['walk', 'bus'],
    attractions: [
      { name: 'St John\'s Co-Cathedral', duration: 75, cost: 15, type: 'culture', why: 'Every inch covered in carved marble and gold leaf — two Caravaggio paintings inside. The most ornate cathedral in the Mediterranean.' },
      { name: 'Grand Harbour Viewpoint', duration: 30, cost: 0, type: 'viewpoint', why: 'From the Upper Barrakka Gardens — one of the finest harbour views in the world. Free, accessible.' },
      { name: 'Mdina (Silent City)', duration: 90, cost: 0, type: 'history', why: 'Medieval walled city — pedestrians only, medieval architecture, extraordinary silence. 45min from Valletta.' },
      { name: 'Ħal Saflieni Hypogeum', duration: 60, cost: 35, type: 'history', why: 'UNESCO prehistoric underground necropolis — maximum 80 visitors/day. Book months ahead or it\'s impossible.' },
    ],
    food: [
      { name: 'Crystal Palace', area: 'Republic Street', type: 'cafe', tip: 'Pastizzi (flaky pastry with ricotta or peas, €0.35 each) — the ultimate Maltese street food. Queue at lunch.', cost: 3 },
      { name: 'Trabuxu Wine Bar', area: 'Strait Street', type: 'bar', tip: 'Maltese wine bar in a centuries-old barrel-vaulted cellar. Low ceilings, excellent local wines.', cost: 18 },
    ],
    hiddenGems: ['Strait Street (Triq id-Dejqa) — former red-light district, now jazz bars and cafes in medieval passageway', 'Marsaxlokk fishing village — Sunday market, traditional luzzu boats, best fresh fish'],
    touristTraps: ['Waterfront restaurants — tourist pricing'],
    typicalCosts: { taxi: 18, bus: 2, lunch: 16, attraction: 15 },
  },

  // ── CARIBBEAN / ATLANTIC ───────────────────────────────────────────────────
  nassau: {
    slug: 'nassau', displayName: 'Nassau, Bahamas', country: 'Bahamas', countryCode: 'bs',
    portLat: 25.0773, portLng: -77.338, cityLat: 25.0480, cityLng: -77.3562,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Prince George Wharf is in the heart of Nassau downtown — everything is walkable. Ferry to Paradise Island €4 return. Taxi to Cable Beach €12.',
    defaultTransport: ['walk', 'ferry', 'taxi'],
    attractions: [
      { name: 'Cable Beach & Atlantic Paradise Island', duration: 180, cost: 30, type: 'relaxation', why: 'Powder white sand, turquoise water — the Caribbean beach day Nassau is famous for.' },
      { name: 'Queen\'s Staircase & Fort Fincastle', duration: 45, cost: 0, type: 'history', why: '66 steps hand-cut by slaves in 1793 leading to a hilltop fort — historical and remarkable.' },
      { name: 'Nassau Straw Market', duration: 45, cost: 0, type: 'shopping', why: 'Handcrafted Bahamian goods — haggling expected. Get conch shell, straw work, local rum.' },
    ],
    food: [
      { name: 'Arawak Cay Fish Fry', area: 'Western Esplanade', type: 'street', tip: 'Local Nassau institution — Bahamian seafood shacks, fried snapper, conch salad, Sands beer. €12 for a full meal.', cost: 12 },
    ],
    hiddenGems: ['Graycliff Chocolate Factory — Bahamian artisan chocolate, free tour', 'Potter\'s Cay under Paradise Island bridge — raw local market, conch salad made to order €6'],
    touristTraps: ['Bay Street tourist shops — overpriced compared to Straw Market', 'Atlantis day pass (€150+) — expensive for what it is'],
    typicalCosts: { taxi: 12, ferry: 4, lunch: 16, attraction: 0 },
  },

  funchal: {
    slug: 'funchal', displayName: 'Funchal, Madeira', country: 'Portugal', countryCode: 'pt',
    portLat: 32.6463, portLng: -16.9067, cityLat: 32.6498, cityLng: -16.9085,
    portType: 'dock', defaultBufferMin: 90, tenderMinDefault: 0,
    transferNotes: 'Port is adjacent to Funchal city centre — 10min walk to Old Town. Cable car to Monte: €20 return. Monte toboggan run: €30pp.',
    defaultTransport: ['walk', 'cable_car', 'taxi'],
    attractions: [
      { name: 'Monte Cable Car & Toboggan Ride', duration: 120, cost: 50, type: 'experience', why: 'The iconic wicker basket toboggan ridden by Winston Churchill — genuinely exciting, 2km downhill.' },
      { name: 'Mercado dos Lavradores', duration: 45, cost: 0, type: 'food', why: 'The most photogenic flower and fruit market in the world — Madeiran orchids, bird-of-paradise, passion fruit.' },
      { name: 'Levada walks', duration: 180, cost: 0, type: 'nature', why: 'Ancient irrigation channels through laurisilva forest — UNESCO world heritage. Rabacal levada is the classic.' },
      { name: 'Monte Palace Tropical Garden', duration: 75, cost: 12, type: 'nature', why: 'Spectacular hillside garden with giant koi, tile panels, Japanese and African sections.' },
    ],
    food: [
      { name: 'Mercado do Peixe fish market', area: 'Rua Conselheiro', type: 'restaurant', tip: 'Grilled espada (scabbard fish) and limpets — the two definitive Madeiran dishes, €15–18.', cost: 18 },
      { name: 'Poncha bars, Old Town', area: 'Zona Velha', type: 'bar', tip: 'Poncha (aguardente + honey + lemon) is Madeira\'s national drink. Tiny bars, locals, €2 a shot.', cost: 5 },
    ],
    hiddenGems: ['Quinta do Palheiro Ferreiro gardens — aristocratic estate garden, fewer visitors than Monte', 'Câmara de Lobos village — where Churchill painted, working fishing port'],
    touristTraps: ['Madeira embroidery shops near port — tourist pricing, identical products cheaper in market'],
    typicalCosts: { taxi: 12, cable_car: 20, lunch: 18, attraction: 12 },
  },
};

/**
 * Resolve a port slug from a free-text city name.
 * Handles variants like "Rome / Civitavecchia", "Dublin Port", "Cobh (Cork)", etc.
 */
export function resolvePort(cityName) {
  if (!cityName) return null;
  const normalized = cityName.toLowerCase().trim()
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\bport\b/g, '')
    .replace(/\bpiraeus\b/g, 'athens')
    .replace(/\bcivitavecchia\b/g, 'rome')
    .replace(/\blivorno\b/g, 'florence')
    .replace(/\bcobh\b/g, 'cobh')
    .replace(/\bcork\b/g, 'cobh')
    .replace(/\bmarittima\b/g, 'venice')
    .replace(/\bgruž\b/g, 'dubrovnik')
    .replace(/\s+/g, ' ').trim();

  // Direct slug match
  if (PORT_REGISTRY[normalized]) return PORT_REGISTRY[normalized];

  // Partial match
  for (const [slug, data] of Object.entries(PORT_REGISTRY)) {
    if (normalized.includes(slug) || slug.includes(normalized) ||
        data.displayName.toLowerCase().includes(normalized) ||
        normalized.includes(data.displayName.toLowerCase())) {
      return data;
    }
  }
  return null;
}

// ─── REGION MAP ──────────────────────────────────────────────────────────────
const REGION_MAP = {
  'Ireland': 'British Isles', 'United Kingdom': 'British Isles',
  'Spain': 'Mediterranean', 'Greece': 'Mediterranean', 'Italy': 'Mediterranean',
  'Croatia': 'Mediterranean', 'Portugal': 'Mediterranean', 'Malta': 'Mediterranean',
  'France': 'Mediterranean', 'Montenegro': 'Mediterranean', 'Turkey': 'Mediterranean',
  'Denmark': 'Northern Europe', 'Netherlands': 'Northern Europe',
  'Norway': 'Northern Europe', 'Sweden': 'Northern Europe', 'Finland': 'Northern Europe',
  'Iceland': 'Northern Europe', 'Germany': 'Northern Europe',
  'Bahamas': 'Caribbean', 'Mexico': 'Caribbean', 'United States': 'Caribbean',
  'Barbados': 'Caribbean', 'Jamaica': 'Caribbean',
};

/**
 * Transform a PORT_REGISTRY entry into a CruisePort entity shape
 * compatible with PortList and PortGuide components.
 */
export function toCruisePortShape(entry) {
  const region = REGION_MAP[entry.country] || entry.country;

  // Attraction highlights → markdown
  const attrMd = entry.attractions?.map(a => {
    const dur = a.duration || a.dur;
    const lines = [
      `### ${a.name}`,
      `*${a.area || region}* · ${dur}min · ~€${a.cost}`,
      '',
      a.why,
    ];
    if (a.tip) lines.push('', `> 💡 **Insider tip:** ${a.tip}`);
    return lines.join('\n');
  }).join('\n\n---\n\n') || '';

  // Food → markdown
  const foodMd = entry.food?.map(f => {
    return [
      `### ${f.name}`,
      f.area ? `*${f.area}*` : '',
      '',
      f.tip,
      '',
      `**Typical cost:** ${f.price || ('~€' + f.cost)}`,
    ].filter(l => l !== '').join('\n');
  }).join('\n\n---\n\n') || '';

  // Hidden gems → markdown
  const gemsMd = entry.hiddenGems?.map(g => {
    if (typeof g === 'string') return `- ${g}`;
    return `**${g.name}**: ${g.instruction}`;
  }).join('\n') || '';

  // Safety / return
  const safetyParts = [];
  const safeReturn = entry.safeReturnNote || entry.safeReturn;
  if (safeReturn) safetyParts.push(`### Safe Return to Ship\n${safeReturn}`);
  const traps = entry.traps || entry.touristTraps;
  if (traps?.length) {
    safetyParts.push(`### Tourist Traps to Avoid\n${traps.map(t => `- ⚠️ ${t}`).join('\n')}`);
  }

  // Description
  const topAttractions = entry.attractions?.slice(0, 3).map(a => a.name).join(', ') || '';
  const tenderNote = entry.portType === 'tender'
    ? ` **Important:** This is a tender port — allow an extra ${entry.tenderMinDefault || 30} minutes each way for the tender boat transfer.`
    : '';
  const description = `${entry.displayName} is one of the most popular cruise destinations in ${entry.country}. Top highlights include ${topAttractions}.${tenderNote}`;

  // Cost estimates
  const shipCost = entry.shipVsDiy || 99;
  const diyCost = entry.avgDiy || (entry.typicalCosts
    ? Math.round(Object.values(entry.typicalCosts).reduce((a, b) => a + b, 0))
    : 40);

  return {
    id: entry.slug,
    city: entry.displayName,
    country_code: entry.countryCode,
    region,
    description,
    transport_port_to_city: entry.transferNotes,
    attraction_highlights: attrMd,
    local_food: foodMd,
    unique_experiences: gemsMd,
    safety_security: safetyParts.join('\n\n'),
    tender_port: entry.portType === 'tender',
    avg_ship_excursion_price: shipCost,
    avg_diy_cost: diyCost,
    typical_docking_hours: Math.round((entry.defaultBufferMin || 480) / 60),
    _fromRegistry: true,
  };
}

/**
 * Get all ports in the registry as CruisePort entity shapes.
 * Use this as a fallback when the DB returns no port data.
 */
export function getAllPortsAsEntities() {
  return Object.values(PORT_REGISTRY).map(toCruisePortShape);
}

/**
 * Get port display info for a city name (for UI hints).
 */
export function getPortInfo(cityName) {
  const port = resolvePort(cityName);
  if (!port) return null;
  return {
    displayName: port.displayName,
    country: port.country,
    isTender: port.portType === 'tender',
    defaultBuffer: port.defaultBufferMin,
    tenderBuffer: port.tenderMinDefault,
    transferNotes: port.transferNotes,
  };
}