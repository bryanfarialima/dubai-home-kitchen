import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const DevTools = () => {
    const { user } = useAuth();

    const copyId = async () => {
        if (!user) return;
        await navigator.clipboard.writeText(user.id);
        alert("User ID copied to clipboard");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border">
                <h2 className="font-display font-bold text-lg mb-4">Dev Tools</h2>
                {user ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Logged in as:</p>
                        <p className="font-mono text-sm break-all">{user.email}</p>
                        <p className="text-xs text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm break-all">{user.id}</p>
                        <div className="flex gap-2">
                            <button onClick={copyId} className="bg-primary text-primary-foreground px-4 py-2 rounded">Copy ID</button>
                        </div>
                        <p className="text-xs text-muted-foreground">Use this ID to promote the user to admin via the promotion script or in the Supabase SQL editor.</p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Not logged in. Please sign in first at /auth</p>
                )}
            </div>
        </div>
    );
};

export default DevTools;
