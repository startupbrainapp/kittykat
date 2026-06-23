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
        finalSelects: ['images/v1.jpg', 'images/v2.jpg'], tiles: [3, 4] },
      { id: 'shibuya-3am', name: 'Shibuya 3am Street Shoot', status: 'review', statusLabel: 'In Review', campaign: 'Tokyo After Dark', assignee: 'Regional Lead', initial: 'R', assetsDone: 4, assetsTotal: 4, due: 'Apr 25',
        desc: 'Guerrilla-style street photography at 3am in Shibuya. Neon reflections on wet pavement, convenience-store fluorescence, crossing lights. Raw Tokyo energy.',
        deliverables: [
          { name: 'Instagram Post', spec: '1080×1080 × 2' },
          { name: 'Story', spec: '1080×1920 × 1' },
          { name: 'Editorial Spread', spec: '2480×3508 × 1' }
        ],
        finalSelects: ['images/v3.jpg', 'images/v4.jpg'], tiles: [5, 6, 7, 8] },
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
  if (!state.customCampaigns) state.customCampaigns = [];
  if (!state.shares) state.shares = [];
  if (!state.campaignTimes) state.campaignTimes = {};
  // last-touched time so lists can sort by latest updated
  function now() { return Date.now(); }
  (function () {
    // Demo recency so an un-edited list reads as a genuine "latest updated" mix (not clustered
    // by seed order). Real edits use Date.now() (> 1e6) and always sort above these.
    var demo = { 'sakura-camo': 120, 'abc-ss26': 115, 'shibuya-3am': 110, 'chrome-milo': 105, 'neomax-retail': 100, 'jjk-milo': 95, 'flagship-film': 90, 'neon-abc': 85, 'green-camo': 60, 'adidas-drop3': 55, 'archive-reissue': 50, 'hero-film': 45 };
    state.briefs.forEach(function (b) { if (b.updatedAt == null || b.updatedAt < 1e6) b.updatedAt = (demo[b.id] != null ? demo[b.id] : 70); });
  })();

  var seq = 1;
  function newId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + (seq++); }

  var TEAM = [
    { name: 'Kathy S.', initial: 'K', role: 'CMO' },
    { name: 'Grace L.', initial: 'G', role: 'Creative Lead' },
    { name: 'Sonia M.', initial: 'S', role: 'Reviewer' },
    { name: 'Regional Lead', initial: 'R', role: 'Regional' }
  ];

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function slugify(s) {
    return String(s || 'brief').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 40) || 'brief';
  }
  function uid(base) {
    var id = base, n = 2;
    while (state.briefs.some(function (b) { return b.id === id; })) { id = base + '-' + n++; }
    return id;
  }

  window.KK = {
    // reads
    briefs: function () { return state.briefs; },
    brief: function (id) { return state.briefs.find(function (b) { return b.id === id; }) || null; },
    statusLabel: function (s) { return STATUS_LABEL[s] || s; },
    team: function () { return TEAM.slice(); },

    // campaigns are derived from existing briefs + any custom-added ones
    campaigns: function () {
      var set = [];
      state.briefs.forEach(function (b) {
        if (b.campaign && set.indexOf(b.campaign) < 0) set.push(b.campaign);
      });
      (state.customCampaigns || []).forEach(function (c) {
        if (set.indexOf(c) < 0) set.push(c);
      });
      return set;
    },
    addCampaign: function (name) {
      name = (name || '').trim();
      if (!state.customCampaigns) state.customCampaigns = [];
      if (!state.campaignTimes) state.campaignTimes = {};
      if (name && this.campaigns().indexOf(name) < 0) {
        state.customCampaigns.push(name);
        state.campaignTimes[name] = now();
        save();
      }
      return name;
    },
    campaignUpdatedAt: function (name) { return (state.campaignTimes && state.campaignTimes[name]) || 0; },

    // create a brief from the New Brief form
    createBrief: function (input) {
      input = input || {};
      var member = TEAM.filter(function (m) { return m.name === input.assignee; })[0];
      var deliverables = (input.deliverables || []).map(function (d) {
        return { name: d.name, spec: d.spec };
      });
      var total = (input.deliverables || []).reduce(function (n, d) {
        return n + (parseInt(d.qty, 10) || 1);
      }, 0) || deliverables.length || 1;
      if (input.campaign) this.addCampaign(input.campaign);
      var brief = {
        id: uid(slugify(input.name)),
        name: (input.name || 'Untitled Brief').trim(),
        status: input.status === 'production' ? 'production' : 'draft',
        statusLabel: input.status === 'production' ? STATUS_LABEL.production : STATUS_LABEL.draft,
        campaign: input.campaign || 'Standalone',
        assignee: (member && member.name) || input.assignee || 'Unassigned',
        initial: (member && member.initial) || (input.assignee ? input.assignee[0] : 'U'),
        assetsDone: 0,
        assetsTotal: total,
        due: input.due || 'TBD',
        desc: input.desc || '',
        deliverables: deliverables,
        refs: input.refs || [],
        tiles: [],
        finalSelects: [],
        updatedAt: now()
      };
      state.briefs.unshift(brief);
      save();
      return brief;
    },

    // generate produces candidate assets (stub) for a brief's studio
    generate: function (id, count) {
      var b = this.brief(id);
      if (!b) return [];
      var n = Math.max(1, Math.min(parseInt(count, 10) || 8, 12));
      if (!b.tiles) b.tiles = [];
      var startLen = b.tiles.length;
      var added = [];
      for (var i = 0; i < n; i++) {
        added.push(((startLen + i) % 8) + 1); // cycle images/1.jpg .. 8.jpg
      }
      b.tiles = added.concat(b.tiles); // newest batch on top
      b.assetsDone = Math.min(b.tiles.length, b.assetsTotal || b.tiles.length);
      if (b.status === 'draft') { b.status = 'production'; b.statusLabel = STATUS_LABEL.production; }
      if (!b.history) b.history = [];
      var env = b.blocks && b.blocks.environment;
      b.history.push({ tiles: added.slice(), at: now(), scene: (env && env.desc) || '' });
      b.updatedAt = now();
      save();
      return added;
    },

    // Per-brief generation controls (Environment / Person / Products).
    getBlocks: function (id) {
      var b = this.brief(id);
      if (!b) return {};
      if (!b.blocks) b.blocks = {};
      return b.blocks;
    },
    setBlock: function (id, name, data) {
      var b = this.brief(id);
      if (!b) return;
      if (!b.blocks) b.blocks = {};
      b.blocks[name] = data;
      b.updatedAt = now();
      save();
    },

    // Real generation history for a brief, oldest first. If a pre-existing
    // brief has tiles but no recorded history, surface them as one seed batch.
    history: function (id) {
      var b = this.brief(id);
      if (!b) return [];
      var h = (b.history || []).slice();
      if (!h.length && b.tiles && b.tiles.length) {
        h = [{ tiles: b.tiles.slice(), at: b.updatedAt || now(), seed: true }];
      }
      return h;
    },

    // edit a brief after creation
    updateBrief: function (id, patch) {
      var b = this.brief(id);
      if (!b || !patch) return null;
      ['name', 'campaign', 'desc', 'due', 'deliverables', 'refs'].forEach(function (k) {
        if (k in patch) b[k] = patch[k];
      });
      if (patch.assignee) {
        var m = TEAM.filter(function (t) { return t.name === patch.assignee; })[0];
        b.assignee = (m && m.name) || patch.assignee;
        b.initial = (m && m.initial) || patch.assignee[0];
      }
      if (patch.campaign) this.addCampaign(patch.campaign);
      if (patch.deliverables) {
        b.assetsTotal = patch.deliverables.reduce(function (n, d) { return n + (parseInt(d.qty, 10) || 1); }, 0) || b.assetsTotal;
      }
      b.updatedAt = now();
      save();
      return b;
    },

    // favourite / archive
    toggleFavourite: function (id) { var b = this.brief(id); if (b) { b.favourite = !b.favourite; b.updatedAt = now(); save(); } return !!(b && b.favourite); },
    toggleArchive: function (id) { var b = this.brief(id); if (b) { b.archived = !b.archived; b.updatedAt = now(); save(); } return !!(b && b.archived); },
    isFavourite: function (id) { var b = this.brief(id); return !!(b && b.favourite); },
    isArchived: function (id) { var b = this.brief(id); return !!(b && b.archived); },

    // threaded comments (stored on the brief)
    comments: function (id) { var b = this.brief(id); return (b && b.comments) || []; },
    addComment: function (id, text, author) {
      var b = this.brief(id);
      if (!b || !text || !text.trim()) return null;
      if (!b.comments) b.comments = [];
      var c = { id: newId('cm'), text: text.trim(), author: author || 'Kathy S.', initial: (author || 'Kathy S.')[0], at: new Date().toISOString(), replies: [] };
      b.comments.push(c); save(); return c;
    },
    addReply: function (id, commentId, text, author) {
      var b = this.brief(id);
      if (!b || !text || !text.trim()) return null;
      var c = (b.comments || []).filter(function (x) { return x.id === commentId; })[0];
      if (!c) return null;
      if (!c.replies) c.replies = [];
      var r = { id: newId('rp'), text: text.trim(), author: author || 'Kathy S.', initial: (author || 'Kathy S.')[0], at: new Date().toISOString() };
      c.replies.push(r); save(); return r;
    },

    // selects -> shareable client folder (only the curated winners)
    exportSelects: function (id, name) {
      var b = this.brief(id);
      if (!b) return null;
      var assets = (b.finalSelects || []).slice();
      var share = { id: newId('sh'), briefId: id, briefName: b.name, campaign: b.campaign, name: name || (b.name + ' — Selects'), assets: assets, createdAt: new Date().toISOString() };
      share.url = 'share.html?s=' + share.id;
      if (!state.shares) state.shares = [];
      state.shares.push(share);
      b.shareId = share.id;
      save();
      return share;
    },
    shares: function () { return state.shares || []; },
    getShare: function (sid) { return (state.shares || []).filter(function (s) { return s.id === sid; })[0] || null; },
    sharesForBrief: function (id) { return (state.shares || []).filter(function (s) { return s.briefId === id; }); },

    // writes
    setStatus: function (id, status) {
      var b = this.brief(id);
      if (b && STATUS_LABEL[status]) { b.status = status; b.statusLabel = STATUS_LABEL[status]; b.updatedAt = now(); save(); }
      return b;
    },
    // open the studio for a brief: a draft brief moves into production
    enterStudio: function (id) {
      var b = this.brief(id);
      if (b && b.status === 'draft') { this.setStatus(id, 'production'); }
      return b;
    },

    // Phase 2 — Final Selects (the brief's deliverable set)
    finalSelects: function (id) {
      var b = this.brief(id);
      return (b && b.finalSelects) || [];
    },
    isFinal: function (id, src) {
      return this.finalSelects(id).indexOf(src) >= 0;
    },
    toggleFinal: function (id, src) {
      var b = this.brief(id);
      if (!b) return false;
      if (!b.finalSelects) b.finalSelects = [];
      var i = b.finalSelects.indexOf(src);
      if (i >= 0) { b.finalSelects.splice(i, 1); } else { b.finalSelects.push(src); }
      b.updatedAt = now();
      save();
      return b.finalSelects.indexOf(src) >= 0;
    },

    // Phase 3 — review lifecycle
    reviewBriefs: function () {
      return state.briefs.filter(function (b) { return b.status === 'review'; });
    },
    submitReview: function (id) {
      var b = this.brief(id);
      if (b) { b.status = 'review'; b.statusLabel = STATUS_LABEL.review; b.updatedAt = now(); save(); }
      return b;
    },
    approve: function (id) {
      var b = this.brief(id);
      if (b) { b.status = 'shipped'; b.statusLabel = STATUS_LABEL.shipped; b.assetsDone = b.assetsTotal; b.updatedAt = now(); save(); }
      return b;
    },
    requestChanges: function (id, notes) {
      var b = this.brief(id);
      if (b) { b.status = 'production'; b.statusLabel = STATUS_LABEL.production; if (notes) b.reviewNotes = notes; b.updatedAt = now(); save(); }
      return b;
    },

    // maintenance
    save: save,
    reset: function () { state = JSON.parse(JSON.stringify(SEED)); state.customCampaigns = []; state.shares = []; save(); return state; }
  };

  // Seed localStorage on first ever load so later pages share the same state.
  if (!hadSaved) save();
})();
