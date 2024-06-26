import { Link } from "react-router-dom";

const CardProductGrid = (props) => {
  const product = props.data;
  return (
    <div className="card">
      <img src={product.img[0]} className="card-img-top" alt="..." />
      {product.isNew && (
        <span className="badge bg-success position-absolute mt-2 ms-2">
          New
        </span>
      )}
      {product.isHot && (
        <span className="badge bg-danger position-absolute r-0 mt-2 me-2">
          Hot
        </span>
      )}
      {(product.price && (product.price.discount > 0 || product.price.discount > 0)) && (
      <span
        className={`rounded position-absolute p-2 bg-warning  ms-2 small ${
          product.isNew ? "mt-5" : "mt-2"
        }`}
      >
        -
        {product.price.discount > 0
          ? product.price.discount + "$"
          : "$" + product.price.discount}
      </span>
    )}
      <div className="card-body">
        <h6 className="card-subtitle mb-2">
          <Link to={product.link} className="text-decoration-none">
            {product.name}
          </Link>
        </h6>
        <div className="my-2">
          <span className="fw-bold h5">${product.price ? product.price.price : 'Loading...'}</span>
          {product.price && product.price.original > 0 && (
            <del className="small text-muted ms-2">${product.price.original}</del>
          )}
          <span className="ms-2">
            {Array.from({ length: product.star }, (_, key) => (
              <i className="bi bi-star-fill text-warning me-1" key={key} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardProductGrid;
