import { useState } from "react";

const O = "own", B = "buy", N = "new";

const OWNED = [
  { name: "Sky Team + Exp", bgg: 8.2, w: 2.0, p: "2", t: "20m", cat: "2P Co-op", sum: "SdJ 2024. Silent dice-placement co-op — land a plane together without discussing strategy. Tense, unique, endlessly replayable with expansion scenarios." },
  { name: "Wingspan", bgg: 8.0, w: 2.4, p: "1-5", t: "60m", cat: "Engine Building", sum: "BGG Top 33. Bird sanctuary with cascading card combos. Beautiful production, excellent solo Automa. Your relaxed engine builder." },
  { name: "The Crew: Deep Sea", bgg: 8.1, w: 2.0, p: "2-5", t: "20m", cat: "Co-op Trick-Taking", sum: "Peaked BGG #4. Co-op trick-taking with 32 escalating missions and limited communication. Under $15 — best value in modern gaming." },
  { name: "Scout", bgg: 7.8, w: 1.4, p: "3-5", t: "15m", cat: "Card Climbing", sum: "SdJ nominee. Can't rearrange your hand — play combos or poach from opponents. Brilliant constraint, genuine decisions in 15 minutes." },
  { name: "LOTR: Duel", bgg: 7.8, w: 2.2, p: "2", t: "30m", cat: "2P Strategy", sum: "7 Wonders Duel reimagined with LOTR theme + area control board. Card drafting pyramid with multiple victory conditions." },
  { name: "Harmonies", bgg: 7.7, w: 1.9, p: "1-4", t: "30m", cat: "Spatial Puzzle", sum: "BGG Top 60. Stack coloured tokens into 3D patterns to attract animals. Gorgeous, peaceful, unique spatial puzzle with solo mode." },
  { name: "Ticket to Ride Europe", bgg: 7.5, w: 1.9, p: "2-5", t: "45m", cat: "Gateway / Route", sum: "Improved over the original with stations and tunnels. THE gateway game — converts non-gamers reliably with simple rules and satisfying routes." },
  { name: "Secret Hitler", bgg: 7.5, w: 1.7, p: "5-10", t: "45m", cat: "Social Deduction", sum: "Policy-based hidden role game. Fascists infiltrate government while liberals investigate. Most accessible big-group deduction game." },
  { name: "Avalon: Quest", bgg: 7.5, w: 1.7, p: "5-10", t: "30m", cat: "Social Deduction", sum: "Definitive edition with all expansions + updated art. Deeper than Secret Hitler — pure deduction with Merlin/assassin roles." },
  { name: "Sushi Go Party!", bgg: 7.4, w: 1.3, p: "2-8", t: "20m", cat: "Card Drafting", sum: "Pick-and-pass card drafting with customisable menus. Scales beautifully to 8 players. Easy to teach, surprisingly tactical." },
  { name: "Sea Salt & Paper + Exp", bgg: 7.4, w: 1.4, p: "2-4", t: "25m", cat: "Set Collection", sum: "Origami-art cards. Collect pairs and combos, decide: stop safely or push for more and risk opponents catching up." },
  { name: "Agent Avenue", bgg: 7.4, w: 1.8, p: "2-4", t: "30m", cat: "Mid Strategy", sum: "SdJ 2025 recommended. 'I split, you choose' spy-themed set collection. One card face-up, one face-down — opponent picks." },
  { name: "Flip 7: With a Vengeance", bgg: 7.4, w: 1.1, p: "3-6", t: "20m", cat: "Push-Luck / Take-That", sum: "Meaner standalone sequel to SdJ-nominated Flip 7. Flip cards without repeating numbers — bust and lose everything. New steal/swap/freeze cards add cutthroat interaction." },
  { name: "Trio", bgg: 7.3, w: 1.0, p: "3-6", t: "15m", cat: "Memory / Deduction", sum: "Tiny card game of memory and deduction. Find matching trios from face-down cards and opponents' hands. Travels anywhere." },
  { name: "Telestrations", bgg: 7.2, w: 1.0, p: "4-8", t: "30m", cat: "Party / Drawing", sum: "Telephone meets Pictionary. Draw, pass, guess, pass. Guaranteed laughs from inevitable miscommunication chains." },
  { name: "Catan", bgg: 7.1, w: 2.3, p: "3-4", t: "75m", cat: "Gateway Strategy", sum: "The original modern gateway. Trade resources, build settlements. Showing its age but still has cultural cachet." },
  { name: "Lost Cities", bgg: 7.1, w: 1.5, p: "2", t: "30m", cat: "2P Card Game", sum: "Play ascending cards to expeditions — start one and you're committed. Push-your-luck tension in a simple 2p card game." },
  { name: "A Fake Artist", bgg: 7.0, w: 1.1, p: "5-10", t: "20m", cat: "Party / Drawing", sum: "Everyone draws one line on a shared picture — but one player doesn't know the prompt. Social deduction through art." },
  { name: "Coup", bgg: 7.0, w: 1.4, p: "2-6", t: "15m", cat: "Bluffing Micro", sum: "Claim roles, bluff, call bluffs, eliminate. 15-minute cutthroat deduction. Quick enough to play 3 rounds in a row." },
  { name: "Cockroach Poker", bgg: 7.0, w: 1.0, p: "2-6", t: "20m", cat: "Bluffing Filler", sum: "Pass a face-down card, claim what it is. Opponent must call your bluff or pass it on. Pure table banter." },
  { name: "Happy Salmon", bgg: 6.7, w: 1.0, p: "3-8", t: "2m", cat: "Party / Physical", sum: "Frantic 2-minute matching game with high-fives and fist-bumps. Icebreaker energy, not a 'game' game." },
  { name: "Monopoly Deal", bgg: 6.7, w: 1.1, p: "2-5", t: "15m", cat: "Card Filler", sum: "Quick Monopoly-themed card game. Outclassed by Scout and SSP but universally known — useful at pubs." },
  { name: "Scrabble", bgg: 6.2, w: 2.0, p: "2-4", t: "90m", cat: "Word Game", sum: "Classic word game. Polarising — vocabulary-dependent. Keep for the word nerds." },
];

