import './styles.css';

// Servirá para o login 

const Home = () => {
  return (
    <div className="d-flex">
      <div className="home-container flex-grow-1">
        <div className="home-central-view-container">
          <h1>Bem-vindo ao Painel de Gestão de Projetos</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;



/**
 * d-flex is a Bootstrap class that turns the outer div into a flex container,
 * which is a parent element that has display: flex or display: inline-flex applied to it. 
 * This enables the flex layout model, which provides a flexible and powerful
 * way to control the layout and alignment of its child elements, known as flex items.
 * The flex layout model is particularly useful for creating responsive and flexible layouts
 * that can adapt to different screen sizes and orientations. 
 * It allows you to control the distribution, alignment, and sizing of elements within 
 * a container in a more intuitive and efficient way compared to traditional layout techniques.
 * 
 * flex-grow-1 is a Bootstrap utility class that sets the flex-grow property to 1
 * for the div. This property determines how much the flex item will grow
 * relative to the rest of the flex items in the container. 
 * A value of 1 means that the div will grow to fill the available space in the flex container.
 */
