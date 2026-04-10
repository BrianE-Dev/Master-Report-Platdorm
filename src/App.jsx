import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  LogIn,
  MoonStar,
  Sparkles,
  SunMedium,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import Dashboard from './components/dashboard'

const USERS_KEY = 'mrp_users'
const DEFAULT_TEST_USER = {
  name: 'Test Admin',
  email: 'test@masterreport.com',
  password: 'test1234',
}
const toSafeLower = (value) => String(value || '').toLowerCase()

const readUsers = () => {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY)
    if (!rawUsers) return []
    const parsed = JSON.parse(rawUsers)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const ensureTestUser = () => {
  const users = readUsers()
  if (users.length > 0) return users

  saveUsers([DEFAULT_TEST_USER])
  return [DEFAULT_TEST_USER]
}

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomDecimal = (min, max, decimals = 1) => {
  const num = Math.random() * (max - min) + min
  return Number(num.toFixed(decimals))
}

function App() {
  const [view, setView] = useState('home')
  const [currentUser, setCurrentUser] = useState(null)
  const [authMessage, setAuthMessage] = useState('')
  const [landingDarkMode, setLandingDarkMode] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    ensureTestUser()
  }, [])

  const [heroSnapshot] = useState(() => ({
    performanceScore: randomInt(82, 98),
    overallRating: randomDecimal(4.2, 4.9).toFixed(1),
    coverage: randomInt(76, 96),
  }))

  const landingTheme = landingDarkMode
    ? {
        shell: 'min-h-screen bg-[#07111f] text-slate-100',
        glow:
          'before:pointer-events-none before:absolute before:left-[-12rem] before:top-[-8rem] before:h-80 before:w-80 before:rounded-full before:bg-cyan-400/18 before:blur-3xl after:pointer-events-none after:absolute after:bottom-[-12rem] after:right-[-10rem] after:h-96 after:w-96 after:rounded-full after:bg-blue-500/12 after:blur-3xl',
        gridOverlay:
          'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_34%),linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]',
        panel:
          'border border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl',
        panelSoft: 'border border-white/10 bg-white/5 backdrop-blur-xl',
        title: 'text-white',
        subtle: 'text-slate-400',
        accent: 'text-cyan-300',
        pill: 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
        input:
          'w-full rounded-2xl border border-white/12 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30',
        secondaryButton:
          'border border-white/12 bg-white/6 text-slate-100 hover:bg-white/10',
        message: 'bg-white/8 text-slate-100 border border-white/10',
      }
    : {
        shell: 'min-h-screen bg-[#f4f8fc] text-slate-900',
        glow:
          'before:pointer-events-none before:absolute before:left-[-8rem] before:top-[-6rem] before:h-72 before:w-72 before:rounded-full before:bg-sky-300/35 before:blur-3xl after:pointer-events-none after:absolute after:bottom-[-10rem] after:right-[-6rem] after:h-80 after:w-80 after:rounded-full after:bg-cyan-200/45 after:blur-3xl',
        gridOverlay:
          'bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_38%),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]',
        panel:
          'border border-slate-200/70 bg-white/75 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur-2xl',
        panelSoft: 'border border-slate-200/70 bg-white/65 backdrop-blur-xl',
        title: 'text-slate-950',
        subtle: 'text-slate-500',
        accent: 'text-sky-700',
        pill: 'border border-sky-200 bg-sky-50 text-sky-700',
        input:
          'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200',
        secondaryButton:
          'border border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50',
        message: 'bg-slate-50 text-slate-700 border border-slate-200',
      }

  const handleInputChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' })
  }

  const register = () => {
    const { name, email, password } = formData
    if (!name || !email || !password) {
      setAuthMessage('Please fill all registration fields.')
      return
    }

    const users = readUsers()
    const normalizedEmail = toSafeLower(email.trim())
    const alreadyExists = users.some((user) => toSafeLower(user.email) === normalizedEmail)
    if (alreadyExists) {
      setAuthMessage('Email already exists. Please login.')
      setView('login')
      return
    }

    const updatedUsers = [...users, { name, email: email.trim(), password }]
    saveUsers(updatedUsers)
    setAuthMessage('Registration successful. You can now login.')
    setView('login')
    resetForm()
  }

  const login = () => {
    const { email, password } = formData
    if (!email || !password) {
      setAuthMessage('Enter email and password to login.')
      return
    }

    const users = readUsers()
    const normalizedEmail = toSafeLower(email.trim())
    const user = users.find(
      (entry) =>
        toSafeLower(entry.email) === normalizedEmail &&
        entry.password === password,
    )

    if (!user) {
      setAuthMessage('Invalid login details.')
      return
    }

    setCurrentUser(user)
    setAuthMessage('')
    resetForm()
  }

  const logout = () => {
    setCurrentUser(null)
    setView('login')
    setAuthMessage('Logged out successfully.')
  }

  if (currentUser) {
    return <Dashboard onLogout={logout} />
  }

  if (view === 'home') {
    return (
      <main className={landingTheme.shell}>
        <div className={`relative isolate overflow-hidden ${landingTheme.glow}`}>
          <div className={`absolute inset-0 opacity-80 ${landingTheme.gridOverlay}`} />

          <div className="relative mx-auto min-h-screen w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
            <nav className={`rounded-[28px] px-5 py-4 sm:px-6 ${landingTheme.panel}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-2xl p-3 ${landingTheme.pill}`}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${landingTheme.accent}`}>
                      Master Report Platform
                    </p>
                    <h1 className={`mt-1 text-lg font-semibold ${landingTheme.title}`}>
                      Reporting Dashboard
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setLandingDarkMode((current) => !current)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${landingTheme.secondaryButton}`}
                  >
                    {landingDarkMode ? <MoonStar size={15} /> : <SunMedium size={15} />}
                    {landingDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </button>
                  <button
                    onClick={() => setView('login')}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${landingTheme.secondaryButton}`}
                  >
                    <LogIn size={16} />
                    Login
                  </button>
                  <button
                    onClick={() => setView('register')}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)]"
                  >
                    <UserPlus size={16} />
                    Register
                  </button>
                </div>
              </div>
            </nav>

            <section className="grid min-h-[calc(100vh-8rem)] gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className={`overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10 ${landingTheme.panel}`}>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${landingTheme.pill}`}>
                  <Sparkles size={14} />
                  Daily reporting workflow
                </div>
                <h2 className={`mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl ${landingTheme.title}`}>
                  Turn daily reporting into clear, actionable decisions.
                </h2>
                <p className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base ${landingTheme.subtle}`}>
                  Track services, log channel follows, review daily results, and keep reporting organized in one clean workspace built for real operations.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <article className={`min-w-0 overflow-hidden rounded-[24px] p-5 ${landingTheme.panelSoft}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className={`min-w-0 break-words text-sm leading-5 ${landingTheme.subtle}`}>
                        Performance Score
                      </p>
                      <div className={`shrink-0 rounded-2xl p-2 ${landingTheme.pill}`}>
                        <Users size={15} />
                      </div>
                    </div>
                    <p className={`mt-4 break-all text-[clamp(1.45rem,2.4vw,2.15rem)] font-semibold leading-tight ${landingTheme.title}`}>
                      {heroSnapshot.performanceScore}/100
                    </p>
                    <p className={`mt-2 break-words text-xs leading-5 ${landingTheme.subtle}`}>
                      Snapshot of setup quality and reporting readiness.
                    </p>
                  </article>

                  <article className={`min-w-0 overflow-hidden rounded-[24px] p-5 ${landingTheme.panelSoft}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className={`min-w-0 break-words text-sm leading-5 ${landingTheme.subtle}`}>
                        Coverage
                      </p>
                      <div className={`shrink-0 rounded-2xl p-2 ${landingTheme.pill}`}>
                        <UserPlus size={15} />
                      </div>
                    </div>
                    <p className={`mt-4 break-all text-[clamp(1.45rem,2.4vw,2.15rem)] font-semibold leading-tight ${landingTheme.title}`}>
                      {heroSnapshot.coverage}%
                    </p>
                    <p className={`mt-2 break-words text-xs leading-5 ${landingTheme.subtle}`}>
                      Estimated platform reporting coverage across active services.
                    </p>
                  </article>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setView('register')}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)]"
                  >
                    <UserPlus size={16} />
                    Create Account
                  </button>
                  <button
                    onClick={() => setView('login')}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium ${landingTheme.secondaryButton}`}
                  >
                    <LogIn size={16} />
                    Sign In
                  </button>
                </div>
              </div>

              <div className="relative py-3 sm:py-6">
                <div className="pointer-events-none absolute -left-6 top-8 h-24 w-24 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-6 bottom-4 h-28 w-28 rounded-full bg-blue-500/15 blur-3xl" />

                <article className={`hero-card hero-outline-glow float-card-a relative z-10 overflow-hidden rounded-[30px] p-6 ${landingTheme.panel}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${landingTheme.accent}`}>
                        Operations Snapshot
                      </p>
                      <h3 className={`mt-3 text-2xl font-semibold ${landingTheme.title}`}>
                        Reporting health
                      </h3>
                    </div>
                    <div className={`rounded-2xl p-3 ${landingTheme.pill}`}>
                      <TrendingUp size={18} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className={`rounded-[22px] p-4 ${landingTheme.panelSoft}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm ${landingTheme.subtle}`}>Overall rating</span>
                        <span className={`text-lg font-semibold ${landingTheme.title}`}>
                          {heroSnapshot.overallRating}/5.0
                        </span>
                      </div>
                      <p className={`mt-3 text-sm leading-6 ${landingTheme.subtle}`}>
                        Quality benchmark based on reporting structure and consistency.
                      </p>
                    </div>

                    <div className={`rounded-[22px] p-4 ${landingTheme.panelSoft}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm ${landingTheme.subtle}`}>Growth readiness</span>
                        <span className={`text-lg font-semibold ${landingTheme.title}`}>
                          {heroSnapshot.performanceScore}%
                        </span>
                      </div>
                      <div className={`mt-3 h-2.5 rounded-full ${landingDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600"
                          style={{ width: `${heroSnapshot.performanceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </article>

                <div className="mt-5 grid gap-5 sm:max-w-[86%] sm:pl-10">
                  <article className={`hero-card hero-outline-glow float-card-b relative z-20 overflow-hidden rounded-[28px] p-5 ${landingTheme.panel}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm ${landingTheme.subtle}`}>Daily tracking</p>
                      <Target size={16} className={landingTheme.accent} />
                    </div>
                    <p className={`mt-4 text-2xl font-semibold ${landingTheme.title}`}>Simple workflow</p>
                    <p className={`mt-2 text-sm leading-6 ${landingTheme.subtle}`}>
                      Create services, enter follows, and review saved reports without extra steps.
                    </p>
                  </article>

                  <article className={`hero-card hero-outline-glow float-card-c relative z-30 overflow-hidden rounded-[28px] p-5 sm:ml-12 ${landingTheme.panel}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm ${landingTheme.subtle}`}>Team visibility</p>
                      <BarChart3 size={16} className={landingTheme.accent} />
                    </div>
                    <p className={`mt-4 text-2xl font-semibold ${landingTheme.title}`}>Clear reporting</p>
                    <p className={`mt-2 text-sm leading-6 ${landingTheme.subtle}`}>
                      Keep service data, channel metrics, and daily totals easy to review.
                    </p>
                  </article>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={landingTheme.shell}>
      <div className={`relative isolate overflow-hidden ${landingTheme.glow}`}>
        <div className={`absolute inset-0 opacity-80 ${landingTheme.gridOverlay}`} />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className={`mb-5 flex items-center justify-between rounded-[24px] px-5 py-4 ${landingTheme.panel}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${landingTheme.accent}`}>
                  Master Report Platform
                </p>
                <p className={`mt-2 text-sm ${landingTheme.subtle}`}>
                  {view === 'login' ? 'Admin sign in' : 'Admin registration'}
                </p>
              </div>
              <button
                onClick={() => setLandingDarkMode((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${landingTheme.secondaryButton}`}
              >
                {landingDarkMode ? <MoonStar size={15} /> : <SunMedium size={15} />}
                {landingDarkMode ? 'Dark' : 'Light'}
              </button>
            </div>

            <div className={`rounded-[30px] p-6 sm:p-7 ${landingTheme.panel}`}>
              <h1 className={`text-3xl font-semibold ${landingTheme.title}`}>Master Report Platform</h1>
              <p className={`mt-3 text-sm leading-6 ${landingTheme.subtle}`}>
                {view === 'login' ? 'Login to your admin account.' : 'Create an admin account.'}
              </p>

              {authMessage ? (
                <p className={`mt-5 rounded-[18px] px-4 py-3 text-sm ${landingTheme.message}`}>
                  {authMessage}
                </p>
              ) : null}

              <div className="mt-6 space-y-4">
                {view === 'register' ? (
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${landingTheme.subtle}`} htmlFor="name">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(event) => handleInputChange('name', event.target.value)}
                      className={landingTheme.input}
                      placeholder="Admin Name"
                    />
                  </div>
                ) : null}

                <div>
                  <label className={`mb-2 block text-sm font-medium ${landingTheme.subtle}`} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                    className={landingTheme.input}
                    placeholder="admin@email.com"
                  />
                </div>

                <div>
                  <label className={`mb-2 block text-sm font-medium ${landingTheme.subtle}`} htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(event) => handleInputChange('password', event.target.value)}
                    className={landingTheme.input}
                    placeholder="Enter password"
                  />
                </div>

                <button
                  onClick={view === 'login' ? login : register}
                  className="w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)]"
                >
                  {view === 'login' ? 'Login' : 'Register'}
                </button>
              </div>

              <button
                onClick={() => {
                  setView((current) => (current === 'login' ? 'register' : 'login'))
                  setAuthMessage('')
                  resetForm()
                }}
                className={`mt-5 w-full text-sm font-medium ${landingTheme.accent}`}
              >
                {view === 'login' ? 'Need an account? Register' : 'Already registered? Login'}
              </button>

              <button
                onClick={() => {
                  setView('home')
                  setAuthMessage('')
                  resetForm()
                }}
                className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium ${landingTheme.secondaryButton}`}
              >
                <ArrowLeft size={15} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
