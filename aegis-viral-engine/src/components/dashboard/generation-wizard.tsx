'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Image, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button, MotionButton } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StepProgress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HookType, VisualStyle, GenerationProgress } from '@/types';

const HOOK_TYPE_OPTIONS = [
  { value: 'surprising_fact', label: 'Surprising Fact', description: 'Lead with surprising statistics' },
  { value: 'provocative_question', label: 'Provocative Question', description: 'Challenge assumptions' },
  { value: 'counter_intuitive', label: 'Counter-Intuitive', description: 'Defy expectations' },
  { value: 'future_prediction', label: 'Future Prediction', description: 'Bold predictions' },
  { value: 'personal_story', label: 'Personal Story', description: 'Human-centric framing' },
];

const VISUAL_STYLE_OPTIONS = [
  { value: 'abstract_data_visualization', label: 'Data Visualization', description: 'Neural networks & data flows' },
  { value: 'solarpunk_technology', label: 'Solarpunk', description: 'Nature-integrated tech' },
  { value: 'holographic_interface', label: 'Holographic', description: 'Futuristic UI displays' },
  { value: 'human_ai_interaction', label: 'Human-AI', description: 'Collaborative scenes' },
  { value: 'research_lab_aesthetic', label: 'Research Lab', description: 'Scientific discovery' },
];

