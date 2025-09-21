import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Owner = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState({ average_rating: 0, total_ratings: 0 });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "" });
  const [sortConfig, setSortConfig] = useState({ key: "user_name", direction: "asc" });

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ;

  useEffect(() => {
    if (!token || !user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  const storeId = user?.storeId;

  const fetchRatings = async () => {
    if (!storeId) return;
    try {
      const res = await axios.get(`http://localhost:8000/owner/stores/${storeId}/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    if (!storeId) return;
    try {
      const res = await axios.get(`http://localhost:8000/owner/stores/${storeId}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRatings();
    fetchSummary();
  }, [storeId]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:8000/owner/password",
        passwordForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setPasswordForm({ old_password: "", new_password: "" });
      setShowPasswordModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update password");
    }
  };

  // Sort table
  const sortedRatings = [...ratings].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Store Owner Dashboard</h1>
        <div className="flex gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Store Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Average Rating</h2>
          <p className="text-xl">{summary.average_rating?.toFixed(1) || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Total Ratings</h2>
          <p className="text-xl">{summary.total_ratings}</p>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">User Ratings</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("user_name")}
              >
                User Name {sortConfig.key === "user_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email {sortConfig.key === "email" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("rating")}
              >
                Rating {sortConfig.key === "rating" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRatings.map((r, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{r.user_name}</td>
                <td className="px-4 py-2">{r.email}</td>
                <td className="px-4 py-2">{r.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form className="space-y-3" onSubmit={handlePasswordUpdate}>
              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="Old Password"
                value={passwordForm.old_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, old_password: e.target.value })
                }
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="New Password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new_password: e.target.value })
                }
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Owner;
