/**
 * Drizzle schema — app-specific tables.
 * Better Auth manages its own tables (user, session, account, verification).
 * Add your domain tables here.
 */
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Example: extend the user profile with app-specific fields
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // matches better-auth user.id (cuid2)
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add your domain tables below:
// export const posts = pgTable('posts', { ... });
