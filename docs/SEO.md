# Burno SEO to-do

_Written 2026-10-07. Goal: burno.app comes up first when someone searches "burno"._

For a brand-name search, Google mostly ranks the site that other places link to under that name. So this list has two parts: tell Google the site exists and what it is, then get the name "Burno" mentioned across the web.

State of the live site on 2026-10-07:

- Already done: link-preview image, PNG favicon, and title starting with "Burno"
- Missing: `robots.txt`, `sitemap.xml`, canonical link, structured data, and readable text in the HTML

---

## 1. Register with search engines (today, about 10 minutes, you do this)

- [ ] Go to [Google Search Console](https://search.google.com/search-console) and add `burno.app` as a **Domain** property
- [ ] Verify it by adding the TXT record at the domain registrar
- [ ] Use URL Inspection on `https://burno.app/` and click **Request indexing**. A new domain can otherwise wait weeks before Google finds it.
- [ ] Set up [Bing Webmaster Tools](https://www.bing.com/webmasters) by importing from Search Console. Bing also supplies results to DuckDuckGo and several AI search tools.

## 2. Code fixes (one PR)

- [ ] Add `public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://burno.app/sitemap.xml
  ```
- [ ] Add `public/sitemap.xml` listing `https://burno.app/`
- [ ] Submit the sitemap in Search Console under Sitemaps
- [ ] Add `<link rel="canonical" href="https://burno.app/" />` to `index.html`
- [ ] Add structured data (JSON-LD) to `index.html`: a `WebApplication` with `name: "Burno"`, `url`, `logo`, `applicationCategory: "HealthApplication"`, `offers` set to free, and `sameAs` links to the social profiles once they exist
- [ ] Put real text in the HTML. The page Google first downloads is an empty `<div id="root">`, so add a visible `<h1>Burno</h1>` and a sentence like "Burno is a free deck-of-cards workout…" directly in `index.html`. Google can then read it without running JavaScript.
- [ ] (Optional) Change the title to `Burno: Deck of Cards Workout App` so it also matches what people search for beyond the name

## 3. Use the name "Burno" consistently across the web (ongoing, matters most)

- [ ] Claim **Burno** or **@burnoapp** on Instagram, TikTok, X and YouTube, each linking to burno.app
- [ ] Set the GitHub repo's website field to `https://burno.app`
- [ ] (Optional) Rename the repo `52-card-workout` to `burno`
- [ ] Make sure the Buy Me a Coffee page says "Burno" and links to burno.app
- [ ] Make sure every Reddit post, Product Hunt listing and creator mention says "Burno" and links to burno.app (see [MARKETING.md](MARKETING.md))
- [ ] Once the profiles exist, add their URLs to `sameAs` in the structured data

## 4. Check progress

- [ ] About 1 week after indexing: search `site:burno.app`. It should return the homepage.
- [ ] About 2 weeks: search "burno app" and "burno workout". Burno should be at or near the top.
- [ ] Monthly: look at Search Console's Performance report for the queries people use and how often they click.

## What to expect

"Burno" is very close to "Bruno" and "burnout", so for a while Google may correct a search for "burno" into "bruno". Searches for "burno app" or "burno workout" will probably rank first within a week or two of indexing. The plain "burno" search will come as links and mentions of the name build up (section 3).
