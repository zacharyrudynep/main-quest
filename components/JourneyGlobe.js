// ── JOURNEY GLOBE (Stage 1) ───────────────────────────────────────────────────
// A full-screen, scroll-locked 3D globe for Main Quest's gamified "Journey Mode".
// Built on globe.gl (Three.js). This file is loaded via next/dynamic with
// ssr:false from pages/index.js, so the Three.js code never runs during SSR.
//
// Stage 1 scope: the globe renders, fills the viewport, and supports
// rotate / pan / zoom. Country polygons are drawn in the Main Quest palette.
// Company pins, stepped zoom, fog, and the side panel come in later stages.

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";

// Public-domain Natural Earth country polygons (fetched at runtime, not bundled).
const COUNTRIES_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// Palette
const GOLD = "#c9a84c";
const GOLD_BRIGHT = "#f0d080";
const ORANGE = "#e8613a";
const DARK = "#080608";

export default function JourneyGlobe({ user, dots = [], onExit }) {
  const mountRef = useRef(null);
  const globeRef = useRef(null);
  const dotsRef = useRef(dots);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [zoomedIn, setZoomedIn] = useState(false);
  // Keep the latest dots available to the (one-time) globe effect without re-running it.
  dotsRef.current = dots;

  useEffect(() => {
    if (!mountRef.current) return;
    let globe;
    let disposed = false;
    let onResize;

    try {
      // Initialize the globe instance bound to our mount node.
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

      // Give the globe surface a dark, subtly warm material (no external texture).
      // globeMaterial() returns the THREE.MeshPhongMaterial we can tweak.
      const mat = globe.globeMaterial();
      if (mat) {
        mat.color && mat.color.set("#140d09");
        mat.emissive && mat.emissive.set("#1a1008");
        mat.emissiveIntensity = 0.35;
        mat.shininess = 6;
      }

      // Controls: right-click rotates, left-click pans (per the design).
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 140;
        controls.maxDistance = 480;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 0.9;
        // Both mouse buttons rotate the globe. We intentionally keep pan OFF:
        // OrbitControls' screen-space pan drifts the camera distance (which read
        // as an unwanted zoom-out while rotating). Stepped zoom is handled by
        // scroll; lat/lng framing comes later. LEFT and RIGHT both rotate so the
        // control feels natural with either button.
        if (controls.mouseButtons) {
          controls.mouseButtons.LEFT = 0;  // ROTATE
          controls.mouseButtons.RIGHT = 0; // ROTATE
        }
        controls.enablePan = false;
        controls.screenSpacePanning = false;
        // Stop auto-rotation as soon as the user interacts.
        const stopSpin = () => { controls.autoRotate = false; };
        controls.addEventListener("start", stopSpin);
      }

      // Initial camera position.
      globe.pointOfView({ lat: 30, lng: -40, altitude: 2.4 }, 0);

      // Load country polygons and style them in the Main Quest palette.
      fetch(COUNTRIES_URL)
        .then((r) => r.json())
        .then((geo) => {
          if (disposed) return;
          const feats = (geo.features || []).filter(
            (d) => d.properties && d.properties.NAME !== "Antarctica"
          );
          globe
            .polygonsData(feats)
            .polygonAltitude(0.008)
            .polygonCapColor(() => "rgba(201,168,76,0.10)")
            .polygonSideColor(() => "rgba(201,168,76,0.06)")
            .polygonStrokeColor(() => "rgba(214,182,99,0.55)")
            .polygonLabel(
              (d) =>
                `<div style="font-family:'Cinzel',serif;color:${GOLD_BRIGHT};background:rgba(12,9,6,.9);border:1px solid rgba(201,168,76,.4);padding:4px 10px;border-radius:6px;font-size:12px">${
                  d.properties.NAME || ""
                }</div>`
            );
          setLoading(false);
        })
        .catch((e) => {
          if (disposed) return;
          setErr("Could not load map data. Check your connection and try again.");
          setLoading(false);
        });

      // ── Company dots ───────────────────────────────────────────────────────
      // Points are placed at each company's scattered lat/lng. They start hidden
      // (radius 0) and fade in once the camera is zoomed in past a threshold, so
      // the world view stays clean and dots reveal as you approach a region.
      const DOT_REVEAL_ALT = 1.4; // camera altitude below which dots appear
      globe
        .pointsData(dotsRef.current)
        .pointLat((d) => d.lat)
        .pointLng((d) => d.lng)
        .pointAltitude(0.01)
        .pointRadius((d) => (d.applied ? 0.28 : 0.22))
        .pointColor((d) =>
          d.applied ? "rgba(126,207,179,0.95)" : "rgba(255,207,122,0.92)"
        )
        .pointResolution(6)
        .pointLabel(
          (d) =>
            `<div style="font-family:'Cinzel',serif;color:${GOLD_BRIGHT};background:rgba(12,9,6,.92);border:1px solid rgba(201,168,76,.45);padding:5px 11px;border-radius:7px;font-size:12px;white-space:nowrap"><strong>${
              d.name
            }</strong>${
              d.jobCount
                ? `<span style=\"color:rgba(244,237,216,.6);font-size:10px\"> · ${d.jobCount} open</span>`
                : ""
            }</div>`
        );
      // Hide all dots initially (world view).
      globe.pointRadius(0);

      // Reveal/hide dots based on camera distance. globe.gl exposes the camera
      // via .camera(); altitude ≈ (distance/globeRadius - 1). We poll on the
      // controls "change" event, which fires during any zoom/rotate.
      const GLOBE_R = 100; // globe.gl's internal globe radius
      let dotsVisible = false;
      const applyDotSizing = (visible) => {
        if (visible) {
          globe.pointRadius((d) => (d.applied ? 0.28 : 0.22));
        } else {
          globe.pointRadius(0);
        }
      };
      const updateDotsForZoom = () => {
        const cam = globe.camera();
        if (!cam) return;
        const dist = cam.position.length();
        const altitude = dist / GLOBE_R - 1;
        const shouldShow = altitude < DOT_REVEAL_ALT;
        if (shouldShow !== dotsVisible) {
          dotsVisible = shouldShow;
          applyDotSizing(shouldShow);
          setZoomedIn(shouldShow);
        }
      };
      if (controls) controls.addEventListener("change", updateDotsForZoom);

      // Keep the globe sized to the viewport.
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

    // Cleanup — critical for Three.js to avoid memory leaks on unmount.
    return () => {
      disposed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      try {
        if (globeRef.current && globeRef.current._destructor) {
          globeRef.current._destructor();
        }
      } catch (e) {}
      if (mountRef.current) mountRef.current.innerHTML = "";
      globeRef.current = null;
    };
  }, []);

  // Keep the dots layer in sync if the dots prop arrives/changes after init.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointsData(dots);
  }, [dots]);

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
      {/* The globe mounts here */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

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
          <div style={{ fontSize: 11, color: "rgba(244,237,216,.5)", marginTop: 2 }}>
            {zoomedIn
              ? `${dots.length} studios across the realm — hover a marker to see who`
              : "Scroll to zoom in and reveal studio locations · drag to rotate"}
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

      {/* Loading / error overlays */}
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