import SidebarFL from 'components/Sidebar/indexSidebarRB';


import './styles.css';
import ProjetoTable from 'components/Projeto';
import UserTable from 'components/User';

// talvez deslocar a sidebar para a AppRoutes, 
// dado que estará sempre presente, tal como a navbar

const Home = () => {
  return (
    <div className="d-flex">
      <div className="home-container flex-grow-1">
        <div className="main-view-container">
          <ProjetoTable />
        </div>
      </div>
    </div>
  );
};

export default Home;
