import React, { useState } from "react";
import axios from "axios";

const signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        password,
      });
      setMessage("Signup successful! Please login now.");
      console.log("User Registered:", data);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-md rounded-2xl p-8 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Sign Up</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>

        {message && <p className="mt-3 text-center text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
};

export default signup;
