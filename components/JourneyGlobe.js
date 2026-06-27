// ── JOURNEY GLOBE (Stage 2b — click-to-drill navigation) ──────────────────────
// A full-screen, scroll-locked 3D globe for Main Quest's gamified "Journey Mode".
// Built on globe.gl (Three.js). Loaded via next/dynamic (ssr:false) from index.js.
//
// Navigation model (click to drill down, scroll to back out):
//   LEVEL 0  "continent"  — globe rotatable; continents highlight on hover;
//                           click a continent to lock onto it.
//   LEVEL 1  "country"    — camera locked/centered on the continent; its
//                           countries highlight on hover; click one to lock on it.
//   LEVEL 2  "state"      — camera locked/centered on the country; company dots
//                           appear; hover a dot for the studio name.
// Scrolling out steps back exactly one level, with a cooldown so it can't be
// spammed past the smooth camera transition. All camera moves are smooth lerps.

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";

const COUNTRIES_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// Palette
const GOLD = "#c9a84c";
const GOLD_BRIGHT = "#f0d080";
const ORANGE = "#e8613a";
const DARK = "#080608";

// Camera framing per level. altitude is globe.gl's camera altitude (smaller =
// closer). These are tuned so each layer frames the whole region.
const ALT_CONTINENT_SELECT = 1.7; // furthest the user can get (no full world view)
const ALT_CONTINENT_LOCK = 1.15;  // centered on a continent
const ALT_COUNTRY_LOCK = 0.62;    // centered on a country
const LERP_MS = 900;              // camera transition duration
const SCROLL_COOLDOWN_MS = 1000;  // min time between scroll-out steps

// Continent framing centers (where the camera points when locked on a continent).
const CONTINENTS = {
  "North America": { lat: 46, lng: -98 },
  "South America": { lat: -22, lng: -60 },
  "Europe": { lat: 52, lng: 15 },
  "Africa": { lat: 2, lng: 20 },
  "Asia": { lat: 35, lng: 90 },
  "Oceania": { lat: -25, lng: 135 },
};

