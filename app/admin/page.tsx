'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Post, type Category, type ContactMessage } from '@/lib/supabase'
import { AdminSidebar, type AdminTab } from '@/components/admin/AdminSidebar'
import { OverviewTab } from '@/components/admin/OverviewTab'
import { CustomersTab } from '@/components/admin/CustomersTab'
import { OrdersTab } from '@/components/admin/OrdersTab'
import { PostsTab } from '@/components/admin/PostsTab'
import { AccessHistoryTab } from '@/components/admin/AccessHistoryTab'
import { SettingsBackupTab } from '@/components/admin/SettingsBackupTab'
import {
  type Customer,
  type InstallationOrder,
  type AccessLog,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredOrders,
  saveStoredOrders,
  getStoredLogs,
  saveStoredLogs,
  addAuditLog,
  SAMPLE_POSTS,
  SAMPLE_CATEGORIES,
} from '@/lib/camera247-data'

export default function AdminPage() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(true)

  // Data States
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS as unknown as Post[])
  const [categories, setCategories] = useState<Category[]>(SAMPLE_CATEGORIES as unknown as Category[])
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<InstallationOrder[]>([])
  const [logs, setLogs] = useState<AccessLog[]>([])

  // State to pass customer to order form
  const [prefilledCustomerForOrder, setPrefilledCustomerForOrder] = useState<Customer | null>(null)

  // Initial load & authentication check
  useEffect(() => {
    // 1. Verify session
    fetch('/api/auth', { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) {
          router.replace('/login')
        }
      })
      .catch(() => {
        router.replace('/login')
      })

    // 2. Load stored local data first for instantaneous display
    setCustomers(getStoredCustomers())
    setOrders(getStoredOrders())
    setLogs(getStoredLogs())

    // 3. Fetch from server/supabase
    fetchAllData()

    // 4. Setup realtime listener on Supabase tables
    const channel = supabase
      .channel('admin-c247-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchAllData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchAllData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchAllData(false))
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const fetchAllData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const res = await fetch('/api/admin/data')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.posts) && data.posts.length > 0) setPosts(data.posts)
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories)
        if (Array.isArray(data.contacts)) setContacts(data.contacts)
      }
    } catch (e) {
      console.error('Failed to fetch server data:', e)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      addAuditLog('admin', 'Quản trị viên (Tước)', 'Đăng xuất', 'Hệ thống & Đăng nhập', 'Đăng xuất khỏi bảng điều khiển quản trị')
      await fetch('/api/auth', { method: 'DELETE', credentials: 'same-origin' })
    } catch {
      // ignore
    }
    router.replace('/login')
  }

  // ========== CUSTOMER HANDLERS ==========
  const handleSaveCustomer = (customerData: Partial<Customer> & { id?: string }) => {
    setCustomers((prev) => {
      let next: Customer[]
      if (customerData.id) {
        // Update
        next = prev.map((c) =>
          c.id === customerData.id
            ? { ...c, ...customerData, updated_at: new Date().toISOString() }
            : c
        )
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Chỉnh sửa',
          'Khách hàng',
          `Cập nhật thông tin khách hàng: ${customerData.name} (${customerData.phone})`
        )
      } else {
        // Create
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: customerData.name || '',
          phone: customerData.phone || '',
          phone_secondary: customerData.phone_secondary || '',
          zalo: customerData.zalo || '',
          email: customerData.email || '',
          address: customerData.address || '',
          district: customerData.district || 'TP. Huế (Trung tâm)',
          type: customerData.type || 'individual',
          tier: customerData.tier || 'standard',
          tax_code: customerData.tax_code || '',
          idcard: customerData.idcard || '',
          notes: customerData.notes || '',
          total_orders: 0,
          total_spent: 0,
          created_at: new Date().toISOString(),
        }
        next = [newCust, ...prev]
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Thêm mới',
          'Khách hàng',
          `Thêm khách hàng mới: ${newCust.name} (${newCust.phone}) tại ${newCust.address}`
        )
      }
      saveStoredCustomers(next)
      return next
    })
    setLogs(getStoredLogs())
  }

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => {
      const target = prev.find((c) => c.id === id)
      const next = prev.filter((c) => c.id !== id)
      if (target) {
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Xóa',
          'Khách hàng',
          `Xóa hồ sơ khách hàng: ${target.name} (${target.phone})`
        )
      }
      saveStoredCustomers(next)
      return next
    })
    setLogs(getStoredLogs())
  }

  // ========== ORDER HANDLERS ==========
  const handleSaveOrder = (orderData: Partial<InstallationOrder> & { id?: string }) => {
    setOrders((prev) => {
      let next: InstallationOrder[]
      if (orderData.id) {
        // Update
        next = prev.map((o) =>
          o.id === orderData.id
            ? { ...o, ...orderData, updated_at: new Date().toISOString() }
            : o
        )
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Cập nhật',
          'Đơn hàng',
          `Cập nhật đơn thi công ${orderData.order_code || orderData.id} (${orderData.customer_name}) → Trạng thái: ${orderData.status}`
        )
      } else {
        // Create
        const nextNum = prev.length + 1
        const orderCode = `C247-2026-${String(nextNum).padStart(3, '0')}`
        const newOrder: InstallationOrder = {
          id: `ord-${Date.now()}`,
          order_code: orderCode,
          customer_id: orderData.customer_id || '',
          customer_name: orderData.customer_name || '',
          customer_phone: orderData.customer_phone || '',
          customer_address: orderData.customer_address || '',
          services: orderData.services || ['camera'],
          equipment_list: orderData.equipment_list || '',
          installation_date: orderData.installation_date || new Date().toLocaleDateString('vi-VN'),
          completion_date: orderData.completion_date || '',
          warranty_months: orderData.warranty_months || 24,
          warranty_until: orderData.warranty_until || '',
          total_amount: orderData.total_amount || 0,
          deposit_amount: orderData.deposit_amount || 0,
          status: orderData.status || 'in_progress',
          technician: orderData.technician || 'Lập & Tước',
          notes: orderData.notes || '',
          created_at: new Date().toISOString(),
        }
        next = [newOrder, ...prev]
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Thêm mới',
          'Đơn hàng',
          `Tạo đơn hàng thi công mới #${newOrder.order_code} cho khách ${newOrder.customer_name} - Trị giá: ${newOrder.total_amount}đ`
        )
      }
      saveStoredOrders(next)
      return next
    })
    setLogs(getStoredLogs())
  }

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === id)
      const next = prev.filter((o) => o.id !== id)
      if (target) {
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Xóa',
          'Đơn hàng',
          `Xóa đơn hàng #${target.order_code} (${target.customer_name})`
        )
      }
      saveStoredOrders(next)
      return next
    })
    setLogs(getStoredLogs())
  }

  // ========== POST CMS HANDLERS ==========
  const handleSavePost = async (postData: any): Promise<boolean> => {
    try {
      const isEditing = Boolean(postData.id)
      const res = await fetch('/api/posts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })
      if (res.ok) {
        fetchAllData(false)
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          isEditing ? 'Chỉnh sửa' : 'Thêm mới',
          'Bài viết',
          `${isEditing ? 'Cập nhật' : 'Xuất bản'} bài viết công trình: ${postData.title}`
        )
        setLogs(getStoredLogs())
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleDeletePost = async (id: string) => {
    try {
      const post = posts.find((p) => p.id === id)
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAllData(false)
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Xóa',
          'Bài viết',
          `Xóa bài viết công trình: ${post?.title || id}`
        )
        setLogs(getStoredLogs())
      }
    } catch (e) {
      console.error('Error deleting post:', e)
    }
  }

  const handleTogglePublishPost = async (post: Post) => {
    try {
      const nextPub = !post.published
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, published: nextPub }),
      })
      if (res.ok) {
        fetchAllData(false)
        addAuditLog(
          'admin',
          'Quản trị viên (Tước)',
          'Chỉnh sửa',
          'Bài viết',
          `${nextPub ? 'Hiển thị' : 'Ẩn'} bài viết: ${post.title}`
        )
        setLogs(getStoredLogs())
      }
    } catch (e) {
      console.error('Error toggling post:', e)
    }
  }

  const handleAddCategory = async (name: string): Promise<Category | null> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newCat = await res.json()
        fetchAllData(false)
        addAuditLog('admin', 'Quản trị viên (Tước)', 'Thêm mới', 'Bài viết', `Tạo danh mục công trình mới: ${name}`)
        setLogs(getStoredLogs())
        return newCat
      }
    } catch (e) {
      console.error(e)
    }
    return null
  }

  const handleUpdateCategory = async (id: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      })
      if (res.ok) {
        fetchAllData(false)
        addAuditLog('admin', 'Quản trị viên (Tước)', 'Chỉnh sửa', 'Bài viết', `Đổi tên danh mục công trình thành: ${name}`)
        setLogs(getStoredLogs())
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAllData(false)
        addAuditLog('admin', 'Quản trị viên (Tước)', 'Xóa', 'Bài viết', `Xóa danh mục công trình`)
        setLogs(getStoredLogs())
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  // ========== BACKUP RESTORE HANDLER ==========
  const handleRestoreData = (importedData: any) => {
    if (Array.isArray(importedData.customers)) {
      setCustomers(importedData.customers)
      saveStoredCustomers(importedData.customers)
    }
    if (Array.isArray(importedData.orders)) {
      setOrders(importedData.orders)
      saveStoredOrders(importedData.orders)
    }
    if (Array.isArray(importedData.posts)) {
      setPosts(importedData.posts)
    }
    if (Array.isArray(importedData.categories)) {
      setCategories(importedData.categories)
    }
    if (Array.isArray(importedData.logs)) {
      setLogs(importedData.logs)
      saveStoredLogs(importedData.logs)
    }
    addAuditLog('admin', 'Quản trị viên (Tước)', 'Khôi phục', 'Cài đặt & Sao lưu', 'Khôi phục dữ liệu toàn hệ thống từ tệp JSON sao lưu')
  }

  // Badge counts
  const inProgressOrdersCount = orders.filter((o) => o.status === 'in_progress').length
  const unreadContactsCount = contacts.filter((c) => !c.read).length

  return (
    <div className="flex min-h-[100dvh] bg-[#F5F5F7] text-[#1D1D1F] overflow-x-clip font-sans antialiased selection:bg-[#0071E3] selection:text-white">
      {/* Sidebar navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onLogout={handleLogout}
        counts={{
          customers: customers.length,
          orders: orders.length,
          inProgressOrders: inProgressOrdersCount,
          posts: posts.length,
          unreadContacts: unreadContactsCount,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 lg:ml-[16.5rem] flex flex-col min-h-[100dvh]">
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewTab
              orders={orders}
              customers={customers}
              posts={posts}
              logs={logs}
              onNavigateTab={setCurrentTab}
              onOpenNewOrder={() => {
                setPrefilledCustomerForOrder(null)
                setCurrentTab('orders')
              }}
              onOpenNewCustomer={() => setCurrentTab('customers')}
              onOpenNewPost={() => setCurrentTab('posts')}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersTab
              customers={customers}
              orders={orders}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onOpenNewOrderWithCustomer={(cust) => {
                setPrefilledCustomerForOrder(cust)
                setCurrentTab('orders')
              }}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersTab
              orders={orders}
              customers={customers}
              onSaveOrder={handleSaveOrder}
              onDeleteOrder={handleDeleteOrder}
              initialNewOrderCustomer={prefilledCustomerForOrder}
            />
          )}

          {currentTab === 'posts' && (
            <PostsTab
              posts={posts}
              categories={categories}
              onRefresh={fetchAllData}
              onDeletePost={handleDeletePost}
              onTogglePublish={handleTogglePublishPost}
              onSavePost={handleSavePost}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentTab === 'access-history' && (
            <AccessHistoryTab
              logs={logs}
              onRefresh={() => {
                setLogs(getStoredLogs())
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsBackupTab
              customers={customers}
              orders={orders}
              posts={posts}
              categories={categories}
              logs={logs}
              onRestoreData={handleRestoreData}
            />
          )}
        </main>
      </div>
    </div>
  )
}
