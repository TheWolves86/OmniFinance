CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL
);
