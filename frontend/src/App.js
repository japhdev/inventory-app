import { useState, useEffect } from "react";
import ProductForm from "./components/ProductForm";
import "./App.css"

/**
 * Main component of the inventory application.
 *
 * This component displays a table with all available products
 * obtained from the backend API. It includes functionalities to:
 * - Fetch the list of products from the server
 * - Display products in an organized table
 * - Automatically update the list when the component loads
 */
function App() {

  // State to store the list of products fetched from the API
  const[products, setProducts] = useState([]);

  /**
   * Function to fetch all products from the backend API.
   *
   * Makes a GET request to /products and updates the state with the received data.
   * Automatically handles JSON conversion.
   */
  const fetchProducts = () => {
    fetch("http://localhost:8000/products")
    .then(res => res.json())
    .then(data => setProducts(data))
  };

  const deleteProduct = (id) => {
  fetch(`http://localhost:8000/products/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => fetchProducts());
  };

  // useEffect hook to load products when the component mounts
  useEffect(() =>{
    fetchProducts();
  }, []);

  return(
    <div className="inventory-container">
      {/* Main title of the application */}
      <h1 className="inventory-title">Inventory</h1>

      {/* ProductForm component for adding new products */}
      {/* onProductCreate prop passes fetchProducts function to refresh the product list after creation */}
      <ProductForm onProductCreate={fetchProducts}/>

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
          </tr>
        </thead>

        {/* Table body with product rows */}
        <tbody>
          {products.map(p =>(
            <tr  className="table-row" key={p.id}>
              {/* Cells with product information */}
              <td className="table-cell">{p.id}</td>
              <td className="table-cell">{p.name}</td>
              <td className="table-cell">{p.price}</td>
              <td className="table-cell">{p.stock}</td>
              <td className="table-cell">{p.category}</td>
              <td>
        <button className ="btn-delete"onClick={() => deleteProduct(p.id)}>Delete</button>
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