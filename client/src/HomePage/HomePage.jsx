import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/HomePage.module.css';

// Image imports
import farmersLogo from '../images/farmer.jpg';
import vrikshSevakLogo from '../images/vrikshaSevak.jpg';
import adminLogo from '../images/admin.jpg';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <h2 className={styles.heading}>Welcome to the Fruit Tree Planting Lifecycle Management Solution</h2>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link to="/login" className={styles.navLink}>
              <img src={farmersLogo} alt="Farmers Portal" className={styles.portalLogo} />
              Farmers Portal
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/login" className={styles.navLink}>
              <img src={vrikshSevakLogo} alt="Vriksh Sevak Portal" className={styles.portalLogo} />
              Vriksh Sevak Portal
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link to="/login" className={styles.navLink}>
              <img src={adminLogo} alt="Admin Portal" className={styles.portalLogo} />
              Admin Portal
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;