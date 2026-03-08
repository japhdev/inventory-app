import { useState, useEffect } from "react";
import ProductForm from "./components/ProductForm";
import SellPanel from "./components/SellPanel";
import "./App.css";

/**
 * Main component of the inventory application.
 *
 * This component is responsible for:
 * - Fetching the list of products from the backend API
 * - Displaying products in a structured table
 * - Allowing users to edit or delete products
 * - Refreshing the product list when changes occur
 */
function App() {

  // State to store the list of products fetched from the API
  const [products, setProducts] = useState([]);

  // State to store the product currently selected for editing
  const [productEdit, setProductEdit] = useState(null);

  // State to control the visibility of the low stock alert banner
  const [showBanner, setShowBanner] = useState(true);

  /**
   * Function to fetch all products from the backend API.
   *
   * Makes a GET request to /products and updates the state with the received data.
   * Automatically handles JSON conversion.
   */
  const fetchProducts = () => {
    fetch("http://localhost:8000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };
  /**
   * Function to delete a product from the backend API.
   *
   * Sends a DELETE request to /products/{id}. After the product is deleted,
   * the product list is refreshed by calling fetchProducts().
   */
  const deleteProduct = (id) => {
    fetch(`http://localhost:8000/products/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => fetchProducts());
  };

  /*
    useEffect runs once when the component is mounted.
    It loads the initial list of products from the API.
  */
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="inventory-container">
      {/* Main title of the application */}
      <h1 className="inventory-title">Inventory</h1>

      {/* 
        ProductForm component used for creating or editing products.

        Props:
        - onProductCreate: refreshes the product list after creation
        - productEdit: sends the selected product to the form
        - onCancel: clears the editing state
      */}
      <ProductForm
        onProductCreate={fetchProducts}
        productEdit={productEdit}
        onCancel={() => setProductEdit(null)}
      />

      {/* Low stock alert banner — only visible when there are low stock products */}
      {products.some(p => p.stock <= 3 && p.stock > 0) && (
        <div>
          <button className="btn-toggle-banner" onClick={() => setShowBanner(!showBanner)}>
            ⚠️ Low stock alerts {showBanner ? "▲" : "▼"}
          </button>
          {showBanner && (
            <div className="alert-banner">
              Some products are in low stock. Check back soon.
            </div>
          )}
        </div>
      )}
      <div className="main-layout">
        {/* Table to display products */}
        <table className="products-table">
          {/* Table header with column names */}
          <thead className="table-header">
            <tr>
              <th className="col-id">ID</th>
              <th className="col-name">Name</th>
              <th className="col-price">Price</th>
              <th className="col-stock">Stock</th>
              <th className="col-category">Category</th>
              <th className="col-actions">Actions</th>
              <th className="col-state">State</th>
            </tr>
          </thead>

          {/* Table body with product rows */}
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`table-row ${p.stock <= 3 && p.stock > 0 ? "row-alert" : ""}`}>
                {/* Cells with product information */}
                <td className="table-cell">{p.id}</td>
                <td className="table-cell" title={p.name}>{p.name}</td>
                <td className="table-cell">{p.price}</td>
                <td className="table-cell">{p.stock} {p.stock <= 3 && p.stock > 0 ? "⚠️" : ""}</td>
                <td className="table-cell" title={p.category}>{p.category}</td>

                {/* Action buttons (edit or delete product) */}
                <td>
                  <button className="btn-edit" onClick={() => setProductEdit(p)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>
                </td>
                {/* Product status indicator  */}
                <td>
                  {p.is_active
                    ? <span className="badge-active">●  Active</span>
                    : <span className="badge-inactive">●  Inactive</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <SellPanel products={products} onSaleComplete={fetchProducts} />
      </div>
    </div>
  );
}

// Export the App component as the default export for use in other parts of the application
export default App;
