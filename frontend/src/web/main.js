// Common helpers for web replica of uni-app pages

// Storage helpers (mirror uni.setStorageSync / getStorageSync)
const storage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw == null ? defaultValue : JSON.parse(raw)
    } catch (e) {
      // for plain strings not JSON
      const raw = localStorage.getItem(key)
      return raw == null ? defaultValue : raw
    }
  },
  set(key, value) {
    const raw = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, raw)
  },
  remove(key) { localStorage.removeItem(key) }
}

// Random helpers
const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max))

// Stars background generator
function generateStars(container, count = 50, topFocused = false) {
  if (!container) return
  container.innerHTML = ''
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div')
    s.className = 'star'
    s.style.left = rand(0, 100) + '%'
    s.style.top = (topFocused ? rand(0, 40) : rand(0, 100)) + '%'
    const size = rand(.5, 2)
    s.style.width = size + 'px'
    s.style.height = size + 'px'
    s.style.opacity = rand(.2, .8)
    s.style.animationDelay = rand(0, 3) + 's'
    container.appendChild(s)
  }
}

// Toast
function showToast(message, timeout = 1800) {
  let toast = document.querySelector('.toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.className = 'toast'
    document.body.appendChild(toast)
  }
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => toast.classList.remove('show'), timeout)
}

// Modal helpers: toggle .show on container
function openModal(selector) {
  const m = document.querySelector(selector)
  if (m) m.classList.add('show')
}
function closeModal(selector) {
  const m = document.querySelector(selector)
  if (m) m.classList.remove('show')
}

// ID helpers
function ensureStarId() {
  let id = storage.get('starId')
  if (!id) {
    const digits = String(randInt(0, 1_000_000)).padStart(6, '0')
    id = `HD ${digits}`
    storage.set('starId', id)
  }
  return id
}
function getStarDigits() {
  const id = storage.get('starId') || ''
  return id.replace(/^HD\s*/, '')
}

// Navigation
function navigate(path) { window.location.href = path }

// TabBar
function renderTabBar(activeIndex = 0) {
  const tab = document.querySelector('.tabbar')
  if (!tab) return
  const tabs = [
    { name: '首页', href: 'gallery.html' },
    { name: '星空', href: 'scene.html' },
    { name: '星语', href: 'bottle.html' },
    { name: '档案', href: 'archive.html' },
    { name: '我的', href: 'user.html' },
  ]
  tab.innerHTML = ''
  tabs.forEach((t, i) => {
    const el = document.createElement('div')
    el.className = 'tab' + (i === activeIndex ? ' active' : '')
    el.innerHTML = `<div class="icon">${i===0?'⌂':i===1?'★':i===2?'🍶':i===3?'📖':'👤'}</div><div>${t.name}</div>${i===activeIndex?'<div class="dot"></div>':''}`
    el.addEventListener('click', () => {
      if (i === activeIndex) return
      if (i === 1) {
        // require existing scene id to jump directly
        const current = storage.get('currentSceneId')
        if (!current) {
          showToast('请先选择一个时空加入')
          return
        }
        navigate(`scene.html?id=${current}`)
        return
      }
      navigate(t.href)
    })
    tab.appendChild(el)
  })
}

// Scene list used by gallery/scene
const SCENES = [
  { id: 1, title: '深夜电台', users: 12, gradient: 'linear-gradient(180deg, #1E2B3E 0%, #0F1724 100%)' },
  { id: 2, title: '雨中漫步', users: 8, gradient: 'linear-gradient(180deg, #2A3B4C 0%, #1A2B3C 100%)' },
  { id: 3, title: '星空独白', users: 15, gradient: 'linear-gradient(180deg, #2E2E4A 0%, #1E1E3A 100%)' },
]

// Bottles helpers
function loadBottles() {
  const saved = storage.get('bottles')
  if (saved) {
    try {
      const list = typeof saved === 'string' ? JSON.parse(saved) : saved
      list.forEach(b => { if (!Array.isArray(b.comments)) b.comments = []; if (b.favorited == null) b.favorited = false })
      return list
    } catch { return [] }
  }
  const sample = [
    { date: '2025.04.03 20:45', content: '今晚的星星很亮，看着它们，突然明白了很多事。原来所有的相遇和错过，都是宇宙安排的必然。希望你也能看到同样的星空，感受这份宁静。', senderId: '294731', favorited: false, comments: [ { date: '04.03 21:30', content: '我也看到了，真的很美。今晚的星空格外清澈。', senderId: '567812', isImage: false } ] },
    { date: '2025.04.01 23:30', content: '深夜里听着钢琴曲，窗外下着小雨。突然很想念一个人，却不敢联系。把这份思念放进星语瓶，希望能漂到你的星球。', senderId: '783421', favorited: false, comments: [] },
    { date: '2025.03.27 22:15', content: '今天读了一本很喜欢的书，里面有一句话:"我们都是宇宙里的尘埃，却各自闪着微光。"分享给同样孤独又闪亮的你。', senderId: '456829', favorited: false, comments: [] },
  ]
  storage.set('bottles', sample)
  return sample
}
function saveBottles(list) { storage.set('bottles', list) }
function loadFavorites() {
  const f = storage.get('favoriteBottles')
  if (!f) return []
  try { return typeof f === 'string' ? JSON.parse(f) : f } catch { return [] }
}
function saveFavorites(list) { storage.set('favoriteBottles', list) }

// Archives helpers
function loadArchives() {
  const saved = storage.get('archives')
  if (saved) {
    try { return typeof saved === 'string' ? JSON.parse(saved) : saved } catch { return [] }
  }
  const sample = [
    { date: '2025.04.03 20:45', content: '今晚的雨声很温柔，仿佛把所有烦恼都冲刷干净了。坐在窗边，看着雨滴在玻璃上划出痕迹，突然觉得内心很平静。', scene: '雨中漫步' },
    { date: '2025.04.01 23:30', content: '深夜里一个人听着歌，总有种回到过去的感觉。那些熟悉的旋律像是时光机，带我回到最初的感动。', scene: '深夜电台' },
    { date: '2025.03.27 22:15', content: '抬头仰望星空，突然觉得自己很渺小，但又觉得内心很宽广。这种矛盾的感受，或许就是宇宙给我的礼物吧。', scene: '星空独白' },
  ]
  storage.set('archives', sample)
  return sample
}
function saveArchives(list) { storage.set('archives', list) }

// Clipboard
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy'); showToast('已复制') } finally { document.body.removeChild(ta) }
  }
}

// Export to window for page scripts
window.WebApp = {
  storage,
  generateStars,
  showToast,
  openModal,
  closeModal,
  renderTabBar,
  navigate,
  ensureStarId,
  getStarDigits,
  SCENES,
  loadBottles, saveBottles, loadFavorites, saveFavorites,
  loadArchives, saveArchives,
  copyText,
}


