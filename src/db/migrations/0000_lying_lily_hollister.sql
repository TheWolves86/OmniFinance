CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`balance` real NOT NULL,
	`curreny` text NOT NULL,
	`icon` text,
	`color` text,
	`is_default` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bills` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`amount` integer NOT NULL,
	`dueDate` integer NOT NULL,
	`frequency` text,
	`is_paid` integer DEFAULT false NOT NULL,
	`is_subscription` integer DEFAULT false NOT NULL,
	`category_id` text,
	`account_id` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`limit` real NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`type` text NOT NULL,
	`is_default` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`target_amount` real NOT NULL,
	`saved_amount` real NOT NULL,
	`target_date` integer,
	`is_completed` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category_id` text NOT NULL,
	`account_id` text NOT NULL,
	`note` text,
	`payment_method` text,
	`receipt_image` text,
	`tags` text,
	`transaction_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`principal` real NOT NULL,
	`interest_rate` real NOT NULL,
	`monthly_amount` real NOT NULL,
	`remaining_amount` real NOT NULL,
	`total_months` integer NOT NULL,
	`paid_months` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`frequency` text NOT NULL,
	`next_run` integer NOT NULL,
	`last_run` integer,
	`is_active` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settigs` (
	`id` integer PRIMARY KEY NOT NULL,
	`currency` text NOT NULL,
	`theme` text NOT NULL,
	`language` text NOT NULL,
	`ai_provider` text,
	`api` text,
	`biometric_enabled` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`quantity` real NOT NULL,
	`average_price` real NOT NULL,
	`current_price` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`from_account_id` text NOT NULL,
	`to_account_id` text NOT NULL,
	`amount` integer NOT NULL,
	`note` text,
	`transfer_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `insurance` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`policy_name` text NOT NULL,
	`policy_number` text,
	`premium` integer NOT NULL,
	`renewal_date` integer NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_active` integer
);
