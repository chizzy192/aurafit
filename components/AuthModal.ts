// src/components/AuthModal.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! Check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setMessage(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return isOpen
    ? React.createElement(
        "div",
        { className: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" },
        React.createElement(
          "div",
          { className: "bg-white border border-brand-pink/60 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200" },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 text-lg font-bold",
            },
            "✕"
          ),
          React.createElement(
            "div",
            { className: "text-center space-y-1 mb-6" },
            React.createElement(
              "span",
              { className: "text-xs uppercase tracking-widest text-brand-rose font-bold" },
              "AuraFit Concierge"
            ),
            React.createElement(
              "h3",
              { className: "text-2xl font-bold text-brand-darkRose" },
              isSignUp ? "Create Your Account" : "Welcome Back"
            ),
            React.createElement(
              "p",
              { className: "text-xs text-neutral-500" },
              "Save custom routines, event lookbooks & virtual fittings."
            )
          ),
          message &&
            React.createElement(
              "div",
              { className: "mb-4 p-3 bg-brand-light border border-brand-pink text-brand-darkRose text-xs rounded-xl text-center" },
              message
            ),
          React.createElement(
            "form",
            { onSubmit: handleAuth, className: "space-y-4" },
            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-xs font-semibold text-neutral-600 mb-1" },
                "EMAIL ADDRESS"
              ),
              React.createElement("input", {
                type: "email",
                value: email,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
                required: true,
                className: "w-full px-4 py-2.5 bg-neutral-50 border border-brand-pink/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose",
                placeholder: "you@example.com",
              })
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "label",
                { className: "block text-xs font-semibold text-neutral-600 mb-1" },
                "PASSWORD"
              ),
              React.createElement("input", {
                type: "password",
                value: password,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
                required: true,
                className: "w-full px-4 py-2.5 bg-neutral-50 border border-brand-pink/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose",
                placeholder: "••••••••",
              })
            ),
            React.createElement(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "w-full py-3 bg-brand-rose hover:bg-brand-darkRose text-white font-medium rounded-xl text-sm transition shadow disabled:opacity-50",
              },
              loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"
            )
          ),
          React.createElement(
            "div",
            { className: "mt-6 text-center text-xs text-neutral-500" },
            isSignUp ? "Already have an account?" : "Don't have an account yet?",
            " ",
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => setIsSignUp(!isSignUp),
                className: "text-brand-darkRose font-bold hover:underline",
              },
              isSignUp ? "Sign In" : "Create Account"
            )
          )
        )
      )
    : null;
};