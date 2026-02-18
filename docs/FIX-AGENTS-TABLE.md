# Fix: Add operator_address column to agents table

The agents table is missing the `operator_address` column that the API expects.

## Run this SQL in your Neon dashboard:

```sql
ALTER TABLE agents ADD COLUMN IF NOT EXISTS operator_address TEXT;
```

## Verify:

```sql
\d agents
-- should show operator_address column
```
