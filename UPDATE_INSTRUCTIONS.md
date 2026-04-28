# Landing page update — TikTok traffic conversion

Convert the placeholder `index.html` into a single-page App Store funnel for TikTok bio-link traffic.

## App info

- App Store URL: https://apps.apple.com/us/app/finiti-days-left/id6761764736
- App Store ID: `6761764736`
- App name: `Finiti - Days Left`
- iOS only

## Required changes (in order)

### 1. Smart App Banner (in `<head>`)

```html
<meta name="apple-itunes-app" content="app-id=6761764736">
```

This makes mobile Safari show a one-tap App Store banner above the page. Single biggest conversion lever.

### 2. Hero section (replace the existing intro card)

Above the fold, mobile-first:

- **Headline:** `Your lock screen, counting down.`
- **Subheadline:** `Every dot is a day. Track anything with an end.`
- **Primary CTA:** Apple's official "Download on the App Store" badge (black variant), min 200px wide on mobile, linking to:
  ```
  https://apps.apple.com/us/app/finiti-days-left/id6761764736?utm_source=tiktok&utm_medium=organic&utm_campaign=studytok
  ```
- Phone mockup of the lock screen wallpaper next to/under the CTA (use `assets/screenshots/01-lock-screen.png` once saved)

### 3. App Store screenshot gallery (below hero)

Save the 5 App Store screenshots locally to `assets/screenshots/` (user has them — they're the same images visible on the App Store listing). Order them:

1. `01-lock-screen.png` — "Your lock screen, counting down."
2. `02-every-dot.png` — "Every dot is a day of your life."
3. `03-track-anything.png` — "Track a launch, a trip, a year — anything with an end."
4. `04-themes.png` — "12 themes. Pick your mood."
5. `05-mockup.png` — second iPhone mockup

Render as a horizontal-scroll gallery on mobile (1.5-screenshot peek so the scroll is discoverable). Three-up grid on desktop.

### 4. Three-feature row (below gallery)

Three short feature cards, no images:

- **Visualize any goal.** A daily dot grid for graduation, exams, summer, anything.
- **Updates daily.** Shortcuts automation refreshes the wallpaper every morning.
- **12 themes.** Pick the look that matches your mood.

### 5. Sticky bottom CTA (mobile only)

Fixed-position App Store badge at the bottom of the viewport on screens < 720px, hidden on desktop. Same UTM-tagged link as the hero CTA.

### 6. Tracking — PostHog Web SDK + Apple Campaign Links

Use the existing PostHog project (same one the iOS app uses). No Branch, no Plausible, no gtag.

**Add PostHog Web SDK** in `<head>` (drop in the host's posthog token):
```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('YOUR_POSTHOG_KEY', {
    api_host: 'https://eu.i.posthog.com',
    capture_pageview: true,
    person_profiles: 'identified_only'
  });
</script>
```

**Capture UTMs and forward to App Store badge `ct` token.** Add this script before `</body>`:

```html
<script>
  const params = new URLSearchParams(location.search);
  const term = params.get('utm_term') || 'unknown';
  const content = params.get('utm_content') || 'organic';
  const ctTag = `tiktok-${term}-${content}`;

  // Update every App Store badge link with the per-video Campaign Link
  document.querySelectorAll('a.app-store-badge').forEach(a => {
    a.href = `https://apps.apple.com/us/app/finiti-days-left/id6761764736?ct=${ctTag}&mt=8`;
    a.addEventListener('click', () => {
      posthog.capture('app_store_click', {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: content,
        utm_term: term,
        ct_tag: ctTag
      });
    });
  });
</script>
```

**Events to capture:**
- `$pageview` (auto-captured by PostHog with all UTMs)
- `app_store_click` (manually fired on badge tap, with UTM properties)

**Per-video bio link template** (mint manually, no per-video HTML edits needed):
```
https://[landing-domain]/?utm_source=tiktok&utm_medium=organic&utm_campaign=studytok&utm_content=v04-decisionday&utm_term=20260428
```

The `ct` token going to Apple is auto-built from `utm_term` + `utm_content`, so Apple App Analytics groups installs by the same identifier.

## Keep these (don't change)

- Existing nav: `Home / Terms / Privacy`
- Typography: `Iowan Old Style`, fall-throughs as already configured
- Color palette: `--bg #f6f4f0`, `--ink #1b1a17`, `--accent #FF781E`
- Card-based aesthetic with soft shadows
- `terms.html` and `privacy.html` (untouched)

## Don't add

- Sign-up forms (defer to in-app)
- Video autoplay (kills mobile perf and data)
- Cookie banner unless legally required
- Multiple bio links / Linktree-style routing
- Custom "Download" button (always use Apple's official badge — converts ~20% better)

## Acceptance checks

- iPhone width 375px: hero CTA visible without scrolling
- Tap on App Store badge → opens App Store directly (not in browser)
- Smart App Banner appears at top of mobile Safari on first visit
- All three CTAs (hero, sticky, any inline) link to the same UTM-tagged URL
- Page loads under 1.5s on 4G (no large images uncompressed, no autoplay video)
- `terms.html` and `privacy.html` still link correctly from header nav
