#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const MIGRATION_FILE = path.resolve(process.cwd(), 'supabase/migrations/20260211021034_13e5554c-4b4e-4f55-84bb-cbdfa1d327e3.sql');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing VITE_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
}

const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function run() {
    try {
        console.log('Applying migration file:', MIGRATION_FILE);
        // Try running the whole SQL in one request
        try {
            const res = await supabase.postgres.query(sql);
            console.log('Migration query result:', res);
        } catch (errWhole) {
            console.warn('Could not run entire SQL at once, attempting statement-by-statement...', errWhole?.message || errWhole);
            // Fallback: split by semicolon and run statements individually
            const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
            for (const stmt of statements) {
                try {
                    console.log('Running statement:', stmt.slice(0, 80).replace(/\n/g, ' '));
                    const r = await supabase.postgres.query(stmt);
                    console.log('OK');
                } catch (e) {
                    console.error('Statement failed:', e?.message || e);
                    // continue to surface errors but don't stop immediately
                }
            }
        }

        console.log('Migration applied (attempted).');
    } catch (err) {
        console.error('Unexpected error applying migrations:', err);
        process.exit(1);
    }
}

run();