const STILL_CUT = [
  { name: "Risk", bgg: 5.5, reason: "Worst rated. Player elimination, 2+ hours." },
  { name: "Dumb Ways to Die", bgg: 6.2, reason: "Low replay. Meme-based." },
  { name: "Uno Flip", bgg: 6.3, reason: "Sushi Go, Scout, SSP, Flip 7 all better." },
  { name: "Recipes for Disaster", bgg: 6.5, reason: "Scout and Sushi Go replace this." },
  { name: "The Chameleon", bgg: 6.5, reason: "Secret Hitler + Avalon Quest cover this." },
];

const ALL_G = {};
OWNED.forEach(g => { ALL_G[g.name] = { ...g, s: O }; });

const PLANNED = [
  { name: "Heat", bgg: 8.2, w: 2.2, p: "1-6", t: "45m", cat: "Racing", s: B },
  { name: "Clank!: Catacombs", bgg: 8.2, w: 2.5, p: "2-4", t: "60m", cat: "Deck-Build Adventure", s: B },
  { name: "Quacks", bgg: 7.9, w: 1.9, p: "2-4", t: "45m", cat: "Bag Building", s: B },
  { name: "Pandemic Iberia", bgg: 7.7, w: 2.6, p: "2-5", t: "60m", cat: "Co-op Strategy", s: B },
  { name: "Codenames", bgg: 7.6, w: 1.3, p: "4-8+", t: "15m", cat: "Team Party / Word", s: B },
  { name: "Patchwork", bgg: 7.6, w: 1.6, p: "2", t: "30m", cat: "2P Puzzle", s: B },
  { name: "Long Shot", bgg: 7.5, w: 1.8, p: "1-8", t: "30m", cat: "Roll-Write / Betting", s: B },
  { name: "Dune: Imperium", bgg: 8.6, w: 3.0, p: "1-4", t: "90m", cat: "Heavy Deck-Worker", s: B },
];
PLANNED.forEach(g => { ALL_G[g.name] = g; });

const NEW_RECS = [
  { name: "Bomb Busters", bgg: 7.7, w: 2.0, p: "2-5", t: "30m", cat: "Co-op Deduction", s: N,
    verdict: "BUY", col: "#059669",
    why: "SdJ 2025 winner. 66 wire-cutting co-op scenarios. Anti-quarterbacking — everyone contributes equally. Different from The Crew (deduction vs trick-taking)." },
  { name: "Decrypto", bgg: 7.8, w: 1.8, p: "3-8", t: "30m", cat: "Team Code / Word", s: N,
    verdict: "BUY", col: "#059669",
    why: "Team code-cracking. Give coded clues your team decodes while opponents intercept. Plays ALONGSIDE Codenames — different skill. Higher ceiling, rewards repeat plays." },
  { name: "Cascadia", bgg: 7.7, w: 1.8, p: "1-4", t: "45m", cat: "Tile-Laying Puzzle", s: N,
    verdict: "BUY", col: "#059669",
    why: "SdJ 2022. Tile + token drafting with Pacific NW wildlife. Different from Harmonies (flat tile-laying vs 3D stacking). Great solo. Gateway-friendly." },
  { name: "Just One", bgg: 7.5, w: 1.0, p: "3-7", t: "20m", cat: "Co-op Party / Word", s: N,
    verdict: "BUY", col: "#059669",
    why: "SdJ 2019. Everyone writes a one-word clue — duplicates cancel. You have competitive party games but ZERO co-op party games. Completely different social energy." },
  { name: "Libertalia", bgg: 7.8, w: 2.2, p: "1-6", t: "45m", cat: "Simultaneous Selection", s: N,
    verdict: "Strong consider", col: "#2563eb",
    why: "Everyone has identical character cards but plays differently. Resolution order creates delicious chaos. Nothing remotely like this in your collection." },
  { name: "Endeavor: Deep Sea", bgg: 8.3, w: 2.8, p: "1-5", t: "75m", cat: "Strategy / Exploration", s: N,
    verdict: "Strong consider", col: "#2563eb",
    why: "Kennerspiel 2025 winner. BGG 8.3 — highest-rated game under weight 3.0 you could add. Bridge between Phase 1 and Dune. Excellent solo." },
];
NEW_RECS.forEach(g => { ALL_G[g.name] = g; });

const SCENARIOS = [
  {
    id: "2p", emoji: "💑", label: "Two-Player Night",
    desc: "You and Anese — pick by mood",
    subs: [
      { label: "🔥 Tense Co-op", games: [
        { n: "Sky Team + Exp", role: "Silent dice co-op. Land a plane without discussing strategy." },
        { n: "The Crew: Deep Sea", role: "Co-op trick-taking. 2p variant works well." },
        { n: "Pandemic Iberia", role: "Disease-fighting co-op. Heavier, longer." },
      ]},
      { label: "⚔️ Competitive Head-to-Head", games: [
        { n: "LOTR: Duel", role: "Card drafting pyramid + area control." },
        { n: "Patchwork", role: "Tetris tile-laying. Relaxing but competitive." },
        { n: "Lost Cities", role: "Push-your-luck card expeditions." },
        { n: "Agent Avenue", role: "Spy-themed 'I split you choose'." },
      ]},
      { label: "🧘 Relaxed / Parallel", games: [
        { n: "Wingspan", role: "Engine building side by side. Beautiful." },
        { n: "Harmonies", role: "3D spatial puzzle. Low conflict." },
        { n: "Sea Salt & Paper + Exp", role: "Quick set collection push-luck." },
        { n: "Cascadia", role: "Tile + token drafting puzzle." },
      ]},
    ],
  },
  {
    id: "party", emoji: "🎉", label: "Party Night (5+ Players)",
    desc: "Big group — rotate through blocks",
    subs: [
      { label: "🎯 Team Games", games: [
        { n: "Codenames", role: "THE team word game. Two spymasters, one-word clues." },
        { n: "Decrypto", role: "Team code-cracking. Higher skill ceiling." },
        { n: "Just One", role: "Co-op word game. Duplicates cancel. Zero pressure." },
      ]},
      { label: "🕵️ Social Deduction", games: [
        { n: "Secret Hitler", role: "Policy-based. Most accessible for mixed groups." },
        { n: "Avalon: Quest", role: "Pure deduction. Deeper, needs committed players." },
        { n: "A Fake Artist", role: "Drawing deduction. Lighter, creative energy." },
      ]},
      { label: "⚡ Party Fillers", games: [
        { n: "Telestrations", role: "Drawing telephone. Guaranteed hilarity." },
        { n: "Sushi Go Party!", role: "Card drafting to 8 players." },
        { n: "Flip 7: With a Vengeance", role: "Push-luck with take-that. Cutthroat." },
        { n: "Cockroach Poker", role: "Bluffing filler. Pure laughs." },
        { n: "Happy Salmon", role: "2-minute physical icebreaker." },
      ]},
    ],
  },
  {
    id: "game", emoji: "🎲", label: "Game Night (3-5 Players)",
    desc: "Regular crew — build the evening",
    subs: [
      { label: "🚀 Openers (15-25 min)", games: [
        { n: "Scout", role: "Card climbing. 15 min of brilliant decisions." },
        { n: "The Crew: Deep Sea", role: "Co-op trick-taking mission. Quick." },
        { n: "Sushi Go Party!", role: "Card drafting. Sets the mood." },
        { n: "Trio", role: "Memory deduction warm-up." },
        { n: "Flip 7: With a Vengeance", role: "Push-luck with steal cards. Gets competitive fast." },
      ]},
      { label: "🏰 Main Events (45-60 min)", games: [
        { n: "Heat", role: "Racing. THE crowd-pleaser. Gets energy up." },
        { n: "Clank!: Catacombs", role: "Dungeon crawl + deck building. Adventure." },
        { n: "Quacks", role: "Bag-building push-luck. Everyone engages." },
        { n: "Wingspan", role: "Relaxed engine building. Chill vibe." },
        { n: "Libertalia", role: "Simultaneous card selection. Pirate chaos." },
        { n: "Long Shot", role: "Horse racing betting. Any count up to 8." },
      ]},
      { label: "🌙 Closers (15-20 min)", games: [
        { n: "Scout", role: "Quick wind-down." },
        { n: "Sea Salt & Paper + Exp", role: "Push-luck set collection." },
        { n: "Cockroach Poker", role: "Light laughs to end the night." },
        { n: "Coup", role: "Quick bluffing. 'One more round' energy." },
      ]},
    ],
  },
  {
    id: "gateway", emoji: "🚪", label: "Converting Non-Gamers",
    desc: "Friends who think board games = Monopoly",
    subs: [
      { label: "🟢 Start Here", games: [
        { n: "Ticket to Ride Europe", role: "Collect cards, claim routes. Instant satisfaction." },
        { n: "Codenames", role: "Team word game. Everyone contributes." },
        { n: "Just One", role: "Co-op word game. No competition pressure." },
        { n: "Sushi Go Party!", role: "Pick one card, pass the rest. Zero intimidation." },
        { n: "Cockroach Poker", role: "Lying game. Just read faces." },
        { n: "Flip 7: With a Vengeance", role: "Push-luck card flipping. Feels like Uno's cool cousin." },
      ]},
      { label: "🟡 Once They're Hooked", games: [
        { n: "Quacks", role: "Bag-building push-luck. People get it instantly." },
        { n: "Cascadia", role: "Tile-laying with animals. Gorgeous, approachable." },
        { n: "The Crew: Deep Sea", role: "Co-op trick-taking. Introduces co-op gently." },
        { n: "Heat", role: "Racing that looks amazing. Hooks competitive types." },
      ]},
      { label: "🔴 Ready for More", games: [
        { n: "Wingspan", role: "Engine building. Beautiful theme eases complexity." },
        { n: "Clank!: Catacombs", role: "Adventure + deck building." },
        { n: "Pandemic Iberia", role: "Co-op strategy. Deeper collaboration." },
      ]},
    ],
  },
  {
    id: "coop", emoji: "🤝", label: "Co-op Night",
    desc: "Working together — by weight",
    subs: [
      { label: "🪶 Light (wt ≤2.0)", games: [
        { n: "Just One", role: "Co-op word game. No fail state." },
        { n: "The Crew: Deep Sea", role: "Co-op trick-taking. 20 min missions." },
        { n: "Sky Team + Exp", role: "2P silent dice co-op." },
        { n: "Bomb Busters", role: "Wire-cutting deduction. 66 scenarios." },
      ]},
      { label: "⚖️ Medium (wt 2.1-2.8)", games: [
        { n: "Pandemic Iberia", role: "Disease-fighting. Best Pandemic variant." },
        { n: "Endeavor: Deep Sea", role: "KdJ 2025. Ocean exploration co-op elements." },
      ]},
    ],
  },
  {
    id: "fillers", emoji: "⚡", label: "Quick Games (<25 min)",
    desc: "Pub, between games, waiting for food",
    subs: [
      { label: "🃏 Card Play", games: [
        { n: "Scout", role: "Card climbing. Best filler you own." },
        { n: "Sea Salt & Paper + Exp", role: "Push-luck set collection." },
        { n: "Sushi Go Party!", role: "Card drafting. Scales to 8." },
        { n: "Trio", role: "Memory + deduction. Tiny box." },
        { n: "Flip 7: With a Vengeance", role: "Push-luck number flipping." },
      ]},
      { label: "🎭 Bluffing", games: [
        { n: "Coup", role: "Bluff or die. 15 min." },
        { n: "Cockroach Poker", role: "Pass and lie." },
      ]},
      { label: "🗣️ Word & Party", games: [
        { n: "Codenames", role: "Team word game. Any group size." },
        { n: "Just One", role: "Co-op word game. 20 min." },
      ]},
    ],
  },
  {
    id: "strategy", emoji: "🧠", label: "Strategy Session (45+ min)",
    desc: "Meatier games, experienced players",
    subs: [
      { label: "⚔️ Competitive", games: [
        { n: "Heat", role: "Racing + hand management. Wt 2.2." },
        { n: "Clank!: Catacombs", role: "Deck-build + dungeon crawl. Wt 2.5." },
        { n: "Wingspan", role: "Engine building. Relaxed. Wt 2.4." },
        { n: "Libertalia", role: "Simultaneous selection. Unique. Wt 2.2." },
        { n: "Endeavor: Deep Sea", role: "KdJ 2025. Wt 2.8. Phase 2 bridge." },
      ]},
      { label: "🤝 Co-op Strategy", games: [
        { n: "Pandemic Iberia", role: "Disease-fighting. Wt 2.6." },
        { n: "Bomb Busters", role: "Deduction co-op. 66 scenarios. Wt 2.0." },
      ]},
      { label: "🏋️ Phase 2 Heavy (≥3.0)", games: [
        { n: "Dune: Imperium", role: "BGG Top 5. Deck-build + worker placement. Wt 3.0." },
      ]},
    ],
  },
  {
    id: "solo", emoji: "🧘", label: "Solo Gaming",
    desc: "Just you, after hours",
    subs: [
      { label: "✦ Available Now", games: [
        { n: "Wingspan", role: "Automa solo. Relaxed engine building." },
        { n: "Harmonies", role: "Solo puzzle mode. Beautiful." },
      ]},
      { label: "🛒 To Buy", games: [
        { n: "Cascadia", role: "Solo scenarios. Tile-laying." },
        { n: "Endeavor: Deep Sea", role: "Solo mode. Strategy." },
        { n: "Dune: Imperium", role: "Excellent AI opponents. Phase 2." },
      ]},
    ],
  },
];

