import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [totals, setTotals] = useState({ users: 0, stores: 0, ratings: 0 });

 
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

 
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  const token = localStorage.getItem("token");

  
  const fetchTotals = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotals({
        users: res.data.totalUsers,
        stores: res.data.totalStores,
        ratings: res.data.totalRatings,
      });
    } catch (err) {
      console.error(err);
    }
  };

 
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTotals();
    fetchUsers();
    fetchStores();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/admin/users", userForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserForm({ name: "", email: "", password: "", address: "", role: "USER" });
      setShowUserModal(false);
      fetchUsers();
      fetchTotals();
      alert("User added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add user.");
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/admin/stores", storeForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStoreForm({ name: "", email: "", address: "", ownerId: "" });
      setShowStoreModal(false);
      fetchStores();
      fetchTotals();
      alert("Store added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add store.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
     
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Total Users</h2>
          <p className="text-xl">{totals.users}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Total Stores</h2>
          <p className="text-xl">{totals.stores}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Total Ratings</h2>
          <p className="text-xl">{totals.ratings}</p>
        </div>
      </div>

      
      <div className="flex gap-4 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          onClick={() => setShowUserModal(true)}
        >
          Add User
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          onClick={() => setShowStoreModal(true)}
        >
          Add Store
        </button>
      </div>

      
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form className="space-y-3" onSubmit={handleAddUser}>
              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Address"
                value={userForm.address}
                onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                required
              />
              <select
                className="w-full border p-2 rounded"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Store Owner</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Store</h2>
            <form className="space-y-3" onSubmit={handleAddStore}>
              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Store Name"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="email"
                placeholder="Email"
                value={storeForm.email}
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="text"
                placeholder="Address"
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="number"
                placeholder="Owner ID (optional)"
                value={storeForm.ownerId}
                onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowStoreModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.address}</td>
                <td className="px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Stores</h2>
        <table className="min-w-full border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left">Store Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Avg Rating</th>
              <th className="px-4 py-2 text-left">Rating Count</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b">
                <td className="px-4 py-2">{store.name}</td>
                <td className="px-4 py-2">{store.email}</td>
                <td className="px-4 py-2">{store.address}</td>
                <td className="px-4 py-2">{store.averageRating || 0}</td>
                <td className="px-4 py-2">{store.ratings?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
