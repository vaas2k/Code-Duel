CREATE TABLE "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"user_id" uuid NOT NULL,
	"issue_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"email" text,
	"severity" text,
	"anonymous" boolean DEFAULT false NOT NULL,
	"include_screenshot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marathon_match" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"problems" jsonb NOT NULL,
	"total_time" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"problem_id" integer NOT NULL,
	"winner" text,
	"loser" text,
	"player1" jsonb NOT NULL,
	"player2" jsonb NOT NULL,
	"rated" boolean DEFAULT false NOT NULL,
	"total_cases" integer NOT NULL,
	"solution" jsonb,
	"status" text DEFAULT 'ongoing',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"total_wins" integer DEFAULT 0 NOT NULL,
	"total_losses" integer DEFAULT 0 NOT NULL,
	"total_matches" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"problem_id" integer NOT NULL,
	"problem_title" text NOT NULL,
	"problem_description" text NOT NULL,
	"problem_input" text NOT NULL,
	"problem_output" text NOT NULL,
	"problem_constraints" text,
	"problem_testcases" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "problems_problem_id_unique" UNIQUE("problem_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"revoked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text DEFAULT 'null',
	"image" text,
	"oauth_id" text,
	"verified" boolean DEFAULT false,
	"code" integer,
	"code_expirey" timestamp,
	"banned" boolean DEFAULT false,
	"rating" integer DEFAULT 50,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marathon_match" ADD CONSTRAINT "marathon_match_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;