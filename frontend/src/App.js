import { useState, useEffect } from "react";
import ProductForm from "./components/ProductForm";
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

      {/* Table to display products */}
      <table className="products-table">
        {/* Table header with column names */}
        <thead className="table-header">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Actions</th>
            <th>State</th>
          </tr>
        </thead>

        {/* Table body with product rows */}
        <tbody>
          {products.map((p) => (
            <tr className="table-row" key={p.id}>
              {/* Cells with product information */}
              <td className="table-cell">{p.id}</td>
              <td className="table-cell">{p.name}</td>
              <td className="table-cell">{p.price}</td>
              <td className="table-cell">{p.stock}</td>
              <td className="table-cell">{p.category}</td>

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
    </div>
  );
}

// Export the App component as the default export for use in other parts of the application
export default App;
