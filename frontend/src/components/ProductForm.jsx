import { useState } from "react";

/**
 * ProductForm component for creating new products.
 *
 * This component provides a form to input product details (name, price, stock, category)
 * and submits them to the backend API via POST request. After successful creation,
 * it calls the onProductCreate callback to refresh the product list and resets the form.
 */
function ProductForm({onProductCreate}) {
    // State to manage form input values
    const [form, setForm] = useState({
        name: "",
        price: "",
        stock: "",
        category: ""
    });

    /**
     * Handles input field changes and updates the form state.
     */
    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    /**
     * Handles form submission to create a new product.
     *
     * Prevents default form behavior, sends POST request to API,
     * calls onProductCreate callback, and resets the form fields.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch("http://localhost:8000/products", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(form)
        })
        .then(res => res.json())
        .then(() => {
            onProductCreate();
            setForm({name: "", price: "", stock: "", category: ""});
        });

    };

    return (
        <form onSubmit={handleSubmit} className="form">
            {/* Input field for product name */}
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required/>
            {/* Input field for product price (number type) */}
            <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required type="number"/>
            {/* Input field for product stock (number type) */}
            <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required type="number"/>
            {/* Input field for product category */}
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required/>
            {/* Submit button to add the product */}
            <button type="submit">Add product</button>
        </form>
    )
}

// Export the ProductForm component as the default export
export default ProductForm;