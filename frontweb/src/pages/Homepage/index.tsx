import SidebarFL from 'components/Sidebar/indexSidebarRB';


import './styles.css';
import ProjetoTable from 'components/Projeto';
import UserTable from 'components/User';

const Home = () => {
  return (
    <div className="d-flex">
      <div className="home-container flex-grow-1">
        <div >
          <SidebarFL />
        </div>
        <div className="main-view-container">
          <ProjetoTable />
        </div>
      </div>
    </div>
  );
};

export default Home;
