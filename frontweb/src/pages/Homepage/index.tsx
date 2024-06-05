import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';

import './assets/styles/_variables.scss';

const Home = () => {
  return (
    <div>
      <NavbarFL />
      <SidebarFL />
      <div className="main-view-container">
        <div className="main-card">
            <h1>Conteúdo</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