// Ray-casting point-in-polygon for a single ring ([[lng,lat],...]).
function pointInPolygon(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) &&
        (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Bounding box + centroid of a GeoJSON feature (for click-to-center framing).
function featureFrame(feat) {
  const g = feat.geometry;
  const polys = g.type === "MultiPolygon" ? g.coordinates : [g.coordinates];
  let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
  // Use the largest ring for centering (avoids far-flung islands skewing it).
  let bigRing = null, bigLen = 0;
  for (const poly of polys) {
    const ring = poly[0];
    if (ring.length > bigLen) { bigLen = ring.length; bigRing = ring; }
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  let cLat = 0, cLng = 0;
  if (bigRing) {
    for (const [lng, lat] of bigRing) { cLng += lng; cLat += lat; }
    cLat /= bigRing.length; cLng /= bigRing.length;
  }
  return { lat: cLat, lng: cLng, minLat, maxLat, minLng, maxLng };
}

export default function JourneyGlobe({ user, dots = [], onExit }) {
  const mountRef = useRef(null);
  const globeRef = useRef(null);
  const dotsRef = useRef(dots);
  const featsRef = useRef([]);          // loaded country polygons
  // Navigation state (kept in a ref so globe callbacks read the latest value).
  const navRef = useRef({ level: "continent", continent: null, country: null });
  const hoverRef = useRef(null);        // currently hovered polygon (for highlight)
  const lastScrollRef = useRef(0);      // timestamp of last scroll-out step
  const animRef = useRef(null);         // active camera animation handle

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [nav, setNav] = useState({ level: "continent", continent: null, country: null });

  dotsRef.current = dots;

  // Push a nav change to both the ref (for callbacks) and state (for UI).
  const setNavBoth = (next) => {
    navRef.current = next;
    setNav(next);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    let globe;
    let disposed = false;
    let onResize, onWheel;

    try {
      globe = Globe()(mountRef.current);
      globeRef.current = globe;

      globe
        .backgroundColor("rgba(0,0,0,0)")
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor(GOLD)
        .atmosphereAltitude(0.18)
        .width(mountRef.current.clientWidth)
        .height(mountRef.current.clientHeight);

      // Sharpen rendering: cap pixel ratio and enable antialiasing on the WebGL
      // renderer to reduce the shimmer/fuzz on polygon outlines near the limb.
      try {
        const renderer = globe.renderer && globe.renderer();
        if (renderer) {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }
      } catch (e) {}

      const mat = globe.globeMaterial();
      if (mat) {
        mat.color && mat.color.set("#140d09");
        mat.emissive && mat.emissive.set("#1a1008");
        mat.emissiveIntensity = 0.35;
        mat.shininess = 6;
      }

      // ── Controls ──────────────────────────────────────────────────────────
      // Free zoom is OFF (we drive the camera via clicks). Rotation is only
      // enabled at the continent-select level (toggled in applyLevelControls).
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = false;   // no free zoom — clicks drive the camera
        controls.enablePan = false;
        controls.screenSpacePanning = false;
        controls.minDistance = 101 * (1 + ALT_COUNTRY_LOCK);
        controls.maxDistance = 101 * (1 + ALT_CONTINENT_SELECT);
        controls.rotateSpeed = 0.8;
        if (controls.mouseButtons) {
          controls.mouseButtons.LEFT = 0;   // ROTATE
          controls.mouseButtons.RIGHT = 0;  // ROTATE
        }
        const stopSpin = () => { controls.autoRotate = false; };
        controls.addEventListener("start", stopSpin);
      }

      const applyLevelControls = () => {
        const c = globe.controls();
        if (!c) return;
        // Rotation only at the continent-select level.
        const lvl = navRef.current.level;
        c.enableRotate = lvl === "continent";
        if (lvl !== "continent") c.autoRotate = false;
      };

      // Smooth camera move to a lat/lng/altitude.
      const flyTo = (lat, lng, altitude) => {
        globe.pointOfView({ lat, lng, altitude }, LERP_MS);
      };

      // Start framed on North America at the continent-select level.
      globe.pointOfView({ lat: 30, lng: -60, altitude: ALT_CONTINENT_SELECT }, 0);

      // ── Polygon styling (highlight current level's hoverable regions) ──────
      // At continent level: the hovered continent's countries glow.
      // At country level: the hovered country glows; the locked continent's
      //   other countries are dimly outlined.
      // At state level: the locked country is outlined, dots are shown.
      const inActiveContinent = (d) =>
        navRef.current.continent &&
        d.properties.CONTINENT === navRef.current.continent;

      const isHovered = (d) => hoverRef.current && d === hoverRef.current;

      const capColor = (d) => {
        const lvl = navRef.current.level;
        if (lvl === "continent") {
          // Highlight the whole continent under the cursor.
          if (hoverRef.current &&
              d.properties.CONTINENT === hoverRef.current.properties.CONTINENT)
            return "rgba(240,208,128,0.30)";
          return "rgba(201,168,76,0.08)";
        }
        if (lvl === "country") {
          if (!inActiveContinent(d)) return "rgba(201,168,76,0.04)";
          if (isHovered(d)) return "rgba(240,208,128,0.32)";
          return "rgba(201,168,76,0.12)";
        }
        // state level — outline only on the locked country (no fill sheet over
        // the dots); neighbors stay very dim.
        if (d.properties.NAME === navRef.current.country)
          return "rgba(201,168,76,0.02)";
        return inActiveContinent(d)
          ? "rgba(201,168,76,0.05)"
          : "rgba(201,168,76,0.02)";
      };

      const strokeColor = (d) => {
        const lvl = navRef.current.level;
        if (lvl === "continent") {
          if (hoverRef.current &&
              d.properties.CONTINENT === hoverRef.current.properties.CONTINENT)
            return "rgba(255,225,166,0.95)";
          return "rgba(214,182,99,0.4)";
        }
        if (lvl === "country") {
          if (!inActiveContinent(d)) return "rgba(214,182,99,0.2)";
          if (isHovered(d)) return "rgba(255,225,166,0.95)";
          return "rgba(214,182,99,0.6)";
        }
        if (d.properties.NAME === navRef.current.country)
          return "rgba(255,225,166,0.9)";
        return "rgba(214,182,99,0.3)";
      };

      const repaint = () => {
        const g = globeRef.current;
        if (!g) return;
        g.polygonCapColor(capColor)
          .polygonStrokeColor(strokeColor)
          .polygonSideColor(strokeColor)
          .polygonAltitude((d) => {
            // Keep polygons low to the surface to avoid edge-on shimmer near the
            // globe's limb. Only the hovered region lifts slightly (and only when
            // we're picking regions, not at state level).
            const lvl = navRef.current.level;
            if (lvl !== "state" && isHovered(d)) return 0.01;
            return 0.006;
          });
      };

      // ── Load polygons ─────────────────────────────────────────────────────
      fetch(COUNTRIES_URL)
        .then((r) => r.json())
        .then((geo) => {
          if (disposed) return;
          const feats = (geo.features || []).filter(
            (d) => d.properties && d.properties.NAME !== "Antarctica"
          );
          featsRef.current = feats;
          globe
            .polygonsData(feats)
            .polygonAltitude(0.006)
            .polygonCapColor(capColor)
            .polygonSideColor(strokeColor)
            .polygonStrokeColor(strokeColor)
            .onPolygonHover((d) => {
              hoverRef.current = d || null;
              repaint();
              if (mountRef.current)
                mountRef.current.style.cursor = d ? "pointer" : "grab";
            })
            .onPolygonClick((d) => {
              if (!d) return;
              handleRegionClick(d);
            })
            .polygonLabel((d) => {
              const lvl = navRef.current.level;
              const txt =
                lvl === "continent" ? d.properties.CONTINENT : d.properties.NAME;
              return `<div style="font-family:'Cinzel',serif;color:${GOLD_BRIGHT};background:rgba(12,9,6,.92);border:1px solid rgba(201,168,76,.45);padding:4px 11px;border-radius:7px;font-size:12px;white-space:nowrap">${
                txt || ""
              }</div>`;
            });

          applyLevelControls();
          setLoading(false);
        })
        .catch(() => {
          if (disposed) return;
          setErr("Could not load map data. Check your connection and try again.");
          setLoading(false);
        });

      // ── Company dots ──────────────────────────────────────────────────────
      // Only shown at the state level, and only for the locked country.
      const visibleDots = () => {
        if (navRef.current.level !== "state") return [];
        // dots are US/Canada only; match by country name.
        const country = navRef.current.country;
        const wantUS = country === "United States of America";
        const wantCA = country === "Canada";
        return dotsRef.current.filter((dt) => {
          if (wantUS) return dt.country === "United States";
          if (wantCA) return dt.country === "Canada";
          return false; // other countries have no dots yet
        });
      };

      const refreshDots = () => {
        const g = globeRef.current;
        if (!g) return;
        g.pointsData(visibleDots())
          .pointLat((d) => d.lat)
          .pointLng((d) => d.lng)
          .pointAltitude(0.02)
          .pointRadius((d) => (d.applied ? 0.32 : 0.26))
          .pointColor((d) =>
            d.applied ? "rgba(126,207,179,0.95)" : "rgba(255,207,122,0.95)"
          )
          .pointResolution(6)
          .pointLabel(
            (d) =>
              `<div style="font-family:'Cinzel',serif;color:${GOLD_BRIGHT};background:rgba(12,9,6,.92);border:1px solid rgba(201,168,76,.45);padding:5px 11px;border-radius:7px;font-size:12px;white-space:nowrap"><strong>${
                d.name
              }</strong>${
                d.jobCount
                  ? `<span style="color:rgba(244,237,216,.6);font-size:10px"> · ${d.jobCount} open</span>`
                  : ""
              }</div>`
          );
      };

      // ── Drill-down click handler ──────────────────────────────────────────
      const handleRegionClick = (d) => {
        const lvl = navRef.current.level;
        if (lvl === "continent") {
          const cont = d.properties.CONTINENT;
          if (!cont || !CONTINENTS[cont]) return;
          const c = CONTINENTS[cont];
          setNavBoth({ level: "country", continent: cont, country: null });
          flyTo(c.lat, c.lng, ALT_CONTINENT_LOCK);
        } else if (lvl === "country") {
          if (d.properties.CONTINENT !== navRef.current.continent) return;
          const frame = featureFrame(d);
          setNavBoth({
            level: "state",
            continent: navRef.current.continent,
            country: d.properties.NAME,
          });
          flyTo(frame.lat, frame.lng, ALT_COUNTRY_LOCK);
        }
        // After the camera settles, re-apply controls/dots/paint.
        setTimeout(() => {
          applyLevelControls();
          refreshDots();
          repaint();
        }, LERP_MS + 40);
        repaint();
      };

      // ── Scroll-out: step back one level (throttled) ───────────────────────
      onWheel = (e) => {
        e.preventDefault();
        if (e.deltaY <= 0) return; // only "scroll out" (down/away) backs up
        const now = Date.now();
        if (now - lastScrollRef.current < SCROLL_COOLDOWN_MS) return;
        const lvl = navRef.current.level;
        if (lvl === "state") {
          lastScrollRef.current = now;
          const cont = navRef.current.continent;
          const c = CONTINENTS[cont] || { lat: 30, lng: -60 };
          setNavBoth({ level: "country", continent: cont, country: null });
          flyTo(c.lat, c.lng, ALT_CONTINENT_LOCK);
          globe.pointsData([]);
          setTimeout(() => { applyLevelControls(); repaint(); }, LERP_MS + 40);
          repaint();
        } else if (lvl === "country") {
          lastScrollRef.current = now;
          // Capture the continent's longitude BEFORE clearing nav, so the
          // camera eases out roughly above where the user was.
          const prevCont = navRef.current.continent;
          const outLng = prevCont && CONTINENTS[prevCont] ? CONTINENTS[prevCont].lng : -60;
          setNavBoth({ level: "continent", continent: null, country: null });
          flyTo(30, outLng, ALT_CONTINENT_SELECT);
          setTimeout(() => { applyLevelControls(); repaint(); }, LERP_MS + 40);
          repaint();
        }
        // at continent level, scrolling does nothing (already the top).
      };
      mountRef.current.addEventListener("wheel", onWheel, { passive: false });

      onResize = () => {
        if (!mountRef.current || !globeRef.current) return;
        globeRef.current
          .width(mountRef.current.clientWidth)
          .height(mountRef.current.clientHeight);
      };
      window.addEventListener("resize", onResize);
    } catch (e) {
      setErr("3D globe failed to initialize on this device.");
      setLoading(false);
    }

    return () => {
      disposed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      if (onWheel && mountRef.current)
        mountRef.current.removeEventListener("wheel", onWheel);
      try {
        if (globeRef.current && globeRef.current._destructor) {
          globeRef.current._destructor();
        }
      } catch (e) {}
      if (mountRef.current) mountRef.current.innerHTML = "";
      globeRef.current = null;
    };
  }, []);

  // Keep dots in sync if the prop changes (only matters at state level).
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (navRef.current.level === "state") {
      // trigger a points refresh by re-setting data via the same filter
      const country = navRef.current.country;
      const wantUS = country === "United States of America";
      const wantCA = country === "Canada";
      globe.pointsData(
        dots.filter((dt) =>
          wantUS ? dt.country === "United States" : wantCA ? dt.country === "Canada" : false
        )
      );
    }
  }, [dots]);

  // Breadcrumb label for the top bar.
  const crumb =
    nav.level === "continent"
      ? "Choose a continent"
      : nav.level === "country"
      ? `${nav.continent} — choose a country`
      : `${nav.country}`;

  const hint =
    nav.level === "continent"
      ? "Drag to rotate · click a highlighted continent to travel there"
      : nav.level === "country"
      ? "Click a country to explore it · scroll out to go back"
      : "Hover a marker to see the studio · scroll out to go back";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 35%, #160e0a 0%, ${DARK} 70%)`,
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <div
            style={{
              fontFamily: "'Cinzel Decorative',serif",
              fontSize: 22,
              fontWeight: 700,
              background: `linear-gradient(135deg,${GOLD_BRIGHT},${ORANGE})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
            }}
          >
            Journey Mode
          </div>
          <div style={{ fontSize: 12, color: GOLD_BRIGHT, marginTop: 3, fontFamily: "'Cinzel',serif", letterSpacing: 0.4 }}>
            {crumb}
          </div>
          <div style={{ fontSize: 11, color: "rgba(244,237,216,.5)", marginTop: 2 }}>
            {hint}
          </div>
        </div>
        <button
          onClick={onExit}
          style={{
            pointerEvents: "auto",
            background: "rgba(201,168,76,.08)",
            border: "1px solid rgba(201,168,76,.3)",
            color: GOLD_BRIGHT,
            cursor: "pointer",
            borderRadius: 10,
            padding: "9px 16px",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Cinzel',serif",
            letterSpacing: 0.5,
          }}
        >
          ← Back to Job Board
        </button>
      </div>

      {loading && !err && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: GOLD,
            fontFamily: "'Cinzel',serif",
            fontSize: 14,
            letterSpacing: 1,
            pointerEvents: "none",
          }}
        >
          Charting the realm…
        </div>
      )}
      {err && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "rgba(244,237,216,.7)",
            fontSize: 13,
            padding: 24,
            textAlign: "center",
          }}
        >
          {err}
          <button
            onClick={onExit}
            style={{
              background: `linear-gradient(135deg,${GOLD},${ORANGE})`,
              border: "none",
              color: DARK,
              cursor: "pointer",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 12,
              fontWeight: 800,
              fontFamily: "'Cinzel',serif",
            }}
          >
            ← Back to Job Board
          </button>
        </div>
      )}
    </div>
  );
}