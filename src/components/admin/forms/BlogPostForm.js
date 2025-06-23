// src/components/admin/forms/BlogPostForm.js - Actualizar categorías
const [categories, setCategories] = useState([])

useEffect(() => {
  fetchCategories()
}, [])

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/admin/categories')
    const data = await response.json()
    setCategories(data.categories || [])
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// En el select de categorías:
<select
  required
  value={formData.category}
  onChange={(e) => handleChange('category', e.target.value)}
  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
>
  <option value="">Seleccionar categoría</option>
  {categories.map(cat => (
    <option key={cat._id} value={cat.name}>{cat.name}</option>
  ))}
</select>