import { useState } from "react";

/**
 * SellPanel component
 * Side panel to search products and register sales
 */
function SellPanel({ products, onSaleComplete }) {
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filter products by search term
    const filtered = products.filter(
        (p) => p.name.toLowerCase().includes(search.toLowerCase()) && p.is_active,
    );

    const handleSelect = (product) => {
        setSelectedProduct(product);
        setSearch(product.name);
        setError("");
        setSuccess("");
        setQuantity(1);
    };

    const handleSell = () => {
        if (!selectedProduct) return;
        if (quantity < 1) {
            setError("Quantity must be at least 1");
            return;
        }
        if (quantity > selectedProduct.stock) {
            setError(`Not enough stock. Available: ${selectedProduct.stock}`);
            return;
        }

        fetch(
            `http://localhost:8000/products/${selectedProduct.id}/sell?quantity=${quantity}`,
            {
                method: "PUT",
            },
        )
            .then((res) => res.json())
            .then(() => {
                setSuccess(`Sale registered for ${selectedProduct.name}`);
                setSelectedProduct(null);
                setSearch("");
                setQuantity(1);
                onSaleComplete();
            });
    };

    return (
        <div className="sell-panel">
            <h2 className="sell-panel-title">Sell</h2>

            {/* Search input */}
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

            {/* Dropdown results */}
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

            {/* Selected product info */}
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

            {/* Quantity input */}
            <div className="sell-quantity">
                <label>Quantity sold:</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
            </div>

            {/* Error and success messages */}
            {error && <p className="sell-error">{error}</p>}
            {success && <p className="sell-success">{success}</p>}

            {/* Confirm button */}
            <button
                className="btn-sell"
                onClick={handleSell}
                disabled={!selectedProduct}
            >
                Confirm Sale
            </button>
        </div>
    );
}

export default SellPanel;
