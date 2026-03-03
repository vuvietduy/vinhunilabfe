import { Outlet } from 'react-router-dom';

const TeacherLayout = () => {
  return (
    <div>
      <header>Teacher Header</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
