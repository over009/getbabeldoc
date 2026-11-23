-- Early-bird addresses for the paid plan. Chart rows are not stored.
CREATE TABLE IF NOT EXISTS early_access (
  email TEXT PRIMARY KEY,
  tool TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Hourly request counts, keyed by a hash of the client IP. The address itself is not stored.
CREATE TABLE IF NOT EXISTS early_access_hits (
  ip_hash TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  PRIMARY KEY (ip_hash, bucket)
);
