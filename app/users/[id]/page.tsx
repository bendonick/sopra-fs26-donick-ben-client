// Displays a single user's profile page at /users/[id]
// Uses the [id] URL segment to fetch the correct user from the API
"use client";
// "use client" is required because we use React hooks and browser APIs (localStorage).
// Read more: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card } from "antd";

const Profile: React.FC = () => {
  // useRouter lets us navigate programmatically (e.g. after logout)
  const router = useRouter();

  // useParams reads dynamic route segments — here we get the [id] from the URL
  const params = useParams();
  const userId = params.id as string;

  // useApi provides a typed wrapper around fetch
  const apiService = useApi();

  // Local state to hold the fetched user object; null while loading
  const [user, setUser] = useState<User | null>(null);

  // Read the auth token from localStorage to check if the user is logged in
  const { value: token, clear: clearToken } = useLocalStorage<string>(
    "token",
    ""
  );

  // Read the logged-in user's id so we can compare it to the profile being viewed.
  // Also destructure `clear` to wipe it on logout.
  const { value: loggedInUserId, clear: clearUserId } = useLocalStorage<string>("userId", "");

  // Auth guard: if no token is present, redirect to /login.
  // We check localStorage directly to avoid redirecting before the hook has loaded.
  useEffect(() => {
    if (typeof window !== "undefined" && (!token || token === "")) {
      const stored = localStorage.getItem("token");
      if (!stored) {
        router.push("/login");
        }
    } }, [token, router]);

  // Fetch the user profile data from GET /users/:id once the component mounts.
  // userId is included in the dependency array so a URL change re-fetches correctly.
  useEffect(() => {
    const fetchUser = async () => {
    try {
        const fetchedUser = await apiService.get<User>(`/users/${userId}`);
        setUser(fetchedUser);
    } catch (error) {
        if (error instanceof Error) {
            // if 401 redirect to login instead of showing alert
            if (error.message.includes("401")) {
                router.push("/login");
            } else {
                alert(`Failed to load user profile:\n${error.message}`);
            }
        } else {
            console.error("An unknown error occurred while fetching the user.");
        }
    }
};

    // Only fetch if we actually have a userId in the URL
    if (userId) {
      fetchUser();
    }
  }, [apiService, userId]);

  // Clears both token and userId from localStorage, then sends the user to /login
  const handleLogout = (): void => {
    clearToken();
    clearUserId();
    router.push("/login");
  };

  return (
    <div className="card-container">
      {/* Card shows a loading spinner while `user` is null (data still in flight) */}
      <Card
        title="User Profile"
        loading={!user}
        className="dashboard-container"
      >
        {user && (
          <>
            {/* Username */}
            <p>
              <strong>Username:</strong> {user.username ?? "—"}
            </p>

            {/* Online / offline status */}
            <p>
              <strong>Status:</strong> {user.status ?? "—"}
            </p>

            {/* Account creation date returned by the API */}
            <p>
              <strong>Member since:</strong> {user.creationDate ?? "—"}
            </p>

            {/* Short bio the user provided at registration */}
            <p>
              <strong>Bio:</strong> {user.bio ?? "—"}
            </p>

            {/* Navigate back to the full users overview */}
            <Button
              onClick={() => router.push("/users")}
              style={{ marginRight: 8 }}
            >
              Back to Users
            </Button>

            {/*
              Edit Password button — only visible when the logged-in user is
              viewing their own profile. We compare the userId stored in
              localStorage against the [id] segment from the URL.
              String() normalises both sides in case one is a number.
            */}
            {String(loggedInUserId) === String(userId) && (
              <Button
                onClick={() => router.push(`/users/${userId}/edit`)}
                style={{ marginRight: 8 }}
              >
                Edit Password
              </Button>
            )}

            {/* Logout: clears localStorage and redirects to /login */}
            <Button type="primary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
