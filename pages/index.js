import { useState, useRef } from "react";
import Head from "next/head";

const footerStyles = {
  width: "100%",
  textAlign: "center",
  marginTop: 36,
  color: "#b9c9e8",
  fontSize: 16,
  letterSpacing: 0.2,
  paddingBottom: 20,
  opacity: 0.85,
};

const footerLink = {
  color: "#63a4ff",
  fontWeight: "bold",
  textDecoration: "none",
  marginLeft: 4
};

// Mapping for common import names to PyPI package names
const IMPORT_TO_PYPI = {
  pil: "pillow",
  pillow: "pillow",
  cv2: "opencv-python",
  sklearn: "scikit-learn",
  mpl_toolkits: "matplotlib", // e.g. mpl_toolkits.basemap
  bs4: "beautifulsoup4",
  yaml: "pyyaml",
  matplotlib: "matplotlib",
  pd: "pandas",
  np: "numpy",
  tf: "tensorflow",
  torch: "torch",
  "PIL": "pillow",
  PILLOW: "pillow",
  // add more as needed
};

export default function Home() {
  const [code, setCode] = useState("");
  const [requirements, setRequirements] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const textareaRef = useRef(null);

  // Helper to extract import names from code
  const extractImports = (codeStr) => {
    const lines = codeStr.split("\n");
    const importsSet = new Set();
    const importPattern = /^\s*import\s+([a-zA-Z0-9_\.]+)/;
    const fromPattern = /^\s*from\s+([a-zA-Z0-9_\.]+)\s+import\s+/;
    lines.forEach((line) => {
      let match = line.match(importPattern);
      if (match) {
        importsSet.add(match[1].split(".")[0]);
        return;
      }
      match = line.match(fromPattern);
      if (match) {
        importsSet.add(match[1].split(".")[0]);
      }
    });
    return Array.from(importsSet).filter(Boolean);
  };

  // Helper to check existence of a given PyPI package (using the PyPI API)
  async function checkPyPI(name) {
    // Cache checks to minimize network hits in batch
    if (!checkPyPI.cache) checkPyPI.cache = {};
    if (name in checkPyPI.cache) return checkPyPI.cache[name];
    try {
      const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
      let ok = res.ok;
      checkPyPI.cache[name] = ok;
      return ok;
    } catch {
      return false;
    }
  }

  // The main logic: resolve to installable PyPI names
  async function resolveToPyPI(packages) {
    const results = [];
    for (let origName of packages) {
      let mapped = IMPORT_TO_PYPI[origName.toLowerCase()] || origName;
      // Check if mapped exists on PyPI
      let exists = await checkPyPI(mapped);
      if (exists) {
        results.push(mapped.toLowerCase());
        continue;
      }
      // If original != mapped and original was not found, try original as fallback
      if (mapped !== origName) {
        exists = await checkPyPI(origName);
        if (exists) {
          results.push(origName.toLowerCase());
          continue;
        }
      }
      // Not found, add comment in requirements.txt
      results.push(`# Could not resolve "${origName}" to a PyPI package`);
    }
    // Deduplicate, filter falsy
    return [...new Set(results.filter(Boolean))].join("\n");
  }

  const generateReqs = async () => {
    if (loadingGenerate) return;
    setLoadingGenerate(true);
    // Extract unique base names
    const importNames = extractImports(code);
    if (importNames.length === 0) {
      setRequirements("");
      setLoadingGenerate(false);
      return;
    }
    // Resolve them to PyPI installable names or informative error
    const resolved = await resolveToPyPI(importNames);
    setRequirements(resolved);
    setLoadingGenerate(false);
  };

  const copyReqs = async () => {
    if (!requirements) return;
    try {
      await navigator.clipboard.writeText(requirements);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand("copy");
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const downloadReqs = () => {
    if (!requirements || loadingDownload) return;
    const blob = new Blob([requirements], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "requirements.txt";
    a.click();
    URL.revokeObjectURL(url);
    setLoadingDownload(true);
    setTimeout(() => setLoadingDownload(false), 1400);
  };

  // Overlay icons (same as before)
  function SettingsIcon({ spinning = false, size = 90 }) {
    return (
      <svg
        className={spinning ? "overlay-spin" : ""}
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
      >
        <circle cx="36" cy="36" r="22" fill="#e6f2ff" />
        <g>
          <circle cx="36" cy="36" r="12" fill="#63a4ff" />
          <g stroke="#83eaf1" strokeWidth="3" strokeLinecap="round">
            <path d="M36 12v-6" />
            <path d="M36 66v-6" />
            <path d="M60 36h6" />
            <path d="M6 36h6" />
            <path d="M53.3 53.3l4.2 4.2" />
            <path d="M14.5 14.5l4.2 4.2" />
            <path d="M53.3 18.7l4.2-4.2" />
            <path d="M14.5 57.5l4.2-4.2" />
          </g>
        </g>
      </svg>
    );
  }
  function DownloadIcon({ bouncing = false, size = 90 }) {
    return (
      <svg
        className={bouncing ? "overlay-bounce" : ""}
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
      >
        <circle cx="36" cy="36" r="22" fill="#e6fcfa" />
        <g>
          <path d="M36 24v14" stroke="#43c6ac" strokeWidth="5" strokeLinecap="round" />
          <polyline
            points="27,36 36,47 45,36"
            fill="none"
            stroke="#43c6ac"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="24" y="52" width="24" height="5" rx="2.5" fill="#89f7fe" />
        </g>
      </svg>
    );
  }

  const icons = {
    gear: (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="9" fill="#63a4ff" />
        <g stroke="#232526" strokeWidth="2">
          <path d="M20 8v-3" />
          <path d="M20 35v-3" />
          <path d="M32 20h3" />
          <path d="M5 20h3" />
          <path d="M11 11l-2.2-2.2" />
          <path d="M31 29l2.2 2.2" />
          <path d="M11 29l-2.2 2.2" />
          <path d="M31 11l2.2-2.2" />
        </g>
      </svg>
    ),
    copy: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#232526" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="34" height="34" viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    ),
    download: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#232526" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="34" height="34" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <title>Requirement File Generator</title>
      </Head>
      {(loadingGenerate || loadingDownload) && (
        <div style={styles.loadingOverlay}>
          <div className="circle-border-anim">
            <div className="circle-icon-center">
              {loadingGenerate ? <SettingsIcon spinning /> : <DownloadIcon bouncing />}
            </div>
          </div>
        </div>
      )}
      {copied && <div className="copiedBox">📑 Copied to clipboard!</div>}

      <div style={styles.page}>
        <div style={styles.container}>
          <h1 className="animated-gradient-heading">
            Requirement File Generator
          </h1>
          <textarea
            ref={textareaRef}
            placeholder={`Paste your Python import code here

Example:
import numpy as np
from sklearn.ensemble import RandomForestClassifier`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={styles.textarea}
            rows={8}
          />
          <div style={styles.actions}>
            <button
              onClick={generateReqs}
              style={styles.button}
              className="hover-animate"
              disabled={loadingGenerate || loadingDownload}
              type="button"
            >
              <span style={styles.iconWrap}>{icons.gear}</span>
              <span style={styles.label}>Generate</span>
            </button>
            <button
              onClick={copyReqs}
              style={styles.button}
              className="hover-animate"
              disabled={loadingGenerate || loadingDownload}
              type="button"
            >
              <span style={styles.iconWrap}>{icons.copy}</span>
              <span style={styles.label}>Copy</span>
            </button>
            <button
              onClick={downloadReqs}
              style={styles.button}
              className="hover-animate"
              disabled={loadingGenerate || loadingDownload}
              type="button"
            >
              <span style={styles.iconWrap}>{icons.download}</span>
              <span style={styles.label}>Download</span>
            </button>
          </div>
          <p><b>requirements.txt:</b></p>
          <pre style={styles.pre}>
            {requirements || "Your requirements.txt will appear here..."}
          </pre>
        </div>
        <footer style={footerStyles}>
          Made with <span style={{color: "#e25555"}}>♥</span> by <a href="https://dhairya.space" target="_blank" rel="noopener noreferrer" style={footerLink}>dhairya.space</a>
        </footer>
      </div>
      <style jsx>{`
        .animated-gradient-heading {
          text-align: center;
          font-weight: 900;
          font-size: 2.8rem;
          margin-bottom: 32px;
          background: linear-gradient(270deg, #63a4ff, #83eaf1, #63a4ff, #83eaf1);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientAnimation 8s ease infinite;
        }
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hover-animate {
          transition: transform 0.25s cubic-bezier(.23,1.15,.64,1) 0.1s, box-shadow 0.25s cubic-bezier(.23,1.15,.64,1) 0.1s;
        }
        .hover-animate:hover,
        .hover-animate:focus {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(67, 198, 172, 0.5);
          outline: none;
        }
        .hover-animate:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .copiedBox {
          position: fixed;
          top: 25px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #43c6ac 0%, #f8ffae 70%);
          color: #222;
          padding: 14px 36px;
          font-size: 18px;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(67, 198, 172, 0.15);
          font-weight: 700;
          z-index: 1000;
          opacity: 0;
          animation: fadeInOut 1.6s ease forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 0.97; }
          90% { opacity: 0.97; }
          100% { opacity: 0; }
        }
        .circle-border-anim {
          width: 170px;
          height: 170px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: conic-gradient(#63a4ff, #d1ecfa, #43c6ac, #f8ffae, #63a4ff 360deg);
          animation: rotateCircle 1.15s linear infinite;
          box-shadow: 0 0 48px 10px rgba(67,198,200,0.10);
        }
        @keyframes rotateCircle {
          100% { transform: rotate(360deg); }
        }
        .circle-icon-center {
          width: 124px;
          height: 124px;
          border-radius: 50%;
          background: #fafdff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 44px 6px rgba(160,230,250,0.10);
        }
        .overlay-spin {
          animation: gearspin 1s cubic-bezier(.6,.05,.28,.91) infinite linear;
        }
        @keyframes gearspin {
          to { transform: rotate(360deg); }
        }
        .overlay-bounce {
          animation: download-bounce 0.9s cubic-bezier(.34,1.35,.61,1.09) alternate infinite;
        }
        @keyframes download-bounce {
          0% { transform: translateY(0);}
          45% { transform: translateY(25px);}
          100% { transform: translateY(0);}
        }
        @media (max-width: 600px) {
          div[style*="container"] {
            padding: 24px 20px !important;
            max-width: 90vw !important;
            margin: 0 5vw !important;
          }
          textarea {
            height: 200px !important;
            font-size: 18px !important;
          }
          .copiedBox {
            font-size: 16px !important;
            padding: 12px 24px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #121212 30%, #232526 100%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "60px",
    color: "#ecf0f1",
  },
  container: {
    backgroundColor: "#232526",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    maxWidth: "560px",
    width: "100%",
    padding: "32px 40px",
    color: "#ecf0f1",
    margin: "0 auto",
  },
  textarea: {
    width: "100%",
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #444",
    resize: "vertical",
    marginBottom: 18,
    outline: "none",
    background: "#181a1b",
    color: "#e3e3e3",
    transition: "border 0.3s",
    fontFamily: "Consolas, monospace",
    whiteSpace: "pre-wrap",
    minHeight: 160,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
    gap: 18,
    width: "100%"
  },
  iconWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.3,
    marginTop: 0,
  },
  button: {
    width: "100%",
    background: "linear-gradient(90deg, #e6f6ff 0%, #c5f0fc 100%)",
    color: "#232526",
    border: "none",
    borderRadius: 12,
    padding: "10px 0 10px 0",
    fontSize: 16,
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
    boxShadow: "0 3px 14px rgba(100,180,250,.09)"
  },
  pre: {
    background: "linear-gradient(90deg, #232526 50%, #373b44 100%)",
    border: "1px dashed #43c6ac",
    padding: 16,
    borderRadius: 8,
    minHeight: 64,
    fontSize: 16,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#f8ffae",
    marginTop: 8,
    fontFamily: "Consolas, monospace",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(18, 18, 18, 0.82)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
};
