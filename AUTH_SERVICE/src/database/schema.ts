import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  serial
} from "drizzle-orm/pg-core";

// ---------------------- USERS ----------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").default("null"),
  image: text("image"),
  oauthId: text("oauth_id"),
  verified: boolean("verified").default(false),
  code: integer("code"),
  codeExpirey: timestamp("code_expirey"),
  banned: boolean("banned").default(false),
  rating: integer("rating").default(50),
});

export const userSessions = pgTable("user_sessions", {
  sessionID: uuid("session_id").defaultRandom().primaryKey(),
  userID: uuid("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").default(false),
});

export const match = pgTable("match", {
  id: serial("id").primaryKey(),
  roomID: uuid("room_id").notNull(),
  problemID: integer("problem_id").notNull(),
  winner: text("winner"),
  loser: text("loser"),
  player1: jsonb("player1").notNull(),
  player2: jsonb("player2").notNull(),
  rated: boolean("rated").notNull().default(false),
  totalCases: integer("total_cases").notNull(),
  solution: jsonb("solution"),
  status: text("status").default('ongoing'), // e.g. completed | draw | aborted
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  problemID: integer("problem_id").notNull().unique(),
  title: text("problem_title").notNull(),
  statement: text("problem_description").notNull(),
  input: text("problem_input").notNull(),
  output: text("problem_output").notNull(),
  constraints: text("problem_constraints"),
  testCases: jsonb("problem_testcases").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const marathonMatch = pgTable("marathon_match", {
  id: serial("id").primaryKey(),
  userID: uuid("user_id").notNull().references(() => users.id),
  problems: jsonb("problems").notNull(),
  totalTime: text("total_time").notNull(), // stored as "2:50"
  status: text("status").notNull(), // completed | abandoned
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  resolved: boolean("resolved").notNull().default(false),
  userID: uuid("user_id").notNull().references(() => users.id),
  issueType: text("issue_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  email: text("email"),
  severity: text("severity"), // low | medium | high
  anonymous: boolean("anonymous").notNull().default(false),
  includeScreenshot: boolean("include_screenshot")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});


export const playerStatsHistory = pgTable("player_statistics", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  total_wins: integer("total_wins").notNull().default(0),
  total_losses: integer("total_losses").notNull().default(0),
  total_matches: integer("total_matches").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  rating: integer("rating").notNull().default(0),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
  userID: uuid("user_id").notNull().references(() => users.id),
});