// ── JOURNEY GLOBE (Stage 2c — click-to-drill, 4 levels) ───────────────────────
// Full-screen, scroll-locked 3D globe for Main Quest's "Journey Mode".
// Built on globe.gl (Three.js). Loaded via next/dynamic (ssr:false) from index.js.
//
// Navigation (click to drill down, scroll to back out one level):
//   LEVEL "continent" — globe rotatable; continents highlight on hover (no
//                       internal country borders shown); click a continent.
//   LEVEL "country"   — locked on the continent; its countries highlight on
//                       hover; click a country.
//   LEVEL "state"     — locked on the country; US/Canada states are drawn as
//                       clickable outlines that highlight on hover; click a state.
//   LEVEL "local"     — locked on the state; company dots appear and are
//                       clickable.
// Scrolling out steps back one level, throttled so it can't be spammed past the
// smooth lerp transition.

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";

const COUNTRIES_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// Palette
const GOLD = "#c9a84c";
const GOLD_BRIGHT = "#f0d080";
const ORANGE = "#e8613a";
const DARK = "#080608";

// Camera framing per level (globe.gl altitude; smaller = closer).
const ALT_CONTINENT_SELECT = 1.7;
const ALT_CONTINENT_LOCK = 1.15;
const ALT_COUNTRY_LOCK = 0.62;
const ALT_STATE_LOCK = 0.3;
const LERP_MS = 900;
const SCROLL_COOLDOWN_MS = 1000;

const CONTINENTS = {
  "North America": { lat: 46, lng: -98 },
  "South America": { lat: -22, lng: -60 },
  "Europe": { lat: 52, lng: 15 },
  "Africa": { lat: 2, lng: 20 },
  "Asia": { lat: 35, lng: 90 },
  "Oceania": { lat: -25, lng: 135 },
};

// Map GeoJSON country NAME -> the country key used in our dot data.
const COUNTRY_TO_DOTKEY = {
  "United States of America": "United States",
  "Canada": "Canada",
};

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

// Centroid + bbox of a GeoJSON feature's largest ring (for camera centering).
function featureFrame(feat) {
  const g = feat.geometry;
  const polys = g.type === "MultiPolygon" ? g.coordinates : [g.coordinates];
  let bigRing = null, bigLen = 0;
  for (const poly of polys) {
    const ring = poly[0];
    if (ring.length > bigLen) { bigLen = ring.length; bigRing = ring; }
  }
  let cLat = 0, cLng = 0;
  if (bigRing) {
    for (const [lng, lat] of bigRing) { cLng += lng; cLat += lat; }
    cLat /= bigRing.length; cLng /= bigRing.length;
  }
  return { lat: cLat, lng: cLng };
}

// Convert our US_STATES_GEO ({postal:{name,rings,c}}) into GeoJSON features that
// globe.gl can render, tagged so we can identify them on hover/click.
function statesToFeatures(statesGeo) {
  if (!statesGeo) return [];
  const feats = [];
  for (const [postal, st] of Object.entries(statesGeo)) {
    feats.push({
      type: "Feature",
      properties: { __state: true, postal, NAME: st.name, c: st.c },
      geometry: {
        type: "Polygon",
        coordinates: [st.rings[0]],
      },
    });
  }
  return feats;
}

