/**
 * Multi-provider AI model factory.
 *
 * Set AI_PROVIDER in .env.local to switch providers:
 *   groq (default) | openai | anthropic | google
 *
 * Set AI_MODEL to override the default model for the selected provider.
 * Set AI_MODEL_FAST to override the fast/cheap model.
 */
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

const PROVIDER = (process.env['AI_PROVIDER'] ?? 'groq').toLowerCase();

const DEFAULTS: Record<string, { model: string; fast: string }> = {
  groq:      { model: 'llama-3.3-70b-versatile',  fast: 'llama-3.1-8b-instant' },
  openai:    { model: 'gpt-4o',                   fast: 'gpt-4o-mini' },
  anthropic: { model: 'claude-sonnet-4-5',         fast: 'claude-haiku-4-5' },
  google:    { model: 'gemini-2.0-flash',          fast: 'gemini-2.0-flash-lite' },
};

const defaults = DEFAULTS[PROVIDER] ?? DEFAULTS['groq']!;

const MODEL_NAME = process.env['AI_MODEL'] ?? defaults.model;
const FAST_NAME  = process.env['AI_MODEL_FAST'] ?? defaults.fast;

function resolveModel(name: string) {
  switch (PROVIDER) {
    case 'openai':    return openai(name);
    case 'anthropic': return anthropic(name);
    case 'google':    return google(name);
    default:          return groq(name);
  }
}

/** Primary model — smart, slightly slower. */
export function getModel() { return resolveModel(MODEL_NAME); }

/** Fast model — cheap, used for summaries and background tasks. */
export function getFastModel() { return resolveModel(FAST_NAME); }

/** Mastra-compatible model string, e.g. "groq/llama-3.3-70b-versatile" */
export function getMastraModel() { return `${PROVIDER}/${MODEL_NAME}`; }
