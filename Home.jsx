import React, { useState } from "react";
import { Globe, Search, Loader2, Server, Link2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function normalizeInput(raw) {
  let value = raw.trim();
  if (!value) return "";
  // strip protocol
  value = value.replace(/^[a-zA-Z]+:\/\//, "");
  // strip path
  const slashIndex = value.indexOf("/");
  if (slashIndex !== -1) value = value.slice(0, slashIndex);
  // strip port
  const colonIndex = value.indexOf(":");
  if (colonIndex !== -1) value = value.slice(0, colonIndex);
  return value.toLowerCase();
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");

  async function handleLookup(e) {
    e?.preventDefault();
    const host = normalizeInput(input);
    if (!host) {
      setError("Please enter a website URL.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`);
      if (!res.ok) throw new Error("DNS lookup failed");
      const data = await res.json();
      const ips = (data.Answer || []).filter((a) => a.type === 1).map((a) => a.data);
      if (!ips.length) {
        setError(`No A records found for "${host}".`);
      } else {
        setResult({ host, ips });
      }
    } catch (err) {
      setError("Could not resolve this domain. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-6 shadow-lg shadow-slate-900/10">
            <Globe className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3">
            IP &amp; Address Lookup
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Paste any website URL to reveal its IP address and web address.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleLookup} className="relative mb-8">
          <div className="relative flex items-center gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/60">
            <div className="pl-3 text-slate-400">
              <Link2 className="w-5 h-5" />
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="example.com or https://example.com/page"
              className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent text-base h-11"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Lookup
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 text-red-700 ring-1 ring-red-100">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="p-6 rounded-2xl ring-1 ring-slate-200/60 shadow-lg shadow-slate-900/5">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700">
                  <Link2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Web Address</p>
                  <p className="text-lg font-semibold text-slate-900 truncate">{result.host}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.host, "host")}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Copy"
                >
                  {copied === "host" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    IP Address{result.ips.length > 1 ? "es" : ""}
                  </p>
                  <p className="text-sm text-slate-500">{result.ips.length} found</p>
                </div>
              </div>

              <div className="space-y-2">
                {result.ips.map((ip, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 group"
                  >
                    <span className="font-mono text-sm text-slate-800">{ip}</span>
                    <button
                      onClick={() => copyToClipboard(ip, `ip-${i}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                      title="Copy"
                    >
                      {copied === `ip-${i}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-10">
          Resolves A records via Google DNS. Some domains may not return a public IP.
        </p>
      </div>
    </div>
  );
}
