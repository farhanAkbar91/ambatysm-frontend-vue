export const BASE_URL = 'http://localhost:8000/api'
export const ASSET_URL = 'http://localhost:8000'

export function getImageUrl(path) {
  if (!path) return '/assets/kmjputih.jpg'
  if (path.startsWith('http')) return path
  return ASSET_URL + path
}

export function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID')
}

const MOCK_PRODUCTS = [
  { id: 101, name: 'Kemeja Flannel Tartan', price: 189000, stock: 24, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80', description: 'Kemeja pria kasual' },
  { id: 102, name: 'Basic T-Shirt Black', price: 99000, stock: 50, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80', description: 'Kaos pria warna hitam' },
  { id: 103, name: 'Denim Jacket Classic', price: 349000, stock: 12, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80', description: 'Jaket denim premium' },
  { id: 104, name: 'Chino Pants Slim Navy', price: 219000, stock: 30, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80', description: 'Celana panjang chino' },
  { id: 105, name: 'Oversized Kemeja Putih', price: 199000, stock: 15, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80', description: 'Kemeja oversize putih bersih' },
  { id: 106, name: 'Cargo Pants Olive', price: 249000, stock: 10, image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=500&q=80', description: 'Celana kargo gaya kasual' },
  { id: 107, name: 'Polo Shirt Premium', price: 159000, stock: 20, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', description: 'Atasan berkerah modis' },
  { id: 108, name: 'Shorts Khaki Basic', price: 139000, stock: 35, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80', description: 'Celana pendek kasual' },
  { id: 109, name: 'Heavyweight Hoodie', price: 299000, stock: 18, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80', description: 'Hoodie tebal' },
  { id: 110, name: 'Linen Blend Shirt', price: 229000, stock: 22, image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&q=80', description: 'Kemeja linen' },
  { id: 111, name: 'Slim Fit Jeans Black', price: 279000, stock: 40, image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80', description: 'Jeans hitam slim fit' },
  { id: 112, name: 'Graphic Tee Vintage', price: 129000, stock: 55, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80', description: 'Kaos grafis retro' },
  { id: 113, name: 'Bomber Jacket Navy', price: 319000, stock: 8, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80', description: 'Jaket bomber' },
  { id: 114, name: 'Knitted Sweater', price: 259000, stock: 14, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80', description: 'Sweater rajut' },
  { id: 115, name: 'Corduroy Pants Brown', price: 269000, stock: 16, image: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=500&q=80', description: 'Celana korduroi' },
  { id: 116, name: 'Basic Singlet White', price: 79000, stock: 60, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80', description: 'Singlet katun dasar' }
]

export async function apiGetProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`, { headers: { Accept: 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      const prods = data.data || data
      if (prods?.length > 0) return prods
    }
  } catch {}
  return MOCK_PRODUCTS
}

export async function apiGetProductDetail(id) {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, { headers: { Accept: 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      return data.data || data
    }
  } catch {}
  return MOCK_PRODUCTS.find(p => p.id == id)
}
