/* KittyKat — shared client-side state (prototype).
   Single source of truth for the Execution flow across Briefs, Creator Studio,
   Reviews, and Asset Manager. Persisted to localStorage so transitions stick
   across page loads. In a real build this module becomes the API/DB layer;
   the entities and transitions stay identical. */
(function () {
  var KEY = 'kk_state_v1';
  var STATUS_LABEL = { draft: 'Draft', production: 'In Production', review: 'In Review', shipped: 'Shipped' };

  var SEED = {
    briefs: [
      { id: 'hero-film', name: '30yr Retrospective · Hero Film', status: 'shipped', statusLabel: 'Shipped', campaign: 'Heritage Storytelling · 30yr', assignee: 'Kathy S.', initial: 'K', assetsDone: 4, assetsTotal: 4, due: 'Feb 10',
        desc: 'Full 90-second hero film celebrating BAPE\'s 30-year journey. Opens on 1993 Harajuku footage, transitions through key archival moments, closes on present-day global community.',
        deliverables: [
          { name: 'Hero Film 16:9', spec: '1920×1080 × 1' },
          { name: 'Hero Film 9:16', spec: '1080×1920 × 1' },
          { name: 'Social Cut-down 15s', spec: '1080×1080 × 1' },
          { name: 'Web Banner', spec: '1920×600 × 1' }
        ],
        tiles: [1, 2, 3, 4] },
      { id: 'archive-reissue', name: 'Archive Reissue · 2003 Camo', status: 'shipped', statusLabel: 'Shipped', campaign: 'Heritage Storytelling · 30yr', assignee: 'Kathy S.', initial: 'K', assetsDone: 6, assetsTotal: 6, due: 'Feb 8',
        desc: 'Product-focused brief for the 2003 ABC Camo reissue. Archival styling with modern production quality. Shot against concrete + vintage Shibuya textures.',
        deliverables: [
          { name: 'Instagram Post', spec: '1080×1080 × 3' },
          { name: 'Story', spec: '1080×1920 × 2' },
          { name: 'Web Banner', spec: '1920×600 × 1' }
        ],
        tiles: [5, 6, 7, 8, 1, 2] },
      { id: 'green-camo', name: 'Green Camo Shark · Product Hero', status: 'shipped', statusLabel: 'Shipped', campaign: 'Green Camo Shark · Anniversary', assignee: 'Kathy S.', initial: 'K', assetsDone: 3, assetsTotal: 3, due: 'Mar 1',
        desc: 'Hero product photography for the Green Camo Shark hoodie anniversary edition. Studio lighting with forest-green gel accent. Flat-lay + on-model variants.',
        deliverables: [
          { name: 'E-commerce Hero', spec: '2400×2400 × 1' },
          { name: 'Instagram Carousel', spec: '1080×1080 × 1' },
          { name: 'Web Hero', spec: '1920×800 × 1' }
        ],
        tiles: [3, 4, 5] },
      { id: 'adidas-drop3', name: 'adidas Drop 3 · Track Suit', status: 'shipped', statusLabel: 'Shipped', campaign: 'Sport Luxe · adidas Drop 3', assignee: 'Kathy S.', initial: 'K', assetsDone: 5, assetsTotal: 5, due: 'Mar 18',
        desc: 'BAPE × adidas Drop 3 track suit campaign. Sport luxe positioning — shot on a running track at dawn. Three-stripe meets shark-hood.',
        deliverables: [
          { name: 'Instagram Post', spec: '1080×1080 × 2' },
          { name: 'Story', spec: '1080×1920 × 2' },
          { name: 'Web Banner', spec: '1920×600 × 1' }
        ],
        tiles: [6, 7, 8, 1, 2] },
      { id: 'neon-abc', name: 'Neon ABC Camo · Hero Product', status: 'review', statusLabel: 'In Review', campaign: 'Tokyo After Dark', assignee: 'Regional Lead', initial: 'R', assetsDone: 2, assetsTotal: 3, due: 'Apr 28',
        desc: 'Neon-lit product hero for the Tokyo After Dark ABC Camo variant. Cyber-purple and electric-green palette. Studio shot with LED strip lighting.',
        deliverables: [
          { name: 'Instagram Post', spec: '1080×1080 × 1' },
          { name: 'Story', spec: '1080×1920 × 1' },
          { name: 'Web Banner', spec: '1920×600 × 1' }
        ],
        tiles: [3, 4] },
      { id: 'shibuya-3am', name: 'Shibuya 3am Street Shoot', status: 'review', statusLabel: 'In Review', campaign: 'Tokyo After Dark', assignee: 'Regional Lead', initial: 'R', assetsDone: 4, assetsTotal: 4, due: 'Apr 25',
        desc: 'Guerrilla-style street photography at 3am in Shibuya. Neon reflections on wet pavement, convenience-store fluorescence, crossing lights. Raw Tokyo energy.',
        deliverables: [
          { name: 'Instagram Post', spec: '1080×1080 × 2' },
          { name: 'Story', spec: '1080×1920 × 1' },
          { name: 'Editorial Spread', spec: '2480×3508 × 1' }
        ],
        tiles: [5, 6, 7, 8] },
      { id: 'neomax-retail', name: 'Neo-Max Retail Concept · Interior', status: 'production', statusLabel: 'In Production', campaign: 'Neo-Max Store · Shibuya', assignee: 'Kathy S.', initial: 'K', assetsDone: 2, assetsTotal: 6, due: 'May 28',
        desc: 'Interior design renders + visual merchandising concepts for the Neo-Maximalist pop-up in Shibuya. Print-on-print walls, camo-tile floors, LED canopy ceiling.',
        deliverables: [
          { name: '3D Render — Entrance', spec: '3840×2160 × 1' },
          { name: '3D Render — Interior', spec: '3840×2160 × 2' },
          { name: 'Visual Merch Plan', spec: 'PDF × 1' },
          { name: 'Instagram Teaser', spec: '1080×1080 × 1' },
          { name: 'Story Teaser', spec: '1080×1920 × 1' }
        ],
        tiles: [1, 2] },
      { id: 'sakura-camo', name: 'Sakura Camo Hero Pattern', status: 'production', statusLabel: 'In Production', campaign: 'SS26 · Hana Matsuri', assignee: 'Kathy S.', initial: 'K', assetsDone: 1, assetsTotal: 4, due: 'May 10',
        desc: 'Hero pattern design for the Sakura Camo colorway. Cherry-blossom pink over classic ABC Camo. Needs seamless repeat tile + product mockups.',
        deliverables: [
          { name: 'Pattern Tile (seamless)', spec: '4000×4000 × 1' },
          { name: 'Product Mockup — Hoodie', spec: '2400×2400 × 1' },
          { name: 'Product Mockup — Tee', spec: '2400×2400 × 1' },
          { name: 'Instagram Reveal', spec: '1080×1080 × 1' }
        ],
        tiles: [3] },
      { id: 'flagship-film', name: 'Shibuya Flagship Reopening Film', status: 'production', statusLabel: 'In Production', campaign: 'SS26 · Hana Matsuri', assignee: 'Kathy S.', initial: 'K', assetsDone: 0, assetsTotal: 2, due: 'May 12',
        desc: 'Short-form film (60s) for the Shibuya flagship reopening. Cherry blossoms falling on Harajuku streets, transition into the new store interior.',
        deliverables: [
          { name: 'Film 16:9', spec: '1920×1080 × 1' },
          { name: 'Film 9:16 (Story)', spec: '1080×1920 × 1' }
        ],
        tiles: [] },
      { id: 'abc-ss26', name: 'ABC Camo SS26 · New Colorways', status: 'draft', statusLabel: 'Draft', campaign: 'ABC Camo Drop SS26', assignee: 'Kathy S.', initial: 'K', assetsDone: 0, assetsTotal: 8, due: 'Apr 28',
        desc: 'Full product photography suite for the SS26 ABC Camo colorway expansion: Tokyo Night (navy/black), Blush Pink (pastel/white), Monochrome (grey/charcoal).',
        deliverables: [
          { name: 'E-commerce Hero', spec: '2400×2400 × 3' },
          { name: 'Instagram Post', spec: '1080×1080 × 3' },
          { name: 'Web Banner', spec: '1920×600 × 1' },
          { name: 'Story', spec: '1080×1920 × 1' }
        ],
        tiles: [] },
      { id: 'chrome-milo', name: 'Chrome Milo Reissue · Archive', status: 'draft', statusLabel: 'Draft', campaign: 'Y2K Revival Capsule', assignee: 'Kathy S.', initial: 'K', assetsDone: 0, assetsTotal: 4, due: 'Q3',
        desc: 'Archival-futuristic art direction for the Chrome Milo reissue. Y2K-era chrome/holographic treatment on Baby Milo. "Baby Milo Was Always Y2K" tagline.',
        deliverables: [
          { name: 'Key Art — Chrome Milo', spec: '2400×2400 × 1' },
          { name: 'Instagram Carousel', spec: '1080×1080 × 1' },
          { name: 'Story', spec: '1080×1920 × 1' },
          { name: 'Web Banner', spec: '1920×600 × 1' }
        ],
        tiles: [] },
      { id: 'jjk-milo', name: 'JJK × Baby Milo · Key Art', status: 'draft', statusLabel: 'Draft', campaign: 'Anime Collab · Jujutsu Kaisen', assignee: 'Kathy S.', initial: 'K', assetsDone: 0, assetsTotal: 6, due: 'TBD',
        desc: 'Key art exploration for the JJK × Baby Milo crossover. Milo as Gojo, Itadori, Sukuna. Manga panel grid layout. Must clear licensing before production.',
        deliverables: [
          { name: 'Key Art — Milo as Gojo', spec: '2400×2400 × 1' },
          { name: 'Key Art — Milo as Itadori', spec: '2400×2400 × 1' },
          { name: 'Instagram Post', spec: '1080×1080 × 2' },
          { name: 'Story', spec: '1080×1920 × 1' },
          { name: 'Web Banner', spec: '1920×600 × 1' }
        ],
        tiles: [] }
    ]
  };

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  var hadSaved = !!read();
  var state = read() || JSON.parse(JSON.stringify(SEED));

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  window.KK = {
    // reads
    briefs: function () { return state.briefs; },
    brief: function (id) { return state.briefs.find(function (b) { return b.id === id; }) || null; },
    statusLabel: function (s) { return STATUS_LABEL[s] || s; },

    // writes
    setStatus: function (id, status) {
      var b = this.brief(id);
      if (b && STATUS_LABEL[status]) { b.status = status; b.statusLabel = STATUS_LABEL[status]; save(); }
      return b;
    },
    // open the studio for a brief: a draft brief moves into production
    enterStudio: function (id) {
      var b = this.brief(id);
      if (b && b.status === 'draft') { this.setStatus(id, 'production'); }
      return b;
    },

    // maintenance
    save: save,
    reset: function () { state = JSON.parse(JSON.stringify(SEED)); save(); return state; }
  };

  // Seed localStorage on first ever load so later pages share the same state.
  if (!hadSaved) save();
})();
