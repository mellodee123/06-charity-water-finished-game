# Water Works

A small, browser-based pipe puzzle inspired by charity: water's mission to bring clean water to everyone. Built with plain HTML, CSS, and JavaScript; no build step or game library is required.

## Play

Rotate pipes across the 5×5 board, then choose **Release Water** or press **Space** to test the route. Level 1 now has a longer winding route. After completing a level, choose **Next Level** or press **N**; the button stays in the sticky toolbar. Background music starts with the first gameplay interaction and pauses when a level is won; use the **Music** toggle in the header to mute or resume it. Wins play a victory jingle followed by flowing water. Collect three cans on each level for 50 liters apiece. The game starts with 300 liters; completing a level adds 300 liters, while polluted water costs 100 liters. On Levels 2 and 3, pollution moves near the last pipe you turned after 2 seconds, then patrols every 5 seconds. Use **Reset** to restart from level one and restore the starting water score. Complete all three levels before the timer runs out.
The **Best** time is tracked separately for each level and saved in the current browser. A faster completion opens a record notification showing the new time and the previous best.

To preview locally, open `index.html` in a browser or run a static server from the project folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and `/ (root)` folder, then save. GitHub Pages will publish `index.html` and its relative assets from the repository root. The first deployment can take a few minutes to appear.
