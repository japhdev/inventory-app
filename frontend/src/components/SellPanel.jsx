import { useState, useEffect } from "react";

/**
 * SellPanel component
 * Side panel to search products and register sales
 */
function SellPanel({ products, onSaleComplete }) {
    // State for the search input value
    const [search, setSearch] = useState("");

    // State for the currently selected product
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State for the quantity to sell
    const [quantity, setQuantity] = useState(1);

    // State for error messages
    const [error, setError] = useState("");

    // State for success messages
    const [success, setSuccess] = useState("");

    // State for the list of recent sales
    const [recentSales, setRecentSales] = useState([]);

    // Filter active products that match the search term
    const filtered = products.filter(
        (p) => p.name.toLowerCase().includes(search.toLowerCase()) && p.is_active,
    );

    // Fetch the 10 most recent sales from the API
    const fetchRecentSales = () => {
        fetch("http://localhost:8000/sales")
            .then((res) => res.json())
            .then((data) => setRecentSales(data.slice(0, 10)));
    };

    // Fetch recent sales once when the component mounts
    useEffect(() => {
        fetchRecentSales();
    }, []);

    // Handle product selection from the dropdown
    const handleSelect = (product) => {
        setSelectedProduct(product);
        setSearch(product.name);
        setError("");
        setSuccess("");
        setQuantity(1);
    };

    // Handle sale confirmation
    const handleSell = () => {
        // Do nothing if no product is selected
        if (!selectedProduct) return;

        // Validate that quantity is at least 1
        if (quantity < 1) {
            setError("Quantity must be at least 1");
            return;
        }

        // Validate that there is enough stock available
        if (quantity > selectedProduct.stock) {
            setError(`Not enough stock. Available: ${selectedProduct.stock}`);
            return;
        }

        // Send PUT request to register the sale
        fetch(
            `http://localhost:8000/products/${selectedProduct.id}/sell?quantity=${quantity}`,
            {
                method: "PUT",
            },
        )
            .then((res) => res.json())
            .then(() => {
                // Show success message and reset the form fields
                setSuccess(`Sale registered for ${selectedProduct.name}`);
                setSelectedProduct(null);
                setSearch("");
                setQuantity(1);

                // Refresh the product list in the parent component
                onSaleComplete();

                // Refresh the recent sales list
                fetchRecentSales();
            });
    };

    return (
        <div className="sell-panel">
            <h2 className="sell-panel-title">Sell</h2>

            {/* Search input to find products by name */}
            <input
                className="sell-search"
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedProduct(null);
                    setError("");
                    setSuccess("");
                }}
            />

            {/* Dropdown list of filtered products */}
            {search && !selectedProduct && filtered.length > 0 && (
                <ul className="sell-dropdown">
                    {filtered.map((p) => (
                        <li
                            key={p.id}
                            className="sell-dropdown-item"
                            onClick={() => handleSelect(p)}
                        >
                            <span>{p.name}</span>
                            <span className="sell-dropdown-stock">Stock: {p.stock}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Selected product details */}
            {selectedProduct && (
                <div className="sell-product-info">
                    <p>
                        <strong>Product:</strong> {selectedProduct.name}
                    </p>
                    <p>
                        <strong>Current stock:</strong> {selectedProduct.stock}
                    </p>
                    <p>
                        <strong>Price:</strong> ${selectedProduct.price}
                    </p>
                </div>
            )}

            {/* Quantity input for the sale */}
            <div className="sell-quantity">
                <label>Quantity sold:</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
            </div>

            {/* Error message display */}
            {error && <p className="sell-error">{error}</p>}

            {/* Success message display */}
            {success && <p className="sell-success">{success}</p>}

            {/* Confirm sale button — disabled if no product is selected */}
            <button
                className="btn-sell"
                onClick={handleSell}
                disabled={!selectedProduct}
            >
                Confirm Sale
            </button>

            {/* Recent sales history — only visible when there are recent sales */}
            {recentSales.length > 0 && (
                <div className="recent-sales">
                    <h4 className="recent-sales-title">Recent Sales</h4>
                    {recentSales.map((sale) => (
                        <div key={sale.id} className="recent-sale-item">
                            <div className="recent-sale-info">
                                <span className="recent-sale-name">{sale.product_name}</span>
                                <span className="recent-sale-qty">x{sale.quantity}</span>
                            </div>
                            {/* Format the sale date to show month, day, hour and minutes */}
                            <span className="recent-sale-date">
                                {new Date(sale.sold_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellPanel;