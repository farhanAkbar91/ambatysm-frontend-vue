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

export async function apiGetProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`, { headers: { Accept: 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      return data.data || data || []
    }
  } catch (error) {
    console.error("Failed to fetch products:", error)
  }
  return []
}

export async function apiGetProductDetail(id) {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, { headers: { Accept: 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      return data.data || data
    }
  } catch (error) {
    console.error("Failed to fetch product detail:", error)
  }
  return null
}
