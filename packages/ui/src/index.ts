/**
 * @template/ui — shared type utilities and pure logic used by both web and mobile.
 *
 * Keep this package free of platform-specific dependencies (no next/*, no react-native).
 * UI components that diverge per-platform should live in their respective app.
 */

// Re-export shared constants
export * from './cn';
export * from './format';
