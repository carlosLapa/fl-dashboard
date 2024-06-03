import './assets/styles/_variables.scss';
import './App.css';
import Navbar from 'components/Navbar';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';

function App() {
  return (
    <>
      <NavbarFL />
      <SidebarFL />
    </>
  );
}

export default App;
