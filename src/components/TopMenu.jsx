import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TopMenu = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/categories')
      .then(response => response.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-0">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Women's Fashion
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <button
                className="btn nav-link dropdown-toggle fw-bold"
                id="navbarDropdown"
                data-toggle="dropdown"
                aria-expanded="false"
                data-bs-toggle="dropdown"
              >
                Menu
              </button>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link className="dropdown-item" to={`/category/${category.id}`} onClick={() => window.location.href=`/category/${category.id}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/account/signin">
              Sign In
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/account/signup">
                Sign Up
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category" onClick={() => window.location.href=`/category`}>
                Fashion
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/category">
                Supermarket
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category">
                Electronics
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category">
                Furniture
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category">
                Garden & Outdoors
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/category">
                Jewellery
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/documentation">
                Documentation
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default TopMenu;
