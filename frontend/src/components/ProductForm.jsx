import { useEffect, useState } from "react";

/**
 * ProductForm component for creating and editing products.
 *
 * This component provides a form to input product details (name, price, stock, category).
 * It can be used to create a new product or edit an existing one.
 *
 * When a product is successfully created or updated, it calls the onProductCreate
 * callback to refresh the product list. The productEdit prop is used to populate
 * the form when editing a product, and onCancel allows the user to exit edit mode.
 */
function ProductForm({ onProductCreate, productEdit, onCancel }) {
    // State to manage form input values
    const [form, setForm] = useState({
        name: "",
        price: "",
        stock: "",
        category: ""
    });

    /**
     * Updates the form fields when a product is selected for editing.
     * If no product is selected, the form is reset to empty values.
     */
    useEffect(() => {
        if (productEdit) {
            setForm(productEdit);
        } else {
            setForm({ name: "", price: "", stock: "", category: "" });
        }
    }, [productEdit]);

    /**
     * Handles input field changes and updates the form state.
     */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handles form submission to create or update a product.
     *
     * Prevents default form behavior and sends a request to the API.
     * Uses POST when creating a new product and PUT when editing an existing one.
     * After the request is completed, the product list is refreshed
     * and edit mode is cancelled.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        const url = productEdit
            ? `http://localhost:8000/products/${productEdit.id}`
            : "http://localhost:8000/products";

        const method = productEdit ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(() => {
                onProductCreate();
                onCancel();
            });

    };

    return (
        <form onSubmit={handleSubmit} className="form">

            {/* Input field for product name */}
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />

            {/* Input field for product price (number type) */}
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required type="number" />

            {/* Input field for product stock (number type) */}
            <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required type="number" />

            {/* Input field for product category */}
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />

            {/* Submit button for creating or updating a product */}
            <button type="submit">{productEdit ? "Save Change" : "Add"}</button>

            {/* Submit button for creating or updating a product */}
            {productEdit && (<button type="button" onClick={onCancel}>Cancel</button>)}

        </form>
    );
}

// Export the ProductForm component
export default ProductForm;