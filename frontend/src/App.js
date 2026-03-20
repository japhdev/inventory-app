import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductForm from "./components/ProductForm";
import SellPanel from "./components/SellPanel";
import FilterPanel from "./components/FilterPanel"
import Login from "./pages/Login";
import Register from "./pages/Register"
import "./App.css";

/**
 * Main component of the inventory application.
 *
 * This component is responsible for:
 * - Fetch and display all products from the backend
 * - Apply filters and sorting to the product list
 * - Handle product creation, editing, and deletion
 * - Display low stock alerts
 * - Show the sell panel and filter panel
 */
function Inventory() {

  // State to store the list of products fetched from the API
  const [products, setProducts] = useState([]);

  // State to store the product currently selected for editing
  const [productEdit, setProductEdit] = useState(null);

  // State to control the visibility of the low stock alert banner
  const [showBanner, setShowBanner] = useState(true);

  // List of categories fetched from the API
  const [categories, setCategories] = useState([]);

  // Active filter values
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    sortBy: ""
  });

  //Username of the logged-in user, stored during login
  const username = localStorage.getItem("username");

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
   * Fetches all categories from the backend API.
   * Used to populate the filter panel dropdown.
   */
  const fetchCategories = () => {
    fetch("http://localhost:8000/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
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

  /**
   * Logs out the current user by clearing localStorage
   * and redirecting to the login page.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  /**
   * Resets all filters to their default empty values.
   */
  const handleClearFilters = () => {
    setFilters({ search: "", category: "", status: "", sortBy: "" });
  };

  /**
   * Returns a filtered and sorted copy of the products array
   * based on the current filter state.
   */
  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchCategory = filters.category ? p.category === filters.category : true;
      const matchStatus = filters.status === "active" ? p.is_active :
        filters.status === "inactive" ? !p.is_active : true;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (filters.sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (filters.sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (filters.sortBy === "price_asc") return a.price - b.price;
      if (filters.sortBy === "price_desc") return b.price - a.price;
      if (filters.sortBy === "stock_asc") return a.stock - b.stock;
      if (filters.sortBy === "stock_desc") return b.stock - a.stock;
      return 0;
    });

  // Load products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="inventory-container">

      {/* Filter Panel */}
      <FilterPanel
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Sell Panel */}
      <SellPanel products={products} onSaleComplete={fetchProducts} />

      {/* Central content */}
      <div className="inventory-header">
        <h1 className="inventory-title">Inventory</h1>
        <div className="header-user">
          <span>{username}</span>
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

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
              <th className="col-sku">SKU</th>
              <th className="col-name">Name</th>
              <th className="col-category">Category</th>
              <th className="col-price">Price</th>
              <th className="col-stock">Stock</th>
              <th className="col-state">State</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>

          {/* Table body with product rows */}
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className={`table-row ${p.stock <= 3 && p.stock > 0 ? "row-alert" : ""}`}>
                {/* Cells with product information */}
                <td className="table-cell">#{p.id}</td>
                <td className="table-cell">{p.sku}</td>
                <td className="table-cell" title={p.name}>{p.name}</td>
                <td className="table-cell" title={p.category}>{p.category}</td>
                <td className="table-cell">$ {p.price}</td>
                <td className="table-cell">{p.stock} {p.stock <= 3 && p.stock > 0 ? "⚠️" : ""}</td>
                <td>
                  {p.is_active
                    ? <span className="badge-active">●  Active</span>
                    : <span className="badge-inactive">●  Inactive</span>
                  }
                </td>
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

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * App component — root of the application.
 *
 * Manages authentication state and defines public/protected routes.
 * - /login → Login page (public)
 * - /register → Register page (public)
 * - / → Inventory page (protected, requires token)
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Export the App component as the default export for use in other parts of the application
export default App;
