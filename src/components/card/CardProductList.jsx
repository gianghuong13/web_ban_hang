import { Link } from "react-router-dom";

const CardProductList = (props) => {
  const product = props.data;
  // console.log('From cardproductlist:', product);
  return (
    <div className="card">
      <div className="row g-0">
        <div className="col-md-3 text-center">
        <Link to={`/product/detail/${product.id}`}>
          <img src={product.img[0]} className="img-fluid" alt="..." />
        </Link>
        </div>
        <div className="col-md-6">
          <div className="card-body">
            <h6 className="card-subtitle me-2 d-inline">
            <Link to={`/product/detail/${product.id}`} className="text-decoration-none">
              {product.name}
            </Link>
            </h6>
            {product.isNew && (
              <span className="badge bg-success me-2">New</span>
            )}
            {product.isHot && <span className="badge bg-danger me-2">Hot</span>}

            <div>
              {product.star > 0 &&
                Array.from({ length: 5 }, (_, key) => {
                  if (key <= product.star)
                    return (
                      <i
                        className="bi bi-star-fill text-warning me-1"
                        key={key}
                      />
                    );
                  else
                    return (
                      <i
                        className="bi bi-star-fill text-secondary me-1"
                        key={key}
                      />
                    );
                })}
            </div>
              {product.description &&
                product.description.includes("|") === false && (
                  <p className="small mt-2">{product.description.substring(0, 50)}</p>
              )}
              {product.description && product.description.includes("|") && (
                <ul className="mt-2">
                  {product.description.split("|").map((desc, idx) => (
                    <li key={idx}>{desc.substring(0, 50)}</li>
                  ))}
                </ul>
            )}
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-body">
          <div className="mb-2">
            <span className="fw-bold h5">${product.price ? product.price.price : 'Loading...'}</span>
            {product.price && product.price.original > 0 && (
              <del className="small text-muted ms-2">${product.price.original}</del>
            )}
            {(product.price && (product.price.discount > 0 || product.price.discount > 0)) && (
              <span className={`rounded p-1 bg-warning ms-2 small`}>
                -
                {product.price.discount > 0
                  ? product.price.discount + "$"
                  : "$" + product.price.discount}
              </span>
            )}
          </div>
            {product.isFreeShipping && (
              <p className="text-success small mb-2">
                <i className="bi bi-truck" /> Free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardProductList;
