import { Outlet } from "react-router-dom";
import AdminSidebar from "../AdminSidebar";
import AdminTopBar from "../AdminTopBar";
import styles from "./AdminLayout.module.css";

const MOCK_USER = {
  name: "Arios",
  role: "Master",
};

function AdminLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar type={"admin"} />
      <div className={styles.content}>
        <AdminTopBar user={MOCK_USER} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
