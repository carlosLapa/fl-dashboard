import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';

import './assets/styles/_variables.scss';
import './App.css';
import UserTable from 'components/User';

function App() {
  return (
    <>
      <NavbarFL />
      <div className="d-flex">
      <div>
        <SidebarFL />
      </div>
      <div className="ms-4 flex-grow-1">
        <UserTable />
      </div>
    </div>
    </>
  );
}

export default App;
