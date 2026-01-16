"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompleteSignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUsernameMutation = useMutation(api.users.setUsername);
  const usernameCheck = useQuery(
    api.users.checkUsernameAvailable,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 300);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !usernameCheck?.available) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await setUsernameMutation({ username: username.trim() });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set username");
      setIsSubmitting(false);
    }
  };

  const isValid = username.length >= 3 && usernameCheck?.available;
  const showValidation = username.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Choose your username</h1>
          <p className="text-muted-foreground">
            Pick a unique username for your profile. This will be visible to other users.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className={cn(
                  "pr-10",
                  showValidation && (isValid ? "border-green-500 focus-visible:ring-green-500" : "border-destructive focus-visible:ring-destructive")
                )}
                maxLength={20}
                autoFocus
              />
              {showValidation && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {debouncedUsername !== username ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : usernameCheck === undefined ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isValid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {showValidation && usernameCheck && !usernameCheck.available && usernameCheck.reason && (
              <p className="text-sm text-destructive">{usernameCheck.reason}</p>
            )}
            {username.length > 0 && username.length < 3 && (
              <p className="text-sm text-destructive">Username must be at least 3 characters</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up your profile...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
