import { Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-08-17T00:00:00").getTime();

interface Star {
  id: number;
  top: string;
  left: string;
  delay: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  launched: boolean;
}

function getTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const dist = LAUNCH_DATE - now;

  if (dist < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
  }

  return {
    days: Math.floor(dist / (1000 * 60 * 60 * 24)),
    hours: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((dist % (1000 * 60)) / 1000),
    launched: false,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function ComingSoon() {
  const [stars, setStars] = useState<Star[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [hoverSignin, setHoverSignin] = useState(false);

  useEffect(() => {
    const generated: Star[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
    }));
    setStars(generated);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navy = "#050b18";
  const navy2 = "#0b1730";
  const blue = "#1e9be0";
  const gold = "#e6b23c";
  const white = "#f5f5f5";

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: `radial-gradient(ellipse at 50% 20%, ${navy2}, ${navy} 70%)`,
        color: white,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .cs-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #f5f5f5;
          border-radius: 50%;
          opacity: 0.6;
          animation: twinkle 3s infinite ease-in-out;
        }
        .cs-signin-btn:hover {
          background: #e6b23c !important;
          color: #050b18 !important;
          transform: scale(1.05);
        }
        @media (max-width: 480px) {
          .cs-countdown {
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .cs-unit {
            flex: 1 !important;
            min-width: 0 !important;
            padding: 10px 4px !important;
            border-radius: 10px !important;
          }
          .cs-unit .cs-num {
            font-size: 22px !important;
          }
          .cs-unit .cs-label {
            font-size: 10px !important;
            letter-spacing: 1px !important;
          }
          .cs-logo-wrap img {
            height: 70px !important;
          }
          .cs-h1 {
            font-size: 26px !important;
          }
          .cs-sub {
            font-size: 13px !important;
            margin-bottom: 16px !important;
            padding: 0 10px !important;
          }
        }
      `}</style>

      {/* Sign In hover area */}
      <div
        onMouseEnter={() => setHoverSignin(true)}
        onMouseLeave={() => setHoverSignin(false)}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 140,
          height: 70,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Link
          to="/sign-in"
          className="cs-signin-btn"
          style={{
            opacity: hoverSignin ? 1 : 0,
            visibility: hoverSignin ? "visible" : "hidden",
            padding: "8px 18px",
            borderRadius: 20,
            border: `1px solid ${gold}`,
            background: "rgba(11, 23, 48, 0.8)",
            color: gold,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            backdropFilter: "blur(4px)",
            transition: "opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease",
            cursor: "pointer",
          }}
        >
          Sign In
        </Link>
      </div>

      {/* Starfield */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {stars.map((s) => (
          <div
            key={s.id}
            className="cs-star"
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </div>

      {/* Orbit rings */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          width: "min(900px, 90vh)",
          height: "min(900px, 90vh)",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(30, 155, 224, 0.15)",
          borderRadius: "50%",
          animation: "spin 40s linear infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          width: "min(600px, 60vh)",
          height: "min(600px, 60vh)",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(230, 178, 60, 0.15)",
          borderRadius: "50%",
          animation: "spin 25s linear infinite reverse",
          zIndex: 0,
        }}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "12px 20px",
          position: "relative",
          zIndex: 1,
          minHeight: 0,
        }}
      >
        <div
          className="cs-logo-wrap"
          style={{ marginBottom: 8, animation: "floatLogo 3.2s ease-in-out infinite" }}
        >
          <img
            src="/logo.png"
            alt="Yes Future logo"
            style={{
              height: "clamp(100px, 8vh, 80px)",
              filter: "drop-shadow(0 0 18px rgba(230, 178, 60, 0.35))",
            }}
          />
        </div>

        <h1
          className="cs-h1"
          style={{
            fontSize: "clamp(22px, 4vw, 44px)",
            letterSpacing: 3,
            background: `linear-gradient(90deg, ${blue}, ${gold})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 6,
          }}
        >
          SOMETHING BIG IS LAUNCHING
        </h1>

        <p
          className="cs-sub"
          style={{
            color: "#b7c3d9",
            fontSize: "clamp(12px, 1.6vw, 16px)",
            maxWidth: 480,
            marginBottom: 20,
            lineHeight: 1.4,
          }}
        >
          Yes Future is building the next move. The site is almost ready — count down with us.
        </p>

        <div
          className="cs-countdown"
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          {timeLeft.launched ? (
            <div className="cs-unit" style={unitStyle}>
              <div className="cs-num" style={numStyle(gold)}>
                🎉
              </div>
              <div className="cs-label" style={labelStyle}>
                Launched
              </div>
            </div>
          ) : (
            <>
              <div className="cs-unit" style={unitStyle}>
                <div className="cs-num" style={numStyle(gold)}>
                  {pad(timeLeft.days)}
                </div>
                <div className="cs-label" style={labelStyle}>
                  Days
                </div>
              </div>
              <div className="cs-unit" style={unitStyle}>
                <div className="cs-num" style={numStyle(gold)}>
                  {pad(timeLeft.hours)}
                </div>
                <div className="cs-label" style={labelStyle}>
                  Hours
                </div>
              </div>
              <div className="cs-unit" style={unitStyle}>
                <div className="cs-num" style={numStyle(gold)}>
                  {pad(timeLeft.minutes)}
                </div>
                <div className="cs-label" style={labelStyle}>
                  Minutes
                </div>
              </div>
              <div className="cs-unit" style={unitStyle}>
                <div className="cs-num" style={numStyle(gold)}>
                  {pad(timeLeft.seconds)}
                </div>
                <div className="cs-label" style={labelStyle}>
                  Seconds
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "#5c6b85",
          padding: 8,
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        &copy; 2026 Yes Future. All rights reserved.
      </footer>
    </div>
  );
}

const unitStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(230, 178, 60, 0.25)",
  borderRadius: 12,
  padding: "12px 18px",
  minWidth: 80,
  backdropFilter: "blur(6px)",
  boxShadow: "0 0 20px rgba(30, 155, 224, 0.08)",
};

const numStyle = (color: string): React.CSSProperties => ({
  fontSize: "clamp(22px, 3.5vw, 34px)",
  fontWeight: 700,
  color,
  fontVariantNumeric: "tabular-nums",
});

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 2,
  color: "#8fa3c0",
  textTransform: "uppercase",
  marginTop: 4,
};