CREATE UNIQUE INDEX `enrollments_user_id_course_id_unique` ON `enrollments` (`user_id`,`course_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_progress_user_id_lesson_id_unique` ON `user_progress` (`user_id`,`lesson_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_watch_logs_user_id_lesson_id_unique` ON `video_watch_logs` (`user_id`,`lesson_id`);