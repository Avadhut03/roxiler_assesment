import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const User = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "" });
  const [ratingForm, setRatingForm] = useState({});
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!token || !user) navigate("/");
  }, [token, user, navigate]);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/stores", {
        params: search,
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };


  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:8000/user/password",
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


  const handleSubmitRating = async (storeId) => {
    const rating = ratingForm[storeId];
    if (!rating || rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }

    try {
      const store = stores.find((s) => s.id === storeId);
      if (store.user_rating) {
        await axios.put(
          `http://localhost:8000/user/stores/${storeId}/ratings`,
          { rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Rating updated!");
      } else {

        await axios.post(
          `http://localhost:8000/user/stores/${storeId}/ratings`,
          { rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Rating submitted!");
      }
      fetchStores(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to submit rating");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <div className="flex gap-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          className="border p-2 rounded flex-1"
          type="text"
          placeholder="Search by Name"
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
        />
        <input
          className="border p-2 rounded flex-1"
          type="text"
          placeholder="Search by Address"
          value={search.address}
          onChange={(e) => setSearch({ ...search, address: e.target.value })}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={fetchStores}
        >
          Search
        </button>
      </div>

 
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Stores</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left">Store Name</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Average Rating</th>
              <th className="px-4 py-2 text-left">Your Rating</th>
              <th className="px-4 py-2 text-left">Submit / Update</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b">
                <td className="px-4 py-2">{store.store_name}</td>
                <td className="px-4 py-2">{store.address}</td>
                <td className="px-4 py-2">{store.avg_rating?.toFixed(1) || "N/A"}</td>
                <td className="px-4 py-2">{store.user_rating || "-"}</td>
                <td className="px-4 py-2 flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="border p-1 rounded w-16"
                    value={ratingForm[store.id] || ""}
                    onChange={(e) =>
                      setRatingForm({ ...ratingForm, [store.id]: parseInt(e.target.value) })
                    }
                  />
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleSubmitRating(store.id)}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default User;
