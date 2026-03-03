// Edit password page at /users/[id]/edit
// Allows the logged-in user to change their password, then logs them out.
"use client";
// "use client" disables SSR so we can use React hooks and browser APIs (localStorage).

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";

// Shape of the edit form — only a new password is needed
interface FormFieldProps {
  password: string;
}

const EditPassword: React.FC = () => {
  // Programmatic navigation (cancel → profile, success → /login)
  const router = useRouter();

  // Read the [id] segment from the URL — this is the profile being edited
  const params = useParams();
  const userId = params.id as string;

  // Typed fetch wrapper
  const apiService = useApi();

  // Ant Design form instance for controlled submission
  const [form] = Form.useForm();

  // Auth token — used to guard the page; cleared on successful password change
  const { value: token, clear: clearToken } = useLocalStorage<string>(
    "token",
    ""
  );

  // Stored userId — cleared alongside the token on logout
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  // Auth guard: if there is no token in localStorage, send the user to /login.
  // Runs on first render and whenever `token` changes (e.g. after clearToken()).
  useEffect(() => {
    if (typeof window !== "undefined" && (!token || token === "")) {
      const stored = localStorage.getItem("token");
      if (!stored) {
        router.push("/login");
      }
    }
  }, [token, router]);

  // Called when the form passes validation and the user clicks "Save Password"
  const handleSubmit = async (values: FormFieldProps) => {
    try {
      // PUT /users/:id with the new password — backend updates the credential
      await apiService.put(`/users/${userId}`, { password: values.password });

      // On success, invalidate the session: clear both token and userId
      clearToken();
      clearUserId();

      // Redirect to login so the user authenticates with their new password
      router.push("/login");
    } catch (error) {
      // Show a human-readable error if the update failed
      if (error instanceof Error) {
        alert(`Password update failed:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during password update.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="editPassword"
        size="large"
        variant="outlined"
        onFinish={handleSubmit}
        layout="vertical"
      >
        {/* New password field — masked input */}
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ required: true, message: "Please enter a new password!" }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        {/* Submit button — triggers form validation then calls handleSubmit */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            style={{ marginRight: 8 }}
          >
            Save Password
          </Button>

          {/* Cancel button — discards changes and goes back to the user's profile */}
          <Button onClick={() => router.push(`/users/${userId}`)}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditPassword;
