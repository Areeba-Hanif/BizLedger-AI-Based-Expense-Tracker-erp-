import API from "./api";

export const registerUser = async (userData) => {
  const res = await API.post("/register", userData);
  return res.data;
};

export const loginUser = async (userData) => {
  const res = await API.post("/login", userData);
  if (res.data.token) {
    localStorage.setItem("token", res.data.token); // ✅ Save token for future requests
  }
  return res.data;
};
export const getProfile = async () => {
  const res = await API.get("/profile");
  return res.data;
};



