import { useEffect, useState } from "react";
import axiosInstance from "@/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import styles from '../../styles/admin/userManager.module.css';

export default function AdminUserPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", image: null });
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  useEffect(() => {
    if (!loading) {
      if (user?.role === "admin") {
        fetchUsers();
      } else {
        router.replace("/");
        return;
      }
    }
  }, [loading, user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name || "", role: user.role || "", image: null });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("role", formData.role);
    if (formData.image) form.append("image", formData.image);

    try {
      await axiosInstance.put(`/auth/${selectedUser.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/auth/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  // Filtered users based on search term
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || user?.role !== "admin") return <p>Loading or Unauthorized</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin - Manage Users</h1>

      {/* Search Bar */}
      <div className={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className={styles.noUsers}>No users found matching your search.</p>
      ) : (
        filteredUsers.map((u) => ( // Use filteredUsers here
          <div key={u.id} className={styles.userCard}>
            {u.imageUrl && (
              <img
                src={u.imageUrl.startsWith("http") ? u.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${u.imageUrl}`}
                alt="avatar"
                className={styles.avatar}
              />
            )}
            <div className={styles.userInfo}>
              <p className={styles.userName}>
                <strong>{u.name}</strong> ({u.email})
              </p>
              <p className={styles.userRole}>Role: {u.role}</p>
            </div>
            <div className={styles.actions}>
              <button className={`${styles.button} ${styles.editButton}`} onClick={() => openModal(u)}>
                Edit
              </button>
              <button
                className={`${styles.button} ${styles.deleteButton}`}
                onClick={() => handleDelete(u.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalHeading}>Edit User</h2>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.label}>Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={styles.selectField}
              >
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="image" className={styles.label}>Image</label>
              <input
                id="image"
                type="file"
                name="image"
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={`${styles.modalButton} ${styles.saveButton}`} onClick={handleSave}>
                Save
              </button>
              <button className={`${styles.modalButton} ${styles.cancelButton}`} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}