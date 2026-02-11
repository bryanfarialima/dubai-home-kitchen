#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing VITE_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in environment.');
    console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment and rerun.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const userId = process.argv[2];

async function listUsers() {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.error('Error listing users:', error.message || error);
            process.exit(1);
        }
        return data.users || [];
    } catch (err) {
        console.error('Unexpected error listing users:', err);
        process.exit(1);
    }
}

async function promote(id) {
    try {
        // First, try to set user metadata role via admin API (works even if custom tables not present)
        try {
            const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(id, {
                user_metadata: { role: 'admin' },
            });
            if (updateError) {
                console.warn('Could not update user metadata:', updateError.message || updateError);
            } else {
                console.log('User metadata updated (role=admin):', updatedUser?.id || id);
            }
        } catch (e) {
            console.warn('Admin updateUserById not available or failed:', e?.message || e);
        }

        // Then, try to insert into user_roles table if it exists
        const { data, error } = await supabase.from('user_roles').insert({ user_id: id, role: 'admin' });
        if (error) {
            console.error('Error inserting into user_roles (table may be missing):', error.message || error);
            return;
        }
        console.log('User promoted to admin (user_roles):', data);
    } catch (err) {
        console.error('Unexpected error promoting user:', err);
        process.exit(1);
    }
}

async function run() {
    if (userId) {
        await promote(userId);
        return;
    }

    const users = await listUsers();
    if (users.length === 0) {
        console.log('No users found in this Supabase project.');
        return;
    }

    console.log('Found users:');
    users.forEach((u) => console.log(u.id, u.email));

    if (users.length === 1) {
        console.log('\nOne user found — promoting automatically.');
        await promote(users[0].id);
    } else {
        console.log('\nMultiple users found. Rerun the script with the desired user id:');
        console.log('node scripts/promote_admin.js <user_id>');
    }
}

run();
