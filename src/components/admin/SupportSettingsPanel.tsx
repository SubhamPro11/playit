import React, { useState, useRef } from 'react';
import { Heart, Upload, Trash2, Check, QrCode, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { SiteSettings } from '../../types/settings';
import { uploadSupportQrImage } from '../../lib/storage';

interface SupportSettingsPanelProps {
  settings: SiteSettings;
  onSaveSettings: (updated: Partial<SiteSettings>) => Promise<void>;
  onClearQr: () => Promise<void>;
}

export const SupportSettingsPanel: React.FC<SupportSettingsPanelProps> = ({
  settings,
  onSaveSettings,
  onClearQr,
}) => {
  const [formData, setFormData] = useState<SiteSettings>({
    supportQrUrl: settings.supportQrUrl || '',
    supportTitle: settings.supportTitle || 'Support the Curator',
    supportMessage:
      settings.supportMessage ||
      'Enjoying Airwaves? Help keep this curated directory of 70 independent feeds ad-free and maintained.',
    supportUpiId: settings.supportUpiId || '',
    isEnabled: settings.isEnabled ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setImgError(false);
      const url = await uploadSupportQrImage(file);
      setFormData((prev) => ({ ...prev, supportQrUrl: url }));
      showFeedback('success', 'QR code image uploaded successfully! Click "Save Changes" to apply.');
    } catch (err) {
      showFeedback('error', (err as Error).message || 'Failed to upload QR code image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSaveSettings(formData);
      showFeedback('success', 'Support settings saved and updated for the live site!');
    } catch (err) {
      showFeedback('error', (err as Error).message || 'Failed to save support settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear the QR code? The support section will be hidden on the public site.')) {
      setFormData((prev) => ({ ...prev, supportQrUrl: '' }));
      await onClearQr();
      showFeedback('success', 'QR code removed. The public support section is now hidden.');
    }
  };

  const isConfigured = Boolean(formData.isEnabled && formData.supportQrUrl?.trim());

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-850 border border-surface-700">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent-500 fill-accent-500/20" />
            <h2 className="font-sans font-bold text-lg text-white">
              &quot;Support Me&quot; QR Code &amp; Curator Settings
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload your UPI/Payment QR code and customize your support message. When active, this renders an understated support card above the site footer without requiring a rebuild or redeployment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-mono ${
              isConfigured
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            {isConfigured ? 'LIVE ON PUBLIC SITE' : 'HIDDEN (NO QR SET)'}
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Grid: Form Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-surface-850 border border-surface-700 space-y-4 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-accent-400" />
              <span>1. QR Code Image</span>
            </h3>

            {/* Upload or URL input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Upload QR Code Image (UPI / Razorpay / Ko-fi / BuyMeACoffee)
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  id="qr-upload-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-accent-500/20 disabled:opacity-50"
                >
                  <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
                  <span>{uploading ? 'Uploading...' : 'Choose QR Image File'}</span>
                </button>

                {formData.supportQrUrl && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear QR</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Supported formats: PNG, JPG, WebP, SVG (up to 5 MB).
              </p>
            </div>

            {/* Direct Image URL fallback input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Or Direct Image URL
              </label>
              <input
                type="text"
                value={formData.supportQrUrl}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, supportQrUrl: e.target.value }));
                  setImgError(false);
                }}
                placeholder="https://.../qr.png"
                className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-850 border border-surface-700 space-y-4 shadow-sm">
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              2. Messaging &amp; Payment Details
            </h3>

            {/* Section Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={formData.supportTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supportTitle: e.target.value }))
                }
                placeholder="Support the Curator"
                className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-accent-500 focus:outline-none"
              />
            </div>

            {/* Support Message */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Support Message / Tagline
              </label>
              <textarea
                rows={3}
                value={formData.supportMessage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supportMessage: e.target.value }))
                }
                placeholder="Enjoying Airwaves? Help keep this curated directory running..."
                className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-accent-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* UPI ID / Payment handle */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                UPI ID or Payment Handle (Optional)
              </label>
              <input
                type="text"
                value={formData.supportUpiId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supportUpiId: e.target.value }))
                }
                placeholder="curator@upi or username@okaxis"
                className="w-full px-3.5 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-accent-500 focus:outline-none font-mono"
              />
            </div>

            {/* Enable/Disable Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-surface-700/80">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Show on Public Website
                </span>
                <span className="text-[11px] text-slate-400">
                  Toggle whether the support card renders on the homepage
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formData.isEnabled ? 'bg-accent-500' : 'bg-surface-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-surface-950 transition-transform ${
                    formData.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-accent-500/20 disabled:opacity-50 uppercase tracking-wider"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Support Settings</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Public Site Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-accent-400" />
            <span>Live Card Preview</span>
          </div>

          {isConfigured ? (
            <div className="p-6 rounded-2xl bg-surface-900 border border-surface-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* QR Code Container */}
                <div className="w-36 h-36 shrink-0 rounded-xl bg-white p-2.5 shadow-md flex items-center justify-center border border-surface-700/50">
                  {!imgError ? (
                    <img
                      src={formData.supportQrUrl}
                      alt="Curator UPI QR Code"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2 text-surface-950">
                      <AlertCircle className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                      <span className="text-[10px] font-bold block">Invalid QR URL</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent-500/10 text-accent-400 text-[10px] font-mono font-semibold uppercase tracking-wider mb-2">
                    <Heart className="w-3 h-3 fill-accent-500 text-accent-500" />
                    <span>Direct Support</span>
                  </div>

                  <h4 className="font-sans font-bold text-base text-white tracking-tight">
                    {formData.supportTitle || 'Support the Curator'}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {formData.supportMessage}
                  </p>

                  {formData.supportUpiId && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-850 border border-surface-700 font-mono text-[11px] text-slate-300">
                      <span className="text-slate-500">UPI:</span>
                      <span className="text-accent-300 font-semibold">{formData.supportUpiId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-surface-900/60 border border-surface-800 border-dashed text-center text-slate-400">
              <QrCode className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <h4 className="font-sans font-semibold text-sm text-slate-300">
                Support Section Inactive
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Upload a QR code and toggle &quot;Show on Public Website&quot; to activate this card for visitors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
