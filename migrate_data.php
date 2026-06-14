<?php
/**
 * Data Migration Script: SQLite -> MySQL (NadorPlay)
 * 
 * This script connects to the local SQLite database and migrates all existing
 * records into the MySQL database, ensuring keys, values, and relations are preserved.
 */

try {
    $sqlitePath = __DIR__ . "/backend/database/database.sqlite";
    
    // Connect to SQLite
    if (!file_exists($sqlitePath)) {
        throw new Exception("SQLite database file not found at: $sqlitePath");
    }
    $sqlite = new PDO("sqlite:" . $sqlitePath);
    $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Connect to MySQL
    $mysql = new PDO("mysql:host=127.0.0.1;port=3307;dbname=nadorplay", "root", "");
    $mysql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to both SQLite and MySQL successfully.\n";

    // Disable foreign keys temporarily during load
    $mysql->exec("SET FOREIGN_KEY_CHECKS = 0;");

    $tables = [
        'users',
        'fields',
        'reservations',
        'reviews',
        'subscriptions',
        'subscription_sessions',
        'payments',
        'notifications',
        'personal_access_tokens',
        'cache',
        'sessions'
    ];

    foreach ($tables as $table) {
        // Clear MySQL table first
        $mysql->exec("TRUNCATE TABLE `$table`;");
        
        // Fetch rows from SQLite
        $stmt = $sqlite->query("SELECT * FROM `$table` ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($rows) === 0) {
            echo "Table `$table` is empty. Skipping.\n";
            continue;
        }

        // Prepare insert query
        $columns = array_keys($rows[0]);
        $colList = implode('`, `', $columns);
        $placeholders = implode(', ', array_map(fn($col) => ":$col", $columns));
        
        $insertStmt = $mysql->prepare("INSERT INTO `$table` (`$colList`) VALUES ($placeholders)");
        
        $mysql->beginTransaction();
        foreach ($rows as $row) {
            $insertStmt->execute($row);
        }
        $mysql->commit();
        
        echo "Migrated " . count($rows) . " rows for table `$table`.\n";
    }

    // Re-enable foreign keys
    $mysql->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "\n=== Migration completed successfully! ===\n";

} catch (Exception $e) {
    if (isset($mysql) && $mysql->inTransaction()) {
        $mysql->rollBack();
    }
    echo "Migration error: " . $e->getMessage() . "\n";
    exit(1);
}
