"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "~/lib/supabase/client";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Sign in failed", { description: error.message });
          return { success: false, error };
        }

        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
        return { success: true, error: null };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error("Sign in failed", { description: message });
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth, router],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          toast.error("Sign up failed", { description: error.message });
          return { success: false, error, needsConfirmation: false };
        }

        toast.success("Check your email!", {
          description: "We sent you a confirmation link.",
        });
        return { success: true, error: null, needsConfirmation: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error("Sign up failed", { description: message });
        return { success: false, error, needsConfirmation: false };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth],
  );

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/app`,
        },
      });

      if (error) {
        toast.error("Google sign in failed", { description: error.message });
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Google sign in failed", { description: message });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Sign out failed", { description: error.message });
        return { success: false, error };
      }

      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
      return { success: true, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Sign out failed", { description: message });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth, router]);

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isLoading,
  };
}
