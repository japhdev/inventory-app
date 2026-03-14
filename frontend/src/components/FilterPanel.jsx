function FilterPanel({ categories, filters, onFilterChange, onClearFilters }) {
    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3 className="filter-title">Filter</h3>
                <button className="btn-clear-filters" onClick={onClearFilters}>Clear</button>
            </div>
            {/*Search by name */}
            <div className="filter-group">
                <label>Search</label>
                <input
                    type="text"
                    placeholder="Product name..."
                    value={filters.search}
                    onChange={(e) => onFilterChange("search", e.target.value)} />
            </div>
            {/*Filter by category */}
            <div className="filter-group">
                <label>Category</label>
                <select
                    value={filters.category}
                    onChange={(e) => onFilterChange("category", e.target.value)}>
                    <option value="">All</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>))}
                </select>
            </div>

            {/* Filter by status (active/inactive)*/}
            <div className="filter-group">
                <label>Status</label>
                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange("status", e.target.value)}>
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            
            {/* Sort By */}
            <div className="filter-group">
                <label>Sort by</label>
                <select
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange("sortBy", e.target.value)}>
                    <option value="">All</option>
                    <option value="name_asc">A-Z</option>
                    <option value="name_desc">Z-A</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low </option>
                    <option value="stock_asc">Stock: Low to High</option>
                    <option value="stock_desc">Stock: High to Low</option>
                </select>
            </div>
        </div>
    );
}

export default FilterPanel;