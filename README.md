# lantern-thief

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/Akmaludien/lantern-thief/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/Akmaludien/lantern-thief/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

**The Lantern Thief** is a top-down 2D stealth game: you are Wick, a thief with a lantern, sneaking through the Ember Archive at night to steal three relics — the Ember Idol, the Moon Pearl and the Gilded Key — and reach the exit unseen.

Your lantern is both tool and risk: lit, you see far but guards spot you from further away; unlit, you see little but are harder to spot. Toggle it with **F**. Move with **WASD / arrow keys**, hold **Shift** to walk slowly and silently. Guards patrol fixed routes with visible vision cones; their suspicion meter rises while you are seen, falls while you hide. Get caught and the level restarts. Three floors — Entrance Hall, Gallery, Vault — each with its own relics, cover and patrols. All art is drawn on canvas and all sound is synthesized with WebAudio; no external assets, no network requests.

## Run it

```sh
cd game && python3 -m http.server 8000
```

Then open http://localhost:8000/index.html in a desktop browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=akmaludien&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
