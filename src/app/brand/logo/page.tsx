'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  LogoTheme,
  LogoStyle,
  ColorScheme,
  GeneratedLogo,
  getLogoThemeDescription,
  getLogoStyleDescription,
  getColorSchemeDescription,
} from '@/lib/logo';

const THEME_OPTIONS: { value: LogoTheme; label: string }[] = [
  { value: 'ai_ethics', label: 'AI Ethics / Scales' },
  { value: 'human_ai', label: 'Human-AI Collaboration' },
  { value: 'shield', label: 'Protective Shield' },
  { value: 'balance', label: 'Balance / Harmony' },
];

const STYLE_OPTIONS: { value: LogoStyle; label: string }[] = [
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'symbolic', label: 'Symbolic' },
];

const COLOR_OPTIONS: { value: ColorScheme; label: string }[] = [
  { value: 'cyan_blue', label: 'Cyan & Blue' },
  { value: 'green_gold', label: 'Green & Gold' },
  { value: 'purple_white', label: 'Purple & White' },
];

export default function LogoGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [logos, setLogos] = useState<GeneratedLogo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<LogoTheme>('ai_ethics');
  const [style, setStyle] = useState<LogoStyle>('minimalist');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('cyan_blue');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/logo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: { theme, style, colorScheme },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLogos((prev) => [data.logo, ...prev]);
      } else {
        setError(data.error || 'Failed to generate logo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate logo');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariations = async () => {
    setGeneratingVariations(true);
    setError(null);
    try {
      const response = await fetch('/api/logo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: { colorScheme },
          generateVariations: true,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setLogos((prev) => [...data.logos, ...prev]);
      } else {
        setError(data.error || 'Failed to generate variations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setGeneratingVariations(false);
    }
  };

  const handleDownload = async (logo: GeneratedLogo, index: number) => {
    try {
      const response = await fetch(logo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aegis-logo-${logo.options.theme || 'custom'}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Logo Generator</h1>
          <p className="text-slate-400">
            Generate brand logos for AI Ethics for Good. Logos are created at 1:1 aspect ratio,
            suitable for TikTok app icons (162x162px with 144x144px safe area).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="elevated" className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>Configure your logo generation options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Theme</label>
                <Select
                  options={THEME_OPTIONS}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as LogoTheme)}
                />
                <p className="text-xs text-slate-500">{getLogoThemeDescription(theme)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Style</label>
                <Select
                  options={STYLE_OPTIONS}
                  value={style}
                  onChange={(e) => setStyle(e.target.value as LogoStyle)}
                />
                <p className="text-xs text-slate-500">{getLogoStyleDescription(style)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Color Scheme</label>
                <Select
                  options={COLOR_OPTIONS}
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
                />
                <p className="text-xs text-slate-500">{getColorSchemeDescription(colorScheme)}</p>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleGenerate}
                  isLoading={loading}
                  disabled={loading || generatingVariations}
                  className="w-full"
                >
                  Generate Logo
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleGenerateVariations}
                  isLoading={generatingVariations}
                  disabled={loading || generatingVariations}
                  className="w-full"
                >
                  Generate 4 Variations
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-sm font-medium text-slate-300 mb-2">TikTok Requirements</h4>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>- App icon: 162x162px PNG</li>
                  <li>- Safe area: 144x144px centered</li>
                  <li>- 20px rounded corners</li>
                  <li>- No text, pure icon</li>
                  <li>- Must not resemble other brands</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Generated Logos</CardTitle>
              <CardDescription>
                {logos.length === 0
                  ? 'Generated logos will appear here'
                  : `${logos.length} logo${logos.length === 1 ? '' : 's'} generated`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logos.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-lg">
                  <p className="text-slate-500">No logos generated yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {logos.map((logo, index) => (
                    <div
                      key={logo.id}
                      className="group relative bg-slate-800/50 rounded-xl overflow-hidden"
                    >
                      <div className="aspect-square">
                        <img
                          src={logo.imageUrl}
                          alt={`Generated logo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs text-slate-300 mb-2 truncate">
                            {logo.options.theme} / {logo.options.style}
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(logo, index)}
                            className="w-full"
                          >
                            Download PNG
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-slate-900/80 text-slate-300 rounded">
                          {logo.options.colorScheme?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card variant="bordered">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Generated logos are created using FLUX 1.1 Pro via Replicate. Review each logo
                carefully before using it as your TikTok app icon.
              </p>
              <a
                href="/tiktok"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap ml-4"
              >
                Go to TikTok Settings &rarr;
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
