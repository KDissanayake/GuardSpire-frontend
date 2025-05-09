import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MsgUrlScanner = () => {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!inputText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User not authenticated. Please sign in.');
      return;
    }

    setIsScanning(true);
    setProgress(0);
    setScanComplete(false);

    // 🔄 Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.1;
      });
    }, 200);

    try {
      // 🛠 Send the manual scan creation request
      await axios.post(
        'http://localhost:5000/api/scan/manual',
        { inputText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Now fetch the latest scan result
      const response = await axios.get('http://localhost:5000/api/scan/manual/report/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setScanResult(response.data);
      setScanComplete(true);
      setIsScanning(false);
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Scan failed. Please try again.');
      setIsScanning(false);
    }
  };

  return (
    <div className="scanner-outer">
      <h2 className="scanner-title">Msg & URL Scanner</h2>

      <div className="scanner-inner">
        <div className={`scanner-input-box ${isScanning ? 'disabled' : ''}`}>
          {isScanning ? (
            <div className="scanner-progress">
              <svg className="scanner-ring" width="100" height="100">
                <circle cx="50" cy="50" r="45" stroke="#ddd" strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#04366D"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={`${283 - 283 * progress}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="58" textAnchor="middle" fontSize="20" fill="#04366D" fontWeight="bold">
                  {Math.round(progress * 100)}%
                </text>
              </svg>
            </div>
          ) : (
            <textarea
              className="scanner-input"
              placeholder="+ Add a Message or a URL to Scan"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isScanning}
            />
          )}
        </div>

        <button className="scanner-button" onClick={handleScan} disabled={isScanning}>
          Scan
        </button>

        {scanComplete && scanResult && (
          <>
            <h3 className="scanner-subtitle">Status</h3>
            <div className="scanner-status-card">
              <div className="scanner-status-header">{scanResult.type}</div>

              <div className="scanner-status-body">
                <div className="scanner-status-row">
                  <p className="scanner-status-label">Threat Level</p>
                  <div className="scanner-threat-bar">
                    <div className="bar-green" />
                    <div className="bar-yellow" />
                    <div className="bar-red" />
                  </div>
                </div>

                <div className="scanner-status-row">
                  <p className="scanner-status-label">Status</p>
                  <p className="scanner-critical">{scanResult.threatLevel}</p>
                </div>
              </div>

              <div className="scanner-percentage-badge">
                <div className="scanner-badge-circle">
                  <span>{Math.round(scanResult.threatPercentage * 100)}%</span>
                </div>
              </div>
            </div>

            <h3 className="scanner-subtitle">Alert Details & Insights</h3>
            <div className="scanner-alert-card">
              <p><strong>Alert Type:</strong> {scanResult.type}</p>
              <p><strong>Affected Platform:</strong> {scanResult.platform}</p>
              <p><strong>Suspicious URL:</strong> {scanResult.url}</p>
              <p><strong>Threat Level:</strong> {scanResult.threatLevel}</p>
              <p><strong>Description:</strong> {scanResult.description}</p>
            </div>

            <button className="scanner-more-btn" onClick={() => navigate('/report')}>
              ... More Details
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MsgUrlScanner;