const VOICE_OPTIONS = [
  { value: 'pNInz6obpgDQGcFmaJgB', label: 'Adam (Recommended)', description: 'Professional, warm male voice' },
  { value: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel', description: 'Clear, empathetic female voice' },
  { value: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh', description: 'Young, energetic male voice' },
  { value: 'MF3mGyEYCl7XYWbV9V6O', label: 'Elli', description: 'Friendly, approachable female voice' },
];

interface GenerationResult {
  postId: string;
  title: string;
  script: {
    hook: string;
    unlock: string;
    cta: string;
    fullText: string;
  };
  audioUrl: string;
  visualAssets: {
    id: string;
    imageUrl: string;
    theme: string;
    sequence: number;
  }[];
  researchSource: string;
}

export function GenerationWizard() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [topic, setTopic] = useState('');
  const [hookType, setHookType] = useState<HookType>('surprising_fact');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('solarpunk_technology');
  const [voiceId, setVoiceId] = useState('pNInz6obpgDQGcFmaJgB');
  const [emotionalTone, setEmotionalTone] = useState<'direct' | 'emotional' | 'balanced'>('balanced');

  const steps = [
    { label: 'Configure', completed: step > 1, active: step === 1 },
    { label: 'Research', completed: progress?.step !== 'research' && step > 1, active: progress?.step === 'research' },
    { label: 'Script', completed: progress?.step !== 'script' && progress?.step !== 'research' && step > 1, active: progress?.step === 'script' },
    { label: 'Audio', completed: progress?.step !== 'audio' && progress?.step !== 'script' && progress?.step !== 'research' && step > 1, active: progress?.step === 'audio' },
    { label: 'Visuals', completed: progress?.step === 'complete', active: progress?.step === 'visuals' },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setStep(2);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || undefined,
          hookType,
          visualStyle,
          voiceId,
          emotionalTone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStep(3);
      } else {
        setError(data.error || 'Generation failed');
        setStep(1);
      }
    } catch (err) {
      setError('Failed to connect to the server');
      setStep(1);
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card variant="elevated">
        <CardContent className="py-6">
          <StepProgress steps={steps} />
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* Step 1: Configuration */}
        {step === 1 && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card variant="glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Generate Viral Content
                </CardTitle>
                <CardDescription>
                  Configure your content generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                {/* Topic */}
                <div className="space-y-2">
                  <Label>Research Topic (Optional)</Label>
                  <Input
                    placeholder="e.g., AI healthcare developing countries..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    Leave empty for random ethical AI topic
                  </p>
                </div>

                {/* Hook Type */}
                <div className="space-y-2">
                  <Label>Hook Style</Label>
                  <Select
                    value={hookType}
                    onChange={(e) => setHookType(e.target.value as HookType)}
                    options={HOOK_TYPE_OPTIONS}
                  />
                </div>

                {/* Visual Style */}
                <div className="space-y-2">
                  <Label>Visual Aesthetic</Label>
                  <Select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                    options={VISUAL_STYLE_OPTIONS}
                  />
                </div>

                {/* Voice */}
                <div className="space-y-2">
                  <Label>Voiceover</Label>
                  <Select
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    options={VOICE_OPTIONS}
                  />
                </div>

                {/* Emotional Tone */}
                <div className="space-y-2">
                  <Label>Emotional Tone</Label>
                  <div className="flex gap-2">
                    {(['direct', 'balanced', 'emotional'] as const).map((tone) => (
                      <Button
                        key={tone}
                        variant={emotionalTone === tone ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setEmotionalTone(tone)}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <MotionButton
                  onClick={handleGenerate}
                  className="w-full"
                  size="lg"
                  disabled={generating}
                  isLoading={generating}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Viral Content
                </MotionButton>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card variant="glow">
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    Generating Content
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {progress?.message || 'Initializing...'}
                  </p>

                  <div className="w-full max-w-md space-y-4">
                    <GenerationStep
                      icon={<BookOpen className="w-4 h-4" />}
                      label="Research"
                      active={progress?.step === 'research'}
                      completed={!!(progress && ['script', 'audio', 'visuals', 'complete'].includes(progress.step))}
                    />
                    <GenerationStep
                      icon={<FileText className="w-4 h-4" />}
                      label="Script Generation"
                      active={progress?.step === 'script'}
                      completed={!!(progress && ['audio', 'visuals', 'complete'].includes(progress.step))}
                    />
                    <GenerationStep
                      icon={<Mic className="w-4 h-4" />}
                      label="Audio Generation"
                      active={progress?.step === 'audio'}
                      completed={!!(progress && ['visuals', 'complete'].includes(progress.step))}
                    />
                    <GenerationStep
                      icon={<Image className="w-4 h-4" />}
                      label="Visual Generation"
                      active={progress?.step === 'visuals'}
                      completed={progress?.step === 'complete'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card variant="glow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <Badge variant="success">Generation Complete</Badge>
                </div>
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>
                  Content generated from: {result.researchSource}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Script Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Script</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScriptSection label="Hook (0-3s)" text={result.script.hook} />
                <ScriptSection label="Unlock (3-30s)" text={result.script.unlock} />
                <ScriptSection label="CTA (30-45s)" text={result.script.cta} />
              </CardContent>
            </Card>

            {/* Audio Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  Audio Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls className="w-full" src={result.audioUrl} />
              </CardContent>
            </Card>

            {/* Visual Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-4 h-4 text-cyan-400" />
                  Visual Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {result.visualAssets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-video rounded-lg overflow-hidden bg-slate-800"
                    >
                      <img
                        src={asset.imageUrl}
                        alt={asset.theme}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs text-white truncate">{asset.theme}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setStep(1);
                  setResult(null);
                }}
              >
                Generate Another
              </Button>
              <Button
                onClick={() => {
                  window.location.href = `/editor?postId=${result.postId}`;
                }}
              >
                Edit in Post Editor
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GenerationStep({
  icon,
  label,
  active,
  completed,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all',
        active && 'bg-cyan-500/10 border border-cyan-500/30',
        completed && 'opacity-50',
        !active && !completed && 'opacity-30'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          active ? 'bg-cyan-500 text-white' : completed ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
        )}
      >
        {completed ? <Check className="w-4 h-4" /> : icon}
      </div>
      <span className={cn('text-sm', active ? 'text-cyan-400' : 'text-slate-400')}>
        {label}
      </span>
      {active && (
        <motion.div
          className="ml-auto w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  );
}

function ScriptSection({ label, text }: { label: string; text?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-cyan-400">{label}</p>
      <p className="text-sm text-slate-300">{text || 'Not available'}</p>
    </div>
  );
}

// Import missing icons
import { BookOpen, FileText } from 'lucide-react';