const TIERS = [
  { t: "Tier 1 — Critical Gaps", col: "#059669", bg: "#ecfdf5",
    games: ["Heat", "Codenames", "Quacks", "Clank!: Catacombs"],
    note: "Racing, team party, bag-building, adventure — zero current coverage." },
  { t: "Tier 2 — High Value", col: "#2563eb", bg: "#eff6ff",
    games: ["Cascadia", "Just One", "Bomb Busters", "Decrypto", "Pandemic Iberia"],
    note: "Co-op party, co-op deduction, team code, relaxed puzzle, co-op strategy." },
  { t: "Tier 3 — Round Out", col: "#d97706", bg: "#fffbeb",
    games: ["Long Shot", "Libertalia", "Patchwork", "Endeavor: Deep Sea"],
    note: "Betting, simultaneous selection, 2p puzzle, Phase 2 bridge." },
  { t: "Phase 2 — Heavy", col: "#dc2626", bg: "#fef2f2",
    games: ["Dune: Imperium"],
    note: "After group handles Clank/Heat/Wingspan. Then Ark Nova (3.7), SETI (3.3)." },
];

function Badge({ children, color = "#64748b" }) {
  return <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600, background: color + "15", color, whiteSpace: "nowrap" }}>{children}</span>;
}
function SBadge({ s }) {
  if (s === O) return <Badge color="#059669">✦ OWN</Badge>;
  if (s === B) return <Badge color="#d97706">🛒 BUY</Badge>;
  return <Badge color="#7c3aed">💡 NEW</Badge>;
}

