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

export default function JourneyGlobe({ user, onExit }) {
  const mountRef = useRef(null);
  const globeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
        controls.enablePan = false; // OrbitControls pan is screen-space; we map buttons below
        controls.minDistance = 140;
        controls.maxDistance = 480;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 0.9;
        // Swap mouse buttons: LEFT = pan, RIGHT = rotate.
        // globe.gl uses THREE.OrbitControls under the hood.
        if (controls.mouseButtons) {
          // THREE.MOUSE: LEFT=0, MIDDLE=1, RIGHT=2; map to ROTATE/DOLLY/PAN
          controls.mouseButtons.LEFT = 2;  // PAN
          controls.mouseButtons.RIGHT = 0; // ROTATE
          controls.enablePan = true;
        }
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
            Right-click to rotate · Left-click to pan · Scroll to zoom
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
