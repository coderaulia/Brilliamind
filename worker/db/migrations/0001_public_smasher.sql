CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`user_id` text,
	`anonymous_id` text,
	`course_id` text,
	`lesson_id` text,
	`path` text,
	`referrer` text,
	`ip_country` text,
	`properties_json` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `enrollments` ADD `milestone_50_sent_at` text;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `milestone_100_sent_at` text;