import SidebarFL from 'components/Sidebar/indexSidebarRB';

import './styles.css';
import UserTable from 'components/User';

const Home = () => {
  return (
    <div className="d-flex">
      <div>
        <SidebarFL />
      </div>
      <div className="ms-4 flex-grow-1">
        <div className="main-view-container">
          <UserTable />
        </div>
      </div>
    </div>
  );
};

export default Home;
