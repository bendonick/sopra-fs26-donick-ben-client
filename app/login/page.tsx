"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  // hook to save token to localStorage
  const { set: setToken } = useLocalStorage<string>("token", "");
  // hook to save userId to localStorage so we can navigate to profile page
  const { set: setUserId } = useLocalStorage<string>("userId", "");

  const handleLogin = async (values: FormFieldProps) => {
    try {
      // call POST /login with username and password
      const response = await apiService.post<User>("/login", values);

      // save token and userId to localStorage if login successful
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(String(response.id));
      }

      // navigate to the user's own profile page
      router.push(`/users/${response.id}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Login failed:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        {/* username field */}
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        {/* password field - replaces the name field from the template */}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>

        {/* link to registration page for new users */}
        <Form.Item>
          <Button type="link" onClick={() => router.push("/register")}>
            No account yet? Register here
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;