"use client";

import { useEffect, useState } from "react";
import { Settings, Save, RefreshCw, Check } from "lucide-react";

export default function SettingsPage() {
  const [gatewayUrl, setGatewayUrl] = useState("http://127.0.0.1:18789");
  const [gatewayToken, setGatewayToken] = useState("");
  const [config, setConfig] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    fetch("/api/gateway/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setGatewayUrl(d.data.gatewayUrl || gatewayUrl);
          setGatewayToken(d.data.gatewayToken || "");
          setConfig(d.data.config || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setConfigError("");
    try {
      if (config) {
        try { JSON.parse(config); } catch { setConfigError("Invalid JSON"); setSaving(false); return; }
      }
      // Save settings would go through API
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Gateway configuration and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Gateway Connection */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Gateway Connection</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Gateway URL</label>
              <input
                value={gatewayUrl}
                onChange={e => setGatewayUrl(e.target.value)}
                className="input-apple"
                placeholder="http://127.0.0.1:18789"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">API Token</label>
              <input
                value={gatewayToken}
                onChange={e => setGatewayToken(e.target.value)}
                className="input-apple"
                type="password"
                placeholder="Bearer token"
              />
            </div>
          </div>
        </div>

        {/* Config Editor */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">openclaw.json</h3>
          <textarea
            value={config}
            onChange={e => { setConfig(e.target.value); setConfigError(""); }}
            className="input-apple font-mono text-xs h-64 resize-y"
            placeholder="Configuration will load when connected to the gateway..."
          />
          {configError && <p className="text-xs text-apple-red mt-2">{configError}</p>}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saved ? <Check size={16} /> : saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saved ? "Saved" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