function OwnedRow({ g }) {
  const [open, setOpen] = useState(false);
  const col = g.bgg >= 8 ? "#059669" : g.bgg >= 7 ? "#d97706" : "#94a3b8";
  const wCol = g.w >= 2.3 ? "#d97706" : g.w >= 1.5 ? "#22c55e" : "#94a3b8";
  return (
    <div onClick={() => setOpen(!open)} style={{ padding: "9px 11px", borderBottom: "1px solid #ecfdf5", cursor: "pointer", background: open ? "#f0fdf4" : "transparent" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 12, color: col, fontFamily: "monospace" }}>{g.bgg}</span>
          <div style={{ width: 32, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(((g.w - 0.5) / 4) * 100, 100)}%`, height: "100%", background: wCol, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: wCol, fontWeight: 600, fontFamily: "monospace" }}>{g.w}</span>
          <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{g.p}</span>
          <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{g.t}</span>
          <span style={{ fontSize: 11, color: open ? "#475569" : "#d1d5db", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 5 }}>
          <Badge color="#475569">{g.cat}</Badge>
          <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, margin: "4px 0 0" }}>{g.sum}</p>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ sc, openS, setOpenS, openSub, toggleSub }) {
  const isO = openS === sc.id;
  const allGames = sc.subs.flatMap(sub => sub.games);
  const ownC = allGames.filter(g => (ALL_G[g.n] || {}).s === O).length;
  const pct = Math.round(ownC / allGames.length * 100);
  return (
    <div style={{ marginBottom: 7, border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", boxShadow: isO ? "0 1px 6px #0001" : "none" }}>
      <div onClick={() => setOpenS(isO ? null : sc.id)} style={{
        padding: "10px 11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: isO ? "#f8fafc" : "#fff",
      }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 15, marginRight: 4 }}>{sc.emoji}</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{sc.label}</span>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 6 }}>{sc.desc}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct >= 60 ? "#059669" : pct >= 30 ? "#d97706" : "#dc2626", borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{pct}%</span>
          <span style={{ color: "#94a3b8", transform: isO ? "rotate(180deg)" : "none", transition: "transform 0.15s", fontSize: 11 }}>▾</span>
        </div>
      </div>
      {isO && (
        <div style={{ padding: "0 11px 8px" }}>
          {sc.subs.map((sub, si) => {
            const subKey = `${sc.id}-${si}`;
            const subOpen = openSub[subKey] !== false;
            return (
              <div key={si} style={{ marginBottom: 4 }}>
                <div onClick={(e) => { e.stopPropagation(); toggleSub(sc.id, si); }}
                  style={{ padding: "5px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{sub.label}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8", transform: subOpen ? "rotate(180deg)" : "none" }}>▾</span>
                </div>
                {subOpen && sub.games.map((gm, gi) => {
                  const ref = ALL_G[gm.n] || { bgg: 0, s: "?" };
                  const bgMap = { [O]: "#f0fdf4", [B]: "#fffbeb", [N]: "#f5f3ff" };
                  const bcMap = { [O]: "#bbf7d0", [B]: "#fde68a", [N]: "#ddd6fe" };
                  return (
                    <div key={gi} style={{
                      display: "flex", alignItems: "flex-start", gap: 5, padding: "4px 7px", marginBottom: 2, marginLeft: 4,
                      background: bgMap[ref.s] || "#f8fafc", borderRadius: 4, border: `1px solid ${bcMap[ref.s] || "#e2e8f0"}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{gm.n}</span>
                          <SBadge s={ref.s} />
                          {ref.bgg > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: ref.bgg >= 8 ? "#059669" : "#d97706", fontFamily: "monospace" }}>{ref.bgg}</span>}
                        </div>
                        <p style={{ fontSize: 11, color: "#64748b", margin: "1px 0 0", lineHeight: 1.4 }}>{gm.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("owned");
  const [openS, setOpenS] = useState(null);
  const [openSub, setOpenSub] = useState({});
  const tabs = [{ id: "owned", l: "Collection" }, { id: "scenarios", l: "Scenarios" }, { id: "buy", l: "Buy Order" }, { id: "recs", l: "New Recs" }];

  const toggleSub = (sId, idx) => {
    const key = `${sId}-${idx}`;
    setOpenSub(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", color: "#1e293b", background: "#fff", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ padding: "16px 14px 0", borderBottom: "1px solid #e2e8f0" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>🎲 Board Game Collection</h1>
        <div style={{ display: "flex", gap: 5, margin: "5px 0 10px", flexWrap: "wrap" }}>
          <Badge color="#059669">{OWNED.length} owned · Avg {(OWNED.reduce((s, g) => s + g.bgg, 0) / OWNED.length).toFixed(1)}</Badge>
          <Badge color="#d97706">{PLANNED.length} planned</Badge>
          <Badge color="#7c3aed">{NEW_RECS.length} new recs</Badge>
        </div>
        <div style={{ display: "flex", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "7px 11px", fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "#0f172a" : "#94a3b8", background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #0f172a" : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 14px 40px" }}>
        {tab === "owned" && (<>
          <div style={{ border: "1px solid #d1fae5", borderRadius: 6, overflow: "hidden", marginBottom: 14 }}>
            {OWNED.map(g => <OwnedRow key={g.name} g={g} />)}
          </div>
          <div style={{ padding: "8px 10px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", margin: "0 0 4px" }}>Recommend Cutting</p>
            {STILL_CUT.map(c => (
              <p key={c.name} style={{ fontSize: 11, color: "#64748b", margin: "1px 0" }}>
                <strong style={{ color: "#dc2626" }}>{c.name}</strong> ({c.bgg}) — {c.reason}
              </p>
            ))}
          </div>
        </>)}

        {tab === "scenarios" && (<>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 8px" }}>
            <Badge color="#059669">✦ OWN</Badge>{" "}<Badge color="#d97706">🛒 BUY</Badge>{" "}<Badge color="#7c3aed">💡 NEW</Badge> — tap scenarios, then sub-groups.
          </p>
          {SCENARIOS.map(sc => (
            <ScenarioCard key={sc.id} sc={sc} openS={openS} setOpenS={setOpenS} openSub={openSub} toggleSub={toggleSub} />
          ))}
        </>)}

        {tab === "buy" && (<>
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
              <strong>Gaps:</strong> Racing (0%), team party (0%), bag-building (0%), adventure (0%), co-op deduction (0%), co-op party (0%). Fillers and social deduction are saturated.
            </p>
          </div>
          {TIERS.map(tier => (
            <div key={tier.t} style={{ marginBottom: 10, border: `1px solid ${tier.col}25`, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ padding: "7px 10px", background: tier.bg }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: tier.col, margin: 0 }}>{tier.t}</h3>
                <p style={{ fontSize: 10, color: "#64748b", margin: "1px 0 0" }}>{tier.note}</p>
              </div>
              {tier.games.map(name => {
                const gm = ALL_G[name];
                if (!gm) return null;
                return (
                  <div key={name} style={{ padding: "6px 10px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: gm.bgg >= 8 ? "#059669" : "#d97706", fontFamily: "monospace" }}>{gm.bgg}</span>
                      <Badge color="#475569">Wt {gm.w}</Badge>
                      <Badge color="#475569">{gm.p}</Badge>
                      <Badge color="#475569">{gm.t}</Badge>
                      <SBadge s={gm.s} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", margin: "0 0 3px" }}>Skip / Deprioritise</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Skull (have CP + Coup), Love Letter (have Coup), Pixies (have SSP), That's Not a Hat (have Trio), Camel Up (Long Shot planned), Forest Shuffle (have Wingspan), Underwater Cities (overlaps Ark Nova), Azul (have Harmonies + Cascadia), Faraway (stacked on fillers), Mysterium (enough co-op with Crew + BB + Pandemic).
            </p>
          </div>
        </>)}

        {tab === "recs" && (<>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>
            Games filling gaps nothing in your collection covers. Zero overlap with owned games.
          </p>
          {NEW_RECS.map(r => (
            <div key={r.name} style={{ marginBottom: 8, border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 11px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: r.bgg >= 7.7 ? "#059669" : "#d97706", fontFamily: "monospace" }}>{r.bgg}</span>
                <Badge color="#475569">Wt {r.w} · {r.p} · {r.t}</Badge>
                <Badge color={r.col}>{r.verdict}</Badge>
              </div>
              <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.55, margin: 0 }}>{r.why}</p>
            </div>
          ))}
        </>)}
      </div>
    </div>
  );
}
