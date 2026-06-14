-- NadorPlay MySQL Database Dump
-- Generated: 2026-06-14 20:33:13
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `users` WRITE;
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `avatar`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('1', 'Admin NadorPlay', 'admin@nadorplay.ma', '+212612345678', NULL, 'admin', NULL, '$2y$12$A2GwK4RMuxzdlhvYSaY0netP4LuDBWt9VcwcyWU0bhJNoCA6N5ULy', NULL, '2026-06-14 17:42:44', '2026-06-14 17:42:44');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `avatar`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('2', 'Guard Hassan', 'guard@nadorplay.ma', '+212623456789', NULL, 'guard', NULL, '$2y$12$Rei7iWJCgP3sCdCE54rRzetnvk24uAezmDcfuxdpdhNLa5Pk1HWCm', NULL, '2026-06-14 17:42:44', '2026-06-14 17:42:44');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `avatar`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('3', 'Nador Football Academy', 'academy@nadorplay.ma', '+212634567890', NULL, 'organization', NULL, '$2y$12$Hewsjn7Iqtk68kRjH/nFAuya7aJ0yBXEMAK.P7uVTJOOCUBBXUgHm', NULL, '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `avatar`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('4', 'Chaymae Player', 'player@nadorplay.ma', '+212645678901', NULL, 'user', NULL, '$2y$12$WPbIC5o8ZQCqBB1C4EEnnuYB0RGh/Vk7Ghxe1/dZaG5cxGeCpCFLW', NULL, '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `fields`;
CREATE TABLE `fields` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(8,2) NOT NULL,
  `surface` varchar(255) NOT NULL,
  `dimensions` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `fields` WRITE;
INSERT INTO `fields` (`id`, `name`, `location`, `description`, `price`, `surface`, `dimensions`, `image`, `status`, `created_at`, `updated_at`) VALUES ('1', 'Marchica Premium Field', 'Marchica Corniche, Nador', 'A premium 11-a-side football field overlooking the Marchica lagoon. Fully illuminated with premium natural grass.', '300.00', 'Natural Grass', '105m x 68m', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', 'available', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `fields` (`id`, `name`, `location`, `description`, `price`, `surface`, `dimensions`, `image`, `status`, `created_at`, `updated_at`) VALUES ('2', 'Al-Amal Mini Football Field', 'Al-Amal District, Nador', 'Perfect for 5-a-side or 7-a-side matches. Premium synthetic turf, enclosed fence, and goal nets.', '150.00', 'Artificial Turf', '40m x 20m', 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80', 'available', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `fields` (`id`, `name`, `location`, `description`, `price`, `surface`, `dimensions`, `image`, `status`, `created_at`, `updated_at`) VALUES ('3', 'Nador Municipal Stadium Arena', 'Nador Center', 'Professional stadium field with spectators seating. High-grade hybrid grass system suitable for tournaments.', '500.00', 'Hybrid Grass', '100m x 64m', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80', 'available', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `fields` (`id`, `name`, `location`, `description`, `price`, `surface`, `dimensions`, `image`, `status`, `created_at`, `updated_at`) VALUES ('4', 'Sidi Ali Mini Turf', 'Sidi Ali, Nador', 'Synthetic turf field ideal for family games and friendly match meetups. Changing rooms and shower facilities available.', '180.00', 'Artificial Turf', '45m x 25m', 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=800&q=80', 'maintenance', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `field_id` bigint(20) unsigned NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `duration` int(11) NOT NULL DEFAULT 1,
  `number_of_players` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_status` varchar(255) NOT NULL DEFAULT 'pending',
  `qr_code` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservations_user_id_foreign` (`user_id`),
  KEY `reservations_field_id_date_time_index` (`field_id`,`date`,`time`),
  CONSTRAINT `reservations_field_id_foreign` FOREIGN KEY (`field_id`) REFERENCES `fields` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `reservations` WRITE;
INSERT INTO `reservations` (`id`, `user_id`, `field_id`, `date`, `time`, `duration`, `number_of_players`, `status`, `payment_status`, `qr_code`, `created_at`, `updated_at`) VALUES ('1', '4', '1', '2026-06-14', '18:00:00', '2', '14', 'confirmed', 'paid', '{\"reservation_id\":1,\"field_id\":1,\"user_id\":4,\"code\":\"c2588438c038ef0fd8b23f6f92c69ad2\"}', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `reservations` (`id`, `user_id`, `field_id`, `date`, `time`, `duration`, `number_of_players`, `status`, `payment_status`, `qr_code`, `created_at`, `updated_at`) VALUES ('2', '4', '2', '2026-06-15', '20:00:00', '1', '10', 'pending', 'pending', '{\"reservation_id\":2,\"field_id\":2,\"user_id\":4,\"code\":\"383e075c99a9ee1da602c7fb72515e41\"}', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `field_id` bigint(20) unsigned NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_user_id_foreign` (`user_id`),
  KEY `reviews_field_id_index` (`field_id`),
  CONSTRAINT `reviews_field_id_foreign` FOREIGN KEY (`field_id`) REFERENCES `fields` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `reviews` WRITE;
INSERT INTO `reviews` (`id`, `user_id`, `field_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES ('1', '4', '1', '5', 'Incredible pitch! Playing by the lagoon with the breeze is an amazing experience. Great lighting at night.', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `reviews` (`id`, `user_id`, `field_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES ('2', '4', '2', '4', 'Good pitch for 5v5. Turf is in great condition, but parking is a bit hard to find.', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint(20) unsigned NOT NULL,
  `field_id` bigint(20) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(8,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_field_id_foreign` (`field_id`),
  KEY `subscriptions_organization_id_index` (`organization_id`),
  CONSTRAINT `subscriptions_field_id_foreign` FOREIGN KEY (`field_id`) REFERENCES `fields` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscriptions_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `subscriptions` WRITE;
INSERT INTO `subscriptions` (`id`, `organization_id`, `field_id`, `start_date`, `end_date`, `total_price`, `status`, `created_at`, `updated_at`) VALUES ('1', '3', '3', '2026-06-14', '2026-09-14', '4500.00', 'active', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `subscription_sessions`;
CREATE TABLE `subscription_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint(20) unsigned NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `session_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscription_sessions_subscription_id_foreign` (`subscription_id`),
  CONSTRAINT `subscription_sessions_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `subscription_sessions` WRITE;
INSERT INTO `subscription_sessions` (`id`, `subscription_id`, `day_of_week`, `session_time`, `created_at`, `updated_at`) VALUES ('1', '1', '1', '17:00:00', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `subscription_sessions` (`id`, `subscription_id`, `day_of_week`, `session_time`, `created_at`, `updated_at`) VALUES ('2', '1', '3', '17:00:00', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned DEFAULT NULL,
  `subscription_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(8,2) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_reservation_id_foreign` (`reservation_id`),
  KEY `payments_subscription_id_foreign` (`subscription_id`),
  CONSTRAINT `payments_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `payments` WRITE;
INSERT INTO `payments` (`id`, `reservation_id`, `subscription_id`, `amount`, `provider`, `transaction_id`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', NULL, '600.00', 'cmi', 'NP-SEEDEDPAY01', 'paid', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
INSERT INTO `payments` (`id`, `reservation_id`, `subscription_id`, `amount`, `provider`, `transaction_id`, `status`, `created_at`, `updated_at`) VALUES ('2', NULL, '1', '4500.00', 'stripe', 'NP-SEEDEDPAY02', 'paid', '2026-06-14 17:42:45', '2026-06-14 17:42:45');
UNLOCK TABLES;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `personal_access_tokens` WRITE;
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('1', 'App\\Models\\User', '4', 'auth_token', '1b043f434c3f7419d6ca5893a9e6b872ea0b5a13c1cfed9ae6581e2602d03891', '[\"*\"]', '2026-06-14 18:29:27', NULL, '2026-06-14 18:04:55', '2026-06-14 18:29:27');
UNLOCK TABLES;

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `sessions` WRITE;
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('nKgloo3n0rwbCMkYAMiXm6fMtipfPKyWOwovnxcK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRjdYOGdxeWcxM2dHcFZ6MHJYczJIOFNDNzh3azgzTUpVV0l2NDRIZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1781461049');
UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS=1;
