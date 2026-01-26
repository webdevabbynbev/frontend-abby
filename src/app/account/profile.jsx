"use client";

import React, { useState, useEffect } from "react";
import { AddressList } from ".";
import { EditProfile, NewAddress } from "./popup";
import { getUser } from "@/services/auth";
import { Button, ProfileSkeleton } from "@/components";
import { getInitials } from "@/utils/avatar";
import { supabase } from "@/lib/supabase";

import {
  FaVenus,
  FaMars,
  FaPhone,
  FaEnvelope,
  FaRightFromBracket,
  FaUserXmark,
} from "react-icons/fa6";

export function Profilepage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [avatarImgError, setAvatarImgError] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState("idle");

  // ===============================
  // Load profile
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        const { user: fetchedUser } = await getUser();
        setProfile({ user: fetchedUser || null });
        setAvatarImgError(false);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===============================
  // Test Supabase connection
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase error:", error);
          setSupabaseStatus("error");
        } else {
          console.log("Supabase connected ✅");
          setSupabaseStatus("ok");
        }
      } catch (err) {
        console.error("Supabase unreachable ❌", err);
        setSupabaseStatus("error");
      }
    })();
  }, []);

  if (loading) return <ProfileSkeleton />;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const currentUser = profile?.user ?? null;
  if (!currentUser)
    return <div className="p-4 text-neutral-500">Profile not available.</div>;

  const genderNum = Number(currentUser.gender ?? 0);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(
    "/api/v1",
    "",
  );
  const photoUrl =
    currentUser.photoProfile && apiBase
      ? `${apiBase}/${currentUser.photoProfile}`
      : null;

  const showPhoto = !!photoUrl && !avatarImgError;

  const initials = getInitials({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
  });

  const handleProfileUpdated = async (updated) => {
    if (updated) setProfile((prev) => ({ ...(prev || {}), user: updated }));
    setAvatarImgError(false);
    try {
      const { user: fresh } = await getUser();
      if (fresh) setProfile({ user: fresh });
    } catch {}
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 space-y-4">
      {/* Header */}
      <div className="px-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Profile</h1>

        {supabaseStatus === "ok" && (
          <p className="text-xs text-green-600">Supabase connected</p>
        )}
        {supabaseStatus === "error" && (
          <p className="text-xs text-red-600">Supabase connection failed</p>
        )}
      </div>

      <div className="rounded-4xl bg-white px-6 py-10 space-y-10">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Avatar */}
          <div className="rounded-full h-25 w-25 border-4 flex items-center justify-center bg-neutral-100 overflow-hidden">
            {showPhoto ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover rounded-full"
                onError={() => setAvatarImgError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-neutral-500">
                {initials}
              </span>
            )}
          </div>

          {/* Profile data */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row gap-2 items-center py-4">
              <h2 className="text-lg font-medium">
                {`${currentUser.firstName || ""} ${
                  currentUser.lastName || ""
                }`.trim() || "—"}
              </h2>

              {genderNum === 1 && (
                <span className="flex items-center gap-2 text-blue-400 bg-blue-100 px-2 py-1 rounded-full text-sm">
                  <FaMars /> Male
                </span>
              )}
              {genderNum === 2 && (
                <span className="flex items-center gap-2 text-primary-400 bg-primary-100 px-2 py-1 rounded-full text-sm">
                  <FaVenus /> Female
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-full">
                <FaPhone className="text-neutral-300" />
                {currentUser.phoneNumber || "—"}
              </div>

              <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-full">
                <FaEnvelope className="text-neutral-300" />
                {currentUser.email || "—"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 items-end">
            <EditProfile onProfileUpdated={handleProfileUpdated} />
            <Button variant="tertiary" size="sm">
              Change password
            </Button>
          </div>
        </div>

        {/* Address */}
        <div className="p-4 bg-muted border rounded-2xl space-y-6">
          <div className="flex justify-between">
            <h3 className="font-bold">Address list</h3>
            <NewAddress />
          </div>
          <AddressList />
        </div>
      </div>

      {/* Account management */}
      <div className="p-4 bg-muted border rounded-2xl space-y-6">
        <h3 className="font-bold">Account management</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <FaRightFromBracket />
              <h2 className="font-bold">Sign out?</h2>
            </div>
            <Button variant="primary" size="sm">
              Sign out
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <FaUserXmark />
              <h2 className="font-bold">Deactivate account</h2>
            </div>
            <Button variant="error" size="sm">
              Deactivate account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
