import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homepage from 'pages/Homepage';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import UserTable from 'components/User';
import SidebarFL from 'components/Sidebar/indexSidebarRB';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <NavbarFL />
      <SidebarFL />
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
      <Routes>
        <Route path="/users" element={<UserTable />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