export default function JourneyGlobe({ user, dots = [], statesGeo = null, onExit }) {
  const mountRef = useRef(null);
  const globeRef = useRef(null);
  const dotsRef = useRef(dots);
  const countryFeatsRef = useRef([]);    // country polygons
  const stateFeatsRef = useRef([]);      // US/Canada state polygons (all)
  const navRef = useRef({ level: "continent", continent: null, country: null, state: null });
  const hoverRef = useRef(null);
  const lastScrollRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [nav, setNav] = useState({ level: "continent", continent: null, country: null, state: null });
  const [selectedCompany, setSelectedCompany] = useState(null);

  dotsRef.current = dots;
  stateFeatsRef.current = stateFeatsRef.current.length
    ? stateFeatsRef.current
    : statesToFeatures(statesGeo);

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
      globe = Globe({
        rendererConfig: { antialias: true, alpha: true },
        animateIn: false,
      })(mountRef.current);
      globeRef.current = globe;

      globe
        .backgroundColor("rgba(0,0,0,0)")
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor(GOLD)
        .atmosphereAltitude(0.18)
        .width(mountRef.current.clientWidth)
        .height(mountRef.current.clientHeight);

      // Sharper rendering to reduce limb shimmer on outlines.
      try {
        const renderer = globe.renderer && globe.renderer();
        if (renderer) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      } catch (e) {}

      const mat = globe.globeMaterial();
      if (mat) {
        mat.color && mat.color.set("#140d09");
        mat.emissive && mat.emissive.set("#1a1008");
        mat.emissiveIntensity = 0.35;
        mat.shininess = 6;
      }

      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.screenSpacePanning = false;
        controls.minDistance = 101 * (1 + ALT_STATE_LOCK);
        controls.maxDistance = 101 * (1 + ALT_CONTINENT_SELECT);
        controls.rotateSpeed = 0.8;
        if (controls.mouseButtons) {
          controls.mouseButtons.LEFT = 0;
          controls.mouseButtons.RIGHT = 0;
        }
        const stopSpin = () => { controls.autoRotate = false; };
        controls.addEventListener("start", stopSpin);
      }

      const applyLevelControls = () => {
        const c = globe.controls();
        if (!c) return;
        const lvl = navRef.current.level;
        c.enableRotate = lvl === "continent";
        if (lvl !== "continent") c.autoRotate = false;
      };

      const flyTo = (lat, lng, altitude) => {
        globe.pointOfView({ lat, lng, altitude }, LERP_MS);
      };

      globe.pointOfView({ lat: 30, lng: -60, altitude: ALT_CONTINENT_SELECT }, 0);

      const inActiveContinent = (d) =>
        navRef.current.continent &&
        d.properties.CONTINENT === navRef.current.continent;
      const isHovered = (d) => hoverRef.current && d === hoverRef.current;
      const isStateFeat = (d) => d && d.properties && d.properties.__state;

      // Which polygons are active for the current level (countries vs states).
      const polygonsForLevel = () => {
        const lvl = navRef.current.level;
        if (lvl === "state" || lvl === "local") {
          // Show the states of the locked country (US/Canada) for clicking.
          const dotKey = COUNTRY_TO_DOTKEY[navRef.current.country];
          if (dotKey === "United States") return stateFeatsRef.current;
          // (Canada states not in our polygon set yet — fall back to countries.)
          return countryFeatsRef.current;
        }
        return countryFeatsRef.current;
      };

      const capColor = (d) => {
        const lvl = navRef.current.level;
        if (lvl === "continent") {
          // Highlight the whole hovered continent; no internal borders implied.
          if (hoverRef.current &&
              d.properties.CONTINENT === hoverRef.current.properties.CONTINENT)
            return "rgba(240,208,128,0.28)";
          return "rgba(201,168,76,0.07)";
        }
        if (lvl === "country") {
          if (!inActiveContinent(d)) return "rgba(201,168,76,0.03)";
          if (isHovered(d)) return "rgba(240,208,128,0.30)";
          return "rgba(201,168,76,0.10)";
        }
        // state / local levels — working with state polygons
        if (isStateFeat(d)) {
          if (navRef.current.state && d.properties.postal === navRef.current.state)
            return "rgba(201,168,76,0.02)"; // locked state: outline only
          if (isHovered(d)) return "rgba(240,208,128,0.30)";
          return "rgba(201,168,76,0.08)";
        }
        return "rgba(201,168,76,0.02)";
      };

      const strokeColor = (d) => {
        const lvl = navRef.current.level;
        if (lvl === "continent") {
          // Hide internal country borders at continent level: only the hovered
          // continent's outline brightens; everything else is barely visible.
          if (hoverRef.current &&
              d.properties.CONTINENT === hoverRef.current.properties.CONTINENT)
            return "rgba(255,225,166,0.9)";
          return "rgba(214,182,99,0.12)";
        }
        if (lvl === "country") {
          if (!inActiveContinent(d)) return "rgba(214,182,99,0.15)";
          if (isHovered(d)) return "rgba(255,225,166,0.95)";
          return "rgba(214,182,99,0.55)";
        }
        // state / local
        if (isStateFeat(d)) {
          if (navRef.current.state && d.properties.postal === navRef.current.state)
            return "rgba(255,225,166,0.95)";
          if (isHovered(d)) return "rgba(255,225,166,0.95)";
          return "rgba(214,182,99,0.5)";
        }
        return "rgba(214,182,99,0.2)";
      };

      // Keep polygons flat against the surface (prevents edge-on limb shimmer).
      const polyAlt = () => 0.004;

      const repaint = () => {
        const g = globeRef.current;
        if (!g) return;
        g.polygonsData(polygonsForLevel())
          .polygonCapColor(capColor)
          .polygonStrokeColor(strokeColor)
          .polygonSideColor(strokeColor)
          .polygonAltitude(polyAlt);
      };

      // ── Company dots ──────────────────────────────────────────────────────
      // Shown only at the "local" level, for the locked state.
      const visibleDots = () => {
        if (navRef.current.level !== "local") return [];
        const postal = navRef.current.state;
        if (!postal || !statesGeo || !statesGeo[postal]) return [];
        const stateName = statesGeo[postal].name;
        return dotsRef.current.filter((dt) => dt.state === stateName);
      };

      const refreshDots = () => {
        const g = globeRef.current;
        if (!g) return;
        g.pointsData(visibleDots())
          .pointLat((d) => d.lat)
          .pointLng((d) => d.lng)
          .pointAltitude(0.008)
          .pointRadius((d) => (d.applied ? 0.5 : 0.42))
          .pointColor((d) =>
            d.applied ? "rgba(126,207,179,0.95)" : "rgba(255,207,122,0.97)"
          )
          .pointResolution(8)
          .pointLabel(
            (d) =>
              `<div style="font-family:'Cinzel',serif;color:${GOLD_BRIGHT};background:rgba(12,9,6,.92);border:1px solid rgba(201,168,76,.45);padding:5px 11px;border-radius:7px;font-size:12px;white-space:nowrap"><strong>${
                d.name
              }</strong>${
                d.jobCount
                  ? `<span style="color:rgba(244,237,216,.6);font-size:10px"> · ${d.jobCount} open</span>`
                  : ""
              }</div>`
          )
          .onPointClick((d) => {
            if (d && d.name) {
              // Stage 3 will open a side panel here; for now, surface the name.
              setSelectedCompany(d);
            }
          });
      };

      // ── Drill-down click handler ──────────────────────────────────────────
      const handlePolyClick = (d) => {
        if (!d) return;
        const lvl = navRef.current.level;
        if (lvl === "continent") {
          const cont = d.properties.CONTINENT;
          if (!cont || !CONTINENTS[cont]) return;
          const c = CONTINENTS[cont];
          setNavBoth({ level: "country", continent: cont, country: null, state: null });
          flyTo(c.lat, c.lng, ALT_CONTINENT_LOCK);
        } else if (lvl === "country") {
          if (d.properties.CONTINENT !== navRef.current.continent) return;
          const frame = featureFrame(d);
          setNavBoth({
            level: "state",
            continent: navRef.current.continent,
            country: d.properties.NAME,
            state: null,
          });
          flyTo(frame.lat, frame.lng, ALT_COUNTRY_LOCK);
        } else if (lvl === "state") {
          if (!isStateFeat(d)) return;
          const st = statesGeo && statesGeo[d.properties.postal];
          const center = st ? st.c : featureFrame(d);
          const lat = Array.isArray(center) ? center[1] : center.lat;
          const lng = Array.isArray(center) ? center[0] : center.lng;
          setNavBoth({
            level: "local",
            continent: navRef.current.continent,
            country: navRef.current.country,
            state: d.properties.postal,
          });
          flyTo(lat, lng, ALT_STATE_LOCK);
        }
        setTimeout(() => {
          applyLevelControls();
          repaint();
          refreshDots();
        }, LERP_MS + 40);
        repaint();
      };

      // ── Scroll-out: back up one level (throttled) ─────────────────────────
      onWheel = (e) => {
        e.preventDefault();
        if (e.deltaY <= 0) return;
        const now = Date.now();
        if (now - lastScrollRef.current < SCROLL_COOLDOWN_MS) return;
        const n = navRef.current;
        if (n.level === "local") {
          lastScrollRef.current = now;
          const frame = (() => {
            const f = countryFeatsRef.current.find((c) => c.properties.NAME === n.country);
            return f ? featureFrame(f) : { lat: 38, lng: -97 };
          })();
          globe.pointsData([]);
          setSelectedCompany(null);
          setNavBoth({ level: "state", continent: n.continent, country: n.country, state: null });
          flyTo(frame.lat, frame.lng, ALT_COUNTRY_LOCK);
          setTimeout(() => { applyLevelControls(); repaint(); }, LERP_MS + 40);
          repaint();
        } else if (n.level === "state") {
          lastScrollRef.current = now;
          const c = CONTINENTS[n.continent] || { lat: 30, lng: -60 };
          setNavBoth({ level: "country", continent: n.continent, country: null, state: null });
          flyTo(c.lat, c.lng, ALT_CONTINENT_LOCK);
          setTimeout(() => { applyLevelControls(); repaint(); }, LERP_MS + 40);
          repaint();
        } else if (n.level === "country") {
          lastScrollRef.current = now;
          const outLng = n.continent && CONTINENTS[n.continent] ? CONTINENTS[n.continent].lng : -60;
          setNavBoth({ level: "continent", continent: null, country: null, state: null });
          flyTo(30, outLng, ALT_CONTINENT_SELECT);
          setTimeout(() => { applyLevelControls(); repaint(); }, LERP_MS + 40);
          repaint();
        }
      };
      mountRef.current.addEventListener("wheel", onWheel, { passive: false });

      // ── Load country polygons ─────────────────────────────────────────────
      fetch(COUNTRIES_URL)
        .then((r) => r.json())
        .then((geo) => {
          if (disposed) return;
          const feats = (geo.features || []).filter(
            (d) => d.properties && d.properties.NAME !== "Antarctica"
          );
          countryFeatsRef.current = feats;
          globe
            .polygonsData(feats)
            .polygonAltitude(polyAlt)
            .polygonCapColor(capColor)
            .polygonSideColor(strokeColor)
            .polygonStrokeColor(strokeColor)
            .onPolygonHover((d) => {
              hoverRef.current = d || null;
              repaint();
              if (mountRef.current)
                mountRef.current.style.cursor = d ? "pointer" : "grab";
            })
            .onPolygonClick((d) => handlePolyClick(d))
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

  // Keep dots synced if prop changes while at local level.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || navRef.current.level !== "local") return;
    const postal = navRef.current.state;
    if (!postal || !statesGeo || !statesGeo[postal]) return;
    const stateName = statesGeo[postal].name;
    globe.pointsData(dots.filter((dt) => dt.state === stateName));
  }, [dots, statesGeo]);

  const crumb =
    nav.level === "continent"
      ? "Choose a continent"
      : nav.level === "country"
      ? `${nav.continent} — choose a country`
      : nav.level === "state"
      ? `${nav.country} — choose a state`
      : statesGeo && statesGeo[nav.state]
      ? statesGeo[nav.state].name
      : "Explore";

  const hint =
    nav.level === "continent"
      ? "Drag to rotate · click a continent to travel there"
      : nav.level === "country"
      ? "Click a country to explore it · scroll out to go back"
      : nav.level === "state"
      ? "Click a state to zoom in · scroll out to go back"
      : "Click a marker to view the studio · scroll out to go back";

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

      {/* Temporary selected-company readout (Stage 3 will replace with a panel) */}
      {selectedCompany && (
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 100,
            width: 280,
            background: "rgba(12,9,6,.95)",
            border: "1px solid rgba(201,168,76,.4)",
            borderRadius: 12,
            padding: 16,
            color: "#f4edd8",
          }}
        >
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: GOLD_BRIGHT }}>
            {selectedCompany.name}
          </div>
          <div style={{ fontSize: 11, color: "rgba(244,237,216,.6)", marginTop: 4 }}>
            {selectedCompany.jobCount} open {selectedCompany.jobCount === 1 ? "role" : "roles"} · {selectedCompany.state}
          </div>
          <button
            onClick={() => setSelectedCompany(null)}
            style={{
              marginTop: 12,
              background: "rgba(201,168,76,.1)",
              border: "1px solid rgba(201,168,76,.3)",
              color: GOLD_BRIGHT,
              cursor: "pointer",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 11,
              fontFamily: "'Cinzel',serif",
            }}
          >
            Close
          </button>
        </div>
      )}

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