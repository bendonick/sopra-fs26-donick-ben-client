"use client";

// Same imports as the login page
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";

// Define the shape of the registration form fields
interface FormFieldProps {
  username: string;
  password: string;
  bio: string;
}

const Register: React.FC = () => {
  // useRouter allows us to navigate programmatically after registration
  const router = useRouter();

  // useApi gives us a typed wrapper around fetch (GET, POST, PUT, DELETE)
  const apiService = useApi();

  // Ant Design's Form hook — used to control and reset the form
  const [form] = Form.useForm();

  // Persist the auth token in localStorage so it survives page refreshes
  const { set: setToken } = useLocalStorage<string>("token", "");

  // Persist the userId in localStorage so we can redirect to the profile page
  const { set: setUserId } = useLocalStorage<string>("userId", "");

  // Called when the form passes validation and the user clicks Register
  const handleRegister = async (values: FormFieldProps) => {
    try {
      // Call POST /users with the form values (username, password, bio)
      const response = await apiService.post<User>("/users", values);

      // Save the token returned by the server to localStorage
      if (response.token) {
        setToken(response.token);
      }

      // Save the new user's id to localStorage
      if (response.id) {
        setUserId(String(response.id));
      }

      // Redirect to the newly created user's profile page
      router.push(`/users/${response.id}`);
    } catch (error) {
      // Show a human-readable error alert if registration fails
      if (error instanceof Error) {
        alert(`Registration failed:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
        {/* Username field — required */}
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        {/* Password field — uses Input.Password for masked input */}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        {/* Bio field — optional, lets the user introduce themselves */}
        <Form.Item name="bio" label="Bio">
          <Input placeholder="Tell us about yourself (optional)" />
        </Form.Item>

        {/* Submit button — triggers onFinish after form validation */}
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Register
          </Button>
        </Form.Item>

        {/* Link back to login for users who already have an account */}
        <Form.Item>
          <Button type="link" onClick={() => router.push("/login")}>
            Already have an account? Login here
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
