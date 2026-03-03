import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div>
      <header>Admin Header</header>
      <aside>Admin Sidebar</aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
