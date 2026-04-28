'use client'

import { useState } from 'react'
import { Upload, X, Loader2, Plus } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { IProduct } from '@/types'
import { PRODUCT_CATEGORIES } from '@/lib/categories'

interface ProductFormProps {
  product?: IProduct
  onSuccess: (product: IProduct) => void
  onCancel:  () => void
}

interface FormState {
  name:        string
  description: string
  price:       string
  stock:       string
  category:    string
  images:      string[]
  isActive:    boolean
}

async function uploadToCloudinary(file: File): Promise<string> {
  // 1. Get signed params from our API
  const res = await fetch('/api/upload', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to get upload signature')
  const { data } = await res.json()

  // 2. Upload directly to Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', data.signature)
  formData.append('timestamp', String(data.timestamp))
  formData.append('api_key', data.apiKey)
  formData.append('folder', data.folder)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!uploadRes.ok) throw new Error('Upload failed')
  const uploadData = await uploadRes.json()
  return uploadData.secure_url as string
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product

  const [form, setForm] = useState<FormState>({
    name:        product?.name        ?? '',
    description: product?.description ?? '',
    price:       product?.price       != null ? String(product.price) : '',
    stock:       product?.stock       != null ? String(product.stock) : '',
    category:    product?.category    ?? PRODUCT_CATEGORIES[0],
    images:      product?.images      ?? [],
    isActive:    product?.isActive    ?? true,
  })

  const [errors, setErrors]     = useState<Partial<Record<keyof FormState, string>>>({})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)

  const set = (field: keyof FormState, value: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [field]: value }))

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim() || form.name.length < 2)   e.name = 'Name must be at least 2 characters'
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Enter a valid price'
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = 'Enter a valid stock quantity'
    if (!form.category) e.category = 'Select a category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (form.images.length + files.length > 5) {
      toast.error('Maximum 5 images per product')
      return
    }

    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary))
      set('images', [...form.images, ...urls])
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`)
    } catch {
      toast.error('Image upload failed. Check Cloudinary settings.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (idx: number) => {
    set('images', form.images.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        stock:       Number(form.stock),
        category:    form.category,
        images:      form.images,
        isActive:    form.isActive,
      }

      const res = await fetch(
        isEdit ? `/api/products/${product._id}` : '/api/products',
        {
          method:  isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')

      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      onSuccess(data.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        <Input
          label="Product Name"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          placeholder="e.g. Garam Masala"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-masala-800">
            Description <span className="text-chili-600">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Describe this masala blend..."
            className={`w-full border rounded-xl px-4 py-2.5 bg-white text-masala-900 text-sm placeholder:text-masala-400 resize-none focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 transition-all ${
              errors.description ? 'border-chili-600' : 'border-masala-200'
            }`}
          />
          {errors.description && <p className="text-xs text-chili-600">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (₹)"
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            error={errors.price}
            placeholder="0"
          />
          <Input
            label="Stock (units)"
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            error={errors.stock}
            placeholder="0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-masala-800">
            Category <span className="text-chili-600">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="h-10 border border-masala-200 rounded-xl px-4 bg-white text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500"
          >
            {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-masala-800">
            Product Images <span className="text-masala-500 font-normal">(max 5)</span>
          </label>

          {/* Existing images */}
          {form.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-masala-200 group">
                  <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    aria-label={`Remove image ${i + 1}`}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {form.images.length < 5 && (
            <label className={`flex items-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${
              uploading
                ? 'border-masala-200 bg-masala-50 cursor-wait'
                : 'border-masala-300 hover:border-saffron-400 hover:bg-saffron-50'
            }`}>
              {uploading ? (
                <><Loader2 className="w-4 h-4 text-saffron-500 animate-spin" /><span className="text-sm text-masala-600">Uploading...</span></>
              ) : (
                <><Upload className="w-4 h-4 text-saffron-500" /><span className="text-sm text-masala-600">Click to upload images</span><Plus className="w-3.5 h-3.5 text-masala-400 ml-auto" /></>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-masala-800">Active</p>
            <p className="text-xs text-masala-500">Visible to customers on the store</p>
          </div>
          <button
            type="button"
            onClick={() => set('isActive', !form.isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              form.isActive ? 'bg-saffron-500' : 'bg-masala-300'
            }`}
            role="switch"
            aria-checked={form.isActive}
            aria-label="Toggle product active status"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              form.isActive ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-masala-200 flex gap-3 bg-white">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={saving} className="flex-1">
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
