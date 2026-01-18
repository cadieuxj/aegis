'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Bell, Palette, Database, Save, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">
          Configure your Aegis Viral Engine preferences
        </p>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Manage your API keys for external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Firecrawl API Key</Label>
            <div className="flex gap-2">
              <Input type="password" placeholder="fc-xxxxxxxxxxxxxxxx" className="flex-1" />
              <Badge variant="success">Connected</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Anthropic API Key</Label>
            <div className="flex gap-2">
              <Input type="password" placeholder="sk-ant-xxxxxxxxxxxxxxxx" className="flex-1" />
              <Badge variant="success">Connected</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Replicate API Token (FLUX)</Label>
            <div className="flex gap-2">
              <Input type="password" placeholder="r8_XXXXXXXXXXXXXXXXXXXXXXXX" className="flex-1" />
              <Badge variant="success">Connected</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>ElevenLabs API Key</Label>
            <div className="flex gap-2">
              <Input type="password" placeholder="xxxxxxxxxxxxxxxx" className="flex-1" />
              <Badge variant="success">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Database Configuration
          </CardTitle>
          <CardDescription>
            Supabase connection settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Supabase URL</Label>
            <Input placeholder="https://your-project.supabase.co" />
          </div>

          <div className="space-y-2">
            <Label>Supabase Anon Key</Label>
            <Input type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." />
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">
              <span className="text-cyan-400 font-medium">Tip:</span> Run the SQL schema
              in your Supabase SQL Editor to set up the required tables. Check the{' '}
              <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">
                src/lib/supabase.ts
              </code>{' '}
              file for the complete schema.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Default Generation Settings
          </CardTitle>
          <CardDescription>
            Configure default options for content generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Hook Type</Label>
            <Select
              options={[
                { value: 'surprising_fact', label: 'Surprising Fact' },
                { value: 'provocative_question', label: 'Provocative Question' },
                { value: 'counter_intuitive', label: 'Counter-Intuitive' },
                { value: 'future_prediction', label: 'Future Prediction' },
                { value: 'personal_story', label: 'Personal Story' },
              ]}
              defaultValue="surprising_fact"
            />
          </div>

          <div className="space-y-2">
            <Label>Default Visual Style</Label>
            <Select
              options={[
                { value: 'solarpunk_technology', label: 'Solarpunk Technology' },
                { value: 'abstract_data_visualization', label: 'Data Visualization' },
                { value: 'holographic_interface', label: 'Holographic Interface' },
                { value: 'human_ai_interaction', label: 'Human-AI Interaction' },
                { value: 'research_lab_aesthetic', label: 'Research Lab Aesthetic' },
              ]}
              defaultValue="solarpunk_technology"
            />
          </div>

          <div className="space-y-2">
            <Label>Default Voice</Label>
            <Select
              options={[
                { value: 'pNInz6obpgDQGcFmaJgB', label: 'Adam - Professional, warm' },
                { value: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel - Clear, empathetic' },
                { value: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh - Young, energetic' },
                { value: 'MF3mGyEYCl7XYWbV9V6O', label: 'Elli - Friendly, approachable' },
              ]}
              defaultValue="pNInz6obpgDQGcFmaJgB"
            />
          </div>

          <div className="space-y-2">
            <Label>Default Emotional Tone</Label>
            <Select
              options={[
                { value: 'balanced', label: 'Balanced' },
                { value: 'direct', label: 'Direct' },
                { value: 'emotional', label: 'Emotional' },
              ]}
              defaultValue="balanced"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">Generation Complete</p>
              <p className="text-xs text-slate-500">Notify when content generation finishes</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">Low Performance Alert</p>
              <p className="text-xs text-slate-500">Alert when posts fall below 20th percentile</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-200">New Research Available</p>
              <p className="text-xs text-slate-500">Notify when high-credibility sources are found</p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the interface appearance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <motion.button
              className="flex-1 p-4 rounded-lg bg-slate-900 border-2 border-cyan-500 flex flex-col items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600" />
              <span className="text-sm text-slate-200">Dark Mode</span>
              <Badge variant="info">Active</Badge>
            </motion.button>

            <motion.button
              className="flex-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex flex-col items-center gap-2 opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled
            >
              <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300" />
              <span className="text-sm text-slate-400">Light Mode</span>
              <Badge variant="default">Coming Soon</Badge>
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <Button onClick={handleSave} size="lg">
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
