import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  MoonStar,
  Palette,
  Pencil,
  PlusCircle,
  Save,
  Search,
  Sparkles,
  SunMedium,
  Target,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'

const platforms = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'YouTube']
const REPORTS_KEY = 'mrp_daily_reports'
const SERVICES_KEY = 'mrp_services'

const today = () => new Date().toISOString().split('T')[0]

const readStoredArray = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const makeChannel = () => ({
  id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  platform: 'Instagram',
  follows: '',
})

const emptyService = () => ({
  name: '',
  notes: '',
  channels: [makeChannel()],
})

const defaultServices = [
  {
    id: 'svc-1',
    name: 'Creator Launch Pack',
    notes: 'Starter setup for new creators.',
    channels: [
      { id: 'ch-1', platform: 'Instagram', follows: '2000' },
      { id: 'ch-2', platform: 'TikTok', follows: '1500' },
    ],
    updatedAt: today(),
  },
]

const toSafeLower = (value) => String(value || '').toLowerCase()

const initialModalState = {
  open: false,
  type: 'info',
  title: '',
  message: '',
  countdown: 0,
  onConfirm: null,
}

const normalizeChannels = (channels = []) =>
  (Array.isArray(channels) ? channels : []).map((channel) => ({
    id: channel.id || makeChannel().id,
    platform: channel.platform || 'Instagram',
    follows: String(Number(channel.follows) || 0),
  }))

const mergeServiceAndReportChannels = (serviceChannels = [], reportChannels = []) => {
  const normalizedService = normalizeChannels(serviceChannels)
  const normalizedReport = normalizeChannels(reportChannels)
  const reportById = new Map(normalizedReport.map((channel) => [channel.id, channel]))

  return normalizedService.map((serviceChannel) => {
    const reportChannel = reportById.get(serviceChannel.id)
    return reportChannel
      ? { ...serviceChannel, follows: reportChannel.follows }
      : serviceChannel
  })
}

const formatNumber = (value) => Number(value || 0).toLocaleString()

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview')
  const [darkMode, setDarkMode] = useState(true)

  const [reportDate, setReportDate] = useState(today())
  const [selectedReportServiceId, setSelectedReportServiceId] = useState('')
  const [reportChannels, setReportChannels] = useState([])
  const [selectedReportChannelId, setSelectedReportChannelId] = useState(null)
  const [editingReportId, setEditingReportId] = useState(null)
  const [reportMessage, setReportMessage] = useState('')
  const [savedReports, setSavedReports] = useState(() => readStoredArray(REPORTS_KEY, []))
  const [selectedHistoryReportIds, setSelectedHistoryReportIds] = useState([])

  const [serviceForm, setServiceForm] = useState(emptyService())
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [serviceMessage, setServiceMessage] = useState('')
  const [serviceQuery, setServiceQuery] = useState('')
  const [savedServices, setSavedServices] = useState(() =>
    readStoredArray(SERVICES_KEY, defaultServices),
  )

  const loadServiceChannelsForDate = (serviceId, date, incomingReports = savedReports) => {
    const service = savedServices.find((item) => item.id === serviceId)
    if (!service) return []

    const existingReport = incomingReports.find(
      (report) => report.serviceId === serviceId && report.date === date,
    )

    return mergeServiceAndReportChannels(service.channels, existingReport?.channels)
  }

  const [modalState, setModalState] = useState(initialModalState)

  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(savedReports))
  }, [savedReports])

  useEffect(() => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(savedServices))
  }, [savedServices])

  useEffect(() => {
    if (!modalState.open || modalState.type !== 'confirm_delete' || modalState.countdown <= 0) {
      return
    }

    const timer = setTimeout(() => {
      setModalState((current) => ({ ...current, countdown: current.countdown - 1 }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [modalState.open, modalState.type, modalState.countdown])

  const theme = darkMode
    ? {
        shell: 'min-h-screen bg-[#07111f] text-slate-100 selection:bg-cyan-400/30',
        glow:
          'before:pointer-events-none before:absolute before:left-[-12rem] before:top-[-8rem] before:h-80 before:w-80 before:rounded-full before:bg-cyan-400/18 before:blur-3xl after:pointer-events-none after:absolute after:bottom-[-12rem] after:right-[-10rem] after:h-96 after:w-96 after:rounded-full after:bg-blue-500/12 after:blur-3xl',
        gridOverlay:
          'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_34%),linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]',
        sidebar: 'border border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl',
        navIdle: 'text-slate-300 hover:bg-white/8 hover:text-white',
        navActive: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(56,189,248,0.28)]',
        card:
          'border border-white/10 bg-white/6 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-2xl',
        cardSoft: 'border border-white/10 bg-white/5 backdrop-blur-xl',
        input:
          'w-full rounded-2xl border border-white/12 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/30',
        subtle: 'text-slate-400',
        title: 'text-white',
        accent: 'text-cyan-300',
        pill: 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
        secondaryButton:
          'border border-white/12 bg-white/6 text-slate-100 hover:bg-white/10',
        tableHead: 'border-white/10 text-slate-400',
        tableRow: 'border-white/8 hover:bg-white/5',
        chip: 'border border-white/10 bg-white/8 text-slate-200',
        modal: 'border border-white/10 bg-slate-950/95 text-white',
      }
    : {
        shell: 'min-h-screen bg-[#f4f8fc] text-slate-900 selection:bg-sky-200',
        glow:
          'before:pointer-events-none before:absolute before:left-[-8rem] before:top-[-6rem] before:h-72 before:w-72 before:rounded-full before:bg-sky-300/35 before:blur-3xl after:pointer-events-none after:absolute after:bottom-[-10rem] after:right-[-6rem] after:h-80 after:w-80 after:rounded-full after:bg-cyan-200/45 after:blur-3xl',
        gridOverlay:
          'bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_38%),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]',
        sidebar: 'border border-slate-200/70 bg-white/75 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur-2xl',
        navIdle: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        navActive: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white shadow-[0_14px_40px_rgba(14,165,233,0.28)]',
        card:
          'border border-white/70 bg-white/75 shadow-[0_24px_70px_rgba(148,163,184,0.16)] backdrop-blur-2xl',
        cardSoft: 'border border-slate-200/70 bg-white/65 backdrop-blur-xl',
        input:
          'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200',
        subtle: 'text-slate-500',
        title: 'text-slate-950',
        accent: 'text-sky-700',
        pill: 'border border-sky-200 bg-sky-50 text-sky-700',
        secondaryButton:
          'border border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50',
        tableHead: 'border-slate-200 text-slate-500',
        tableRow: 'border-slate-100 hover:bg-sky-50/70',
        chip: 'border border-slate-200 bg-slate-50 text-slate-700',
        modal: 'border border-slate-200 bg-white text-slate-900',
      }

  const panelClass = `overflow-hidden rounded-[28px] p-6 sm:p-7 ${theme.card}`
  const actionButtonBase = darkMode
    ? 'border-white/12 bg-white/8 text-slate-200'
    : 'border-slate-200 bg-slate-100 text-slate-600'
  const actionButtonEdit = `inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${actionButtonBase} ${
    darkMode ? 'hover:text-sky-300' : 'hover:text-sky-600'
  }`
  const actionButtonDelete = `inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${actionButtonBase} ${
    darkMode ? 'hover:text-rose-400' : 'hover:text-rose-600'
  }`
  const actionButtonDeleteWide = `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${actionButtonBase} ${
    darkMode ? 'hover:text-rose-400' : 'hover:text-rose-600'
  }`
  const actionButtonDeleteModal = `rounded-full border px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${actionButtonBase} ${
    darkMode ? 'hover:text-rose-400' : 'hover:text-rose-600'
  }`
  const selectedReportService = useMemo(
    () => savedServices.find((service) => service.id === selectedReportServiceId) || null,
    [savedServices, selectedReportServiceId],
  )

  const selectedReportChannel = useMemo(
    () => reportChannels.find((channel) => channel.id === selectedReportChannelId) || null,
    [reportChannels, selectedReportChannelId],
  )

  const serviceNameById = useMemo(
    () =>
      savedServices.reduce((acc, service) => {
        acc[service.id] = service.name
        return acc
      }, {}),
    [savedServices],
  )

  const resolveReportServiceName = (report) =>
    serviceNameById[report?.serviceId] || report?.serviceName || 'Legacy Report'

  const savedServiceIds = useMemo(
    () => new Set(savedServices.map((service) => service.id)),
    [savedServices],
  )

  const activeReports = useMemo(
    () =>
      savedReports.filter(
        (report) => report?.serviceId && savedServiceIds.has(report.serviceId),
      ),
    [savedReports, savedServiceIds],
  )

  useEffect(() => {
    if (activeReports.length !== savedReports.length) {
      setSavedReports(activeReports)
    }

    if (selectedReportServiceId && !savedServiceIds.has(selectedReportServiceId)) {
      setSelectedReportServiceId('')
      setReportChannels([])
      setSelectedReportChannelId(null)
      setEditingReportId(null)
      setReportMessage('')
    }
  }, [activeReports, savedReports.length, savedServiceIds, selectedReportServiceId])

  useEffect(() => {
    setSelectedHistoryReportIds((current) =>
      current.filter((reportId) => activeReports.some((report) => report.id === reportId)),
    )
  }, [activeReports])

  const overallServiceFollows = useMemo(
    () =>
      savedServices.reduce(
        (sum, service) =>
          sum +
          (Array.isArray(service.channels) ? service.channels : []).reduce(
            (channelSum, channel) => channelSum + (Number(channel.follows) || 0),
            0,
          ),
        0,
      ),
    [savedServices],
  )

  const metricsTracked = useMemo(
    () =>
      savedServices.reduce(
        (sum, service) => sum + (Array.isArray(service.channels) ? service.channels.length : 0),
        0,
      ),
    [savedServices],
  )

  const overviewPerformanceScore = useMemo(() => {
    const base = 55
    const serviceImpact = Math.min(savedServices.length * 6, 24)
    const metricsImpact = Math.min(metricsTracked * 2, 21)
    return Math.min(100, base + serviceImpact + metricsImpact)
  }, [savedServices.length, metricsTracked])

  const overviewHealthScore = useMemo(() => {
    const base = 50
    const followsImpact = Math.min(Math.floor(overallServiceFollows / 500), 30)
    const structureImpact = Math.min(metricsTracked * 2, 20)
    return Math.min(100, base + followsImpact + structureImpact)
  }, [overallServiceFollows, metricsTracked])

  const serviceReportStats = useMemo(() => {
    return activeReports.reduce((acc, report) => {
      const serviceId = report?.serviceId
      if (!serviceId) return acc

      const follows = Number(report.totalFollows ?? report.totals?.follows ?? 0) || 0
      const reportDay = String(report.date || '')

      if (!acc[serviceId]) {
        acc[serviceId] = {
          dailyFollows: follows,
          allTimeFollows: follows,
          latestDate: reportDay,
        }
        return acc
      }

      acc[serviceId].allTimeFollows += follows
      if (reportDay >= acc[serviceId].latestDate) {
        acc[serviceId].dailyFollows = follows
        acc[serviceId].latestDate = reportDay
      }

      return acc
    }, {})
  }, [activeReports])

  const filteredServices = useMemo(
    () =>
      savedServices.filter((service) => {
        const q = toSafeLower(serviceQuery)
        return (
          toSafeLower(service.name).includes(q) ||
          toSafeLower(service.notes).includes(q) ||
          (Array.isArray(service.channels) ? service.channels : []).some((channel) =>
            toSafeLower(channel.platform).includes(q),
          )
        )
      }),
    [savedServices, serviceQuery],
  )

  const recentReports = useMemo(
    () =>
      [...activeReports]
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        .slice(0, 4),
    [activeReports],
  )

  const latestReport = recentReports[0] || null

  const serviceSnapshots = useMemo(
    () =>
      savedServices.slice(0, 3).map((service) => {
        const reportStats = serviceReportStats[service.id]
        const channels = Array.isArray(service.channels) ? service.channels : []
        const baseFollows = channels.reduce(
          (sum, channel) => sum + (Number(channel.follows) || 0),
          0,
        )

        return {
          id: service.id,
          name: service.name,
          notes: service.notes,
          platforms: channels.length,
          latestFollows: reportStats?.dailyFollows ?? baseFollows,
          lifetimeFollows: reportStats?.allTimeFollows ?? baseFollows,
        }
      }),
    [savedServices, serviceReportStats],
  )

  const topPlatforms = useMemo(() => {
    const grouped = savedServices.reduce((acc, service) => {
      const channels = Array.isArray(service.channels) ? service.channels : []
      channels.forEach((channel) => {
        const platform = channel.platform || 'Unknown'
        acc[platform] = (acc[platform] || 0) + (Number(channel.follows) || 0)
      })
      return acc
    }, {})

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
  }, [savedServices])

  const overviewHero = useMemo(() => {
    if (!savedServices.length) {
      return {
        headline: 'A clearer reporting workflow for managing services and daily performance.',
        description:
          'Add services and save daily reports to build a live overview of names, channels, and follow activity.',
      }
    }

    if (latestReport) {
      const latestCount = Number(latestReport.totalFollows ?? latestReport.totals?.follows ?? 0)
      const latestChannels = Array.isArray(latestReport.channels)
        ? latestReport.channels.length
        : 0

      return {
        headline: `${resolveReportServiceName(latestReport)} leads the most recent update with ${formatNumber(latestCount)} follows recorded.`,
        description: `The overview is reflecting your current service library, including renamed services, ${formatNumber(savedServices.length)} active service${savedServices.length > 1 ? 's' : ''}, and the latest daily report from ${latestReport.date} across ${latestChannels} channel${latestChannels === 1 ? '' : 's'}.`,
      }
    }

    return {
      headline: `You currently have ${formatNumber(savedServices.length)} active service${savedServices.length > 1 ? 's' : ''} ready for reporting.`,
      description:
        'The overview stays aligned with your current service names and channel setup, and daily follow updates will appear here as new reports are saved.',
    }
  }, [latestReport, savedServices.length])

  const closeModal = () => {
    setModalState(initialModalState)
  }

  const showNotification = (title, message) => {
    setModalState({
      open: true,
      type: 'info',
      title,
      message,
      countdown: 0,
      onConfirm: null,
    })
  }

  const requestDeleteConfirmation = (title, message, onConfirm) => {
    setModalState({
      open: true,
      type: 'confirm_delete',
      title,
      message,
      countdown: 5,
      onConfirm,
    })
  }

  const runModalConfirm = () => {
    const confirmHandler = modalState.onConfirm
    closeModal()
    if (typeof confirmHandler === 'function') {
      confirmHandler()
    }
  }

  const toggleHistoryReportSelection = (reportId) => {
    setSelectedHistoryReportIds((current) =>
      current.includes(reportId)
        ? current.filter((id) => id !== reportId)
        : [...current, reportId],
    )
  }

  const deleteSelectedHistoryReports = () => {
    if (!selectedHistoryReportIds.length) return

    const selectedCount = selectedHistoryReportIds.length
    requestDeleteConfirmation(
      'Delete Saved Report?',
      `Do you really want to delete ${selectedCount} saved report${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`,
      () => {
        setSavedReports((current) =>
          current.filter((report) => !selectedHistoryReportIds.includes(report.id)),
        )
        setSelectedHistoryReportIds([])
        showNotification(
          'Report Deleted',
          `${selectedCount} saved report${selectedCount > 1 ? 's were' : ' was'} deleted successfully.`,
        )
      },
    )
  }

  const handleReportServiceChange = (serviceId) => {
    setSelectedReportServiceId(serviceId)
    setEditingReportId(null)
    setReportMessage('')

    if (!serviceId) {
      setReportChannels([])
      setSelectedReportChannelId(null)
      return
    }

    const nextChannels = loadServiceChannelsForDate(serviceId, reportDate)
    setReportChannels(nextChannels)
    setSelectedReportChannelId(nextChannels[0]?.id || null)
  }

  const handleReportDateChange = (date) => {
    setReportDate(date)
    setEditingReportId(null)
    setReportMessage('')

    if (!selectedReportServiceId) return

    const nextChannels = loadServiceChannelsForDate(selectedReportServiceId, date)
    setReportChannels(nextChannels)
    setSelectedReportChannelId(nextChannels[0]?.id || null)
  }

  const updateReportChannelFollows = (channelId, follows) => {
    setReportChannels((curr) =>
      curr.map((channel) =>
        channel.id === channelId
          ? { ...channel, follows: follows.replace(/[^\d]/g, '') }
          : channel,
      ),
    )
  }

  const saveReport = () => {
    if (!reportDate) return setReportMessage('Please choose a report date.')
    if (!selectedReportServiceId) return setReportMessage('Please select a service.')
    if (!reportChannels.length) {
      return setReportMessage('No social media entries found for this service.')
    }

    const hasInvalid = reportChannels.some((channel) => !channel.follows.trim())
    if (hasInvalid) return setReportMessage('Each social media entry needs a follows value.')

    const baseData = {
      date: reportDate,
      serviceId: selectedReportServiceId,
      serviceName: selectedReportService?.name || 'Unknown Service',
      channels: reportChannels.map((channel) => ({
        ...channel,
        follows: String(Number(channel.follows) || 0),
      })),
      totalFollows: reportChannels.reduce(
        (sum, channel) => sum + (Number(channel.follows) || 0),
        0,
      ),
    }

    let didUpdate = false
    let resolvedId = editingReportId || `${Date.now()}`

    setSavedReports((curr) => {
      const matchById = editingReportId
        ? curr.find((report) => report.id === editingReportId)
        : null

      const matchByServiceAndDate = curr.find(
        (report) => report.serviceId === selectedReportServiceId && report.date === reportDate,
      )

      const matched = matchById || matchByServiceAndDate
      if (matched) {
        didUpdate = true
        resolvedId = matched.id
      }

      const next = curr.filter(
        (report) =>
          report.id !== resolvedId &&
          !(report.serviceId === selectedReportServiceId && report.date === reportDate),
      )

      return [{ ...baseData, id: resolvedId }, ...next]
    })

    setEditingReportId(resolvedId)
    setReportMessage(didUpdate ? 'Report updated successfully.' : 'Report saved successfully.')
    showNotification(
      didUpdate ? 'Report Updated' : 'Report Saved',
      didUpdate
        ? 'Daily report numbers were updated successfully.'
        : 'Daily report was created successfully.',
    )
  }

  const addChannel = () => {
    setServiceForm((curr) => ({ ...curr, channels: [...curr.channels, makeChannel()] }))
    showNotification('Entry Added', 'A new social media entry was added to this service.')
  }

  const updateChannel = (channelId, field, value) => {
    setServiceForm((curr) => ({
      ...curr,
      channels: curr.channels.map((channel) =>
        channel.id === channelId
          ? {
              ...channel,
              [field]: field === 'follows' ? value.replace(/[^\d]/g, '') : value,
            }
          : channel,
      ),
    }))
  }

  const removeChannel = (channelId) => {
    requestDeleteConfirmation(
      'Delete Social Media Entry?',
      'Do you really want to delete this social media entry? This action cannot be undone.',
      () => {
        setServiceForm((curr) => {
          const nextChannels = curr.channels.filter((channel) => channel.id !== channelId)
          return {
            ...curr,
            channels: nextChannels.length ? nextChannels : [makeChannel()],
          }
        })
        showNotification('Entry Deleted', 'Social media entry deleted successfully.')
      },
    )
  }

  const saveService = () => {
    if (!serviceForm.name.trim()) {
      setServiceMessage('Service name is required.')
      return
    }

    if (!serviceForm.channels.length) {
      setServiceMessage('Add at least one social media entry.')
      return
    }

    const hasInvalidChannel = serviceForm.channels.some(
      (channel) => !channel.platform || !channel.follows.trim(),
    )
    if (hasInvalidChannel) {
      setServiceMessage('Each social media entry must have platform and follows.')
      return
    }

    const duplicate = savedServices.some(
      (service) =>
        toSafeLower(service.name) === toSafeLower(serviceForm.name) &&
        service.id !== editingServiceId,
    )
    if (duplicate) {
      setServiceMessage('A service with this name already exists.')
      return
    }

    const normalizedChannels = serviceForm.channels.map((channel) => ({
      ...channel,
      follows: String(Number(channel.follows) || 0),
    }))

    const data = {
      id: editingServiceId || `svc-${Date.now()}`,
      name: serviceForm.name.trim(),
      notes: serviceForm.notes.trim(),
      channels: normalizedChannels,
      updatedAt: today(),
    }

    setSavedServices((curr) =>
      editingServiceId
        ? curr.map((service) => (service.id === editingServiceId ? data : service))
        : [data, ...curr],
    )
    if (editingServiceId) {
      setSavedReports((curr) =>
        curr.map((report) =>
          report.serviceId === editingServiceId
            ? { ...report, serviceName: data.name }
            : report,
        ),
      )
    }
    setEditingServiceId(null)
    setServiceForm(emptyService())
    setServiceMessage(
      editingServiceId
        ? 'Service updated successfully. You can now create another service.'
        : 'Service created successfully. Add another service if needed.',
    )
    showNotification(
      editingServiceId ? 'Service Updated' : 'Service Created',
      editingServiceId
        ? 'Service details were updated successfully.'
        : 'Service created successfully.',
    )
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, caption: 'Pulse + trends' },
    { id: 'reports', label: 'Daily Reports', icon: FileText, caption: 'Track daily growth' },
    { id: 'create-service', label: 'Create Service', icon: PlusCircle, caption: 'Build products' },
    { id: 'theme', label: 'Theme', icon: Palette, caption: 'Tune appearance' },
  ]

  const stats = [
    {
      label: 'Services',
      value: formatNumber(savedServices.length),
      hint: 'Active products configured',
      icon: Users,
    },
    {
      label: 'Metrics Tracked',
      value: formatNumber(metricsTracked),
      hint: 'Social channels under watch',
      icon: Target,
    },
    {
      label: 'Overall Follows',
      value: formatNumber(overallServiceFollows),
      hint: 'Combined audience size',
      icon: UserPlus,
    },
    {
      label: 'Health Score',
      value: `${overviewHealthScore}%`,
      hint: 'Structure and momentum check',
      icon: TrendingUp,
    },
  ]

  return (
    <main className={theme.shell}>
      <div className={`relative isolate overflow-hidden ${theme.glow}`}>
        <div className={`absolute inset-0 opacity-80 ${theme.gridOverlay}`} />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
          <aside className={`w-full rounded-[30px] p-5 lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-[320px] lg:flex-col lg:overflow-y-auto ${theme.sidebar}`}>
            <div className={`rounded-[26px] p-5 ${theme.cardSoft}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${theme.accent}`}>
                    Master Report Platform
                  </p>
                  <h1 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Dashboard</h1>
                  <p className={`mt-2 text-sm leading-6 ${theme.subtle}`}>
                    A cleaner command center for daily reporting, service performance, and growth tracking.
                  </p>
                </div>
                <div className={`rounded-2xl p-3 ${theme.pill}`}>
                  <Sparkles size={18} />
                </div>
              </div>
            </div>

            <nav className="mt-5 space-y-2">
              {navItems.map((item) => {
                const isActive = tab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`group flex w-full items-center gap-4 rounded-[22px] px-4 py-4 text-left transition-all duration-300 ${
                      isActive ? theme.navActive : theme.navIdle
                    }`}
                  >
                    <div className={`rounded-2xl p-3 ${isActive ? 'bg-white/14' : theme.cardSoft}`}>
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : theme.subtle}`}>{item.caption}</p>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'opacity-100' : 'opacity-40'} />
                  </button>
                )
              })}
            </nav>

            <div className={`mt-5 rounded-[24px] p-4 ${theme.cardSoft}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>
                Live Snapshot
              </p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme.subtle}`}>Reports logged</span>
                  <span className={`text-sm font-semibold ${theme.title}`}>{formatNumber(activeReports.length)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme.subtle}`}>Last updated</span>
                  <span className={`text-sm font-semibold ${theme.title}`}>{activeReports[0]?.date || 'No reports yet'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme.subtle}`}>Theme</span>
                  <button
                    onClick={() => setDarkMode((current) => !current)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${theme.pill}`}
                  >
                    {darkMode ? <MoonStar size={14} /> : <SunMedium size={14} />}
                    {darkMode ? 'Midnight' : 'Cloud'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-medium transition-colors ${theme.secondaryButton}`}
            >
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          <section className="flex-1 space-y-6 pb-6 lg:pt-1">
            {tab === 'overview' && (
              <header className={`${panelClass} overflow-hidden`}>
                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${theme.pill}`}>
                      <Sparkles size={14} />
                      Reporting Workspace
                    </div>
                    <h2 className={`mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl ${theme.title}`}>
                      {overviewHero.headline}
                    </h2>
                    <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${theme.subtle}`}>
                      {overviewHero.description}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {stats.map((item) => (
                        <article
                          key={item.label}
                          className={`min-w-0 overflow-hidden rounded-[22px] p-4 sm:p-5 ${theme.cardSoft}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className={`min-w-0 break-words text-sm leading-5 ${theme.subtle}`}>
                              {item.label}
                            </p>
                            <div className={`shrink-0 rounded-2xl p-2 ${theme.pill}`}>
                              <item.icon size={15} />
                            </div>
                          </div>
                          <p
                            className={`mt-4 overflow-hidden break-all text-[clamp(1.45rem,2.4vw,2.15rem)] font-semibold leading-tight ${theme.title}`}
                          >
                            {item.value}
                          </p>
                          <p className={`mt-2 break-words text-xs leading-5 ${theme.subtle}`}>
                            {item.hint}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[26px] p-5 ${theme.cardSoft}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                          Performance Lens
                        </p>
                        <h3 className={`mt-3 text-xl font-semibold ${theme.title}`}>Performance confidence</h3>
                      </div>
                      <div className={`rounded-2xl p-3 ${theme.pill}`}>
                        <TrendingUp size={18} />
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className={`rounded-[22px] p-4 ${theme.card}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme.subtle}`}>Performance score</span>
                          <span className={`text-lg font-semibold ${theme.title}`}>{overviewPerformanceScore}%</span>
                        </div>
                        <div className={`mt-3 h-2.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600"
                            style={{ width: `${overviewPerformanceScore}%` }}
                          />
                        </div>
                      </div>

                      <div className={`rounded-[22px] p-4 ${theme.card}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme.subtle}`}>Health score</span>
                          <span className={`text-lg font-semibold ${theme.title}`}>{overviewHealthScore}%</span>
                        </div>
                        <div className={`mt-3 h-2.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500"
                            style={{ width: `${overviewHealthScore}%` }}
                          />
                        </div>
                      </div>

                      <div className={`rounded-[22px] p-4 ${theme.card}`}>
                        <p className={`text-sm ${theme.subtle}`}>Top platform mix</p>
                        <div className="mt-4 space-y-3">
                          {topPlatforms.length ? (
                            topPlatforms.map(([platform, count]) => (
                              <div key={platform} className="flex items-center justify-between gap-4">
                                <span className={`text-sm ${theme.title}`}>{platform}</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.pill}`}>
                                  {formatNumber(count)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className={`text-sm ${theme.subtle}`}>Add service channels to see platform distribution.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            )}

            {tab === 'overview' && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className={panelClass}>
                  <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                          Service Focus
                        </p>
                      <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Current service overview</h3>
                      </div>
                    <div className={`rounded-2xl p-3 ${theme.pill}`}>
                      <LayoutDashboard size={18} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {serviceSnapshots.length ? (
                      serviceSnapshots.map((service) => (
                        <article key={service.id} className={`min-w-0 overflow-hidden rounded-[24px] p-5 ${theme.cardSoft}`}>
                          <p className={`break-words text-sm font-medium ${theme.title}`}>{service.name}</p>
                          <p className={`mt-2 min-h-[42px] text-sm leading-6 ${theme.subtle}`}>
                            {service.notes || 'Clean service setup with active platform tracking.'}
                          </p>
                          <div className="mt-5 flex items-center justify-between">
                            <div>
                              <p className={`text-xs uppercase tracking-[0.16em] ${theme.subtle}`}>Platforms</p>
                              <p className={`mt-1 break-words text-xl font-semibold leading-tight ${theme.title}`}>{service.platforms}</p>
                            </div>
                            <div>
                              <p className={`text-xs uppercase tracking-[0.16em] ${theme.subtle}`}>Latest</p>
                              <p className={`mt-1 break-words text-xl font-semibold leading-tight ${theme.title}`}>{formatNumber(service.latestFollows)}</p>
                            </div>
                          </div>
                          <div className={`mt-5 rounded-[18px] p-4 ${theme.card}`}>
                            <p className={`text-xs uppercase tracking-[0.16em] ${theme.subtle}`}>Lifetime follows</p>
                            <p className={`mt-2 break-words text-lg font-semibold leading-tight ${theme.title}`}>{formatNumber(service.lifetimeFollows)}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className={`rounded-[24px] p-6 ${theme.cardSoft}`}>
                        <p className={`text-sm ${theme.subtle}`}>Create your first service to populate the overview.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className={panelClass}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                          Recent Activity
                        </p>
                        <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Latest report activity</h3>
                      </div>
                      <CalendarDays className={theme.accent} size={18} />
                    </div>

                    <div className="mt-6 space-y-3">
                      {recentReports.length ? (
                        recentReports.map((report) => (
                          <div key={report.id} className={`rounded-[20px] p-4 ${theme.cardSoft}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-sm font-medium ${theme.title}`}>{resolveReportServiceName(report)}</p>
                                <p className={`mt-1 text-xs ${theme.subtle}`}>{report.date}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.pill}`}>
                                {formatNumber(report.totalFollows ?? report.totals?.follows ?? 0)}
                              </span>
                            </div>
                            <p className={`mt-3 text-sm ${theme.subtle}`}>
                              {Array.isArray(report.channels) ? report.channels.length : 0} social media entries captured.
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className={`text-sm ${theme.subtle}`}>No reports saved yet. Your daily snapshots will appear here.</p>
                      )}
                    </div>
                  </div>

                </section>
              </div>
            )}

            {tab === 'reports' && (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <section className={panelClass}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                          Report Setup
                        </p>
                        <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Capture daily numbers</h3>
                      </div>
                      <div className={`rounded-2xl p-3 ${theme.pill}`}>
                        <FileText size={18} />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      <div>
                        <label className={`mb-2 block text-sm ${theme.subtle}`}>Report Date</label>
                        <input
                          type="date"
                          value={reportDate}
                          onChange={(e) => handleReportDateChange(e.target.value)}
                          className={theme.input}
                        />
                      </div>

                      <div>
                        <label className={`mb-2 block text-sm ${theme.subtle}`}>Select Service</label>
                        <select
                          value={selectedReportServiceId}
                          onChange={(e) => handleReportServiceChange(e.target.value)}
                          className={theme.input}
                        >
                          <option value="">Choose a service</option>
                          {savedServices.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {reportMessage ? (
                      <div className={`mt-5 rounded-[18px] p-4 text-sm ${theme.cardSoft}`}>
                        {reportMessage}
                      </div>
                    ) : null}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className={`rounded-[20px] p-4 ${theme.cardSoft}`}>
                        <p className={`text-sm ${theme.subtle}`}>Selected service</p>
                        <p className={`mt-2 text-lg font-semibold ${theme.title}`}>
                          {selectedReportService?.name || 'Nothing selected'}
                        </p>
                      </div>
                      <div className={`rounded-[20px] p-4 ${theme.cardSoft}`}>
                        <p className={`text-sm ${theme.subtle}`}>Current total</p>
                        <p className={`mt-2 text-lg font-semibold ${theme.title}`}>
                          {formatNumber(
                            reportChannels.reduce(
                              (sum, channel) => sum + (Number(channel.follows) || 0),
                              0,
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className={panelClass}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                          Channel Entry
                        </p>
                        <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Service social channels</h3>
                      </div>
                      <div className={`rounded-2xl p-3 ${theme.pill}`}>
                        <Target size={18} />
                      </div>
                    </div>

                    {!selectedReportService ? (
                      <div className={`mt-6 rounded-[22px] p-5 ${theme.cardSoft}`}>
                        <p className={`text-sm ${theme.subtle}`}>
                          Select a service first to reveal the channels you want to update for this date.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-6 flex flex-wrap gap-3">
                          {reportChannels.map((channel) => {
                            const isActive = selectedReportChannelId === channel.id
                            return (
                              <button
                                key={channel.id}
                                onClick={() => setSelectedReportChannelId(channel.id)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                  isActive ? theme.navActive : theme.secondaryButton
                                }`}
                              >
                                {channel.platform}
                              </button>
                            )
                          })}
                        </div>

                        {selectedReportChannel ? (
                          <div className={`mt-6 rounded-[24px] p-5 ${theme.cardSoft}`}>
                            <p className={`text-sm ${theme.subtle}`}>Entering follows for</p>
                            <h4 className={`mt-2 text-xl font-semibold ${theme.title}`}>
                              {selectedReportChannel.platform}
                            </h4>
                            <p className={`mt-1 text-sm ${theme.subtle}`}>{reportDate}</p>
                            <div className="mt-5 max-w-sm">
                              <input
                                value={selectedReportChannel.follows}
                                onChange={(e) =>
                                  updateReportChannelFollows(
                                    selectedReportChannel.id,
                                    e.target.value,
                                  )
                                }
                                className={theme.input}
                                placeholder="Follows for this day"
                              />
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={saveReport}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)] transition-transform hover:-translate-y-0.5"
                          >
                            <Save size={16} />
                            {editingReportId ? 'Update Report' : 'Save Report'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReportServiceId('')
                              setReportChannels([])
                              setSelectedReportChannelId(null)
                              setReportDate(today())
                              setEditingReportId(null)
                              setReportMessage('')
                            }}
                            className={`rounded-full px-5 py-3 text-sm font-medium ${theme.secondaryButton}`}
                          >
                            Clear
                          </button>
                        </div>
                      </>
                    )}
                  </section>
                </div>

                <section className={panelClass}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                        History
                      </p>
                      <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Saved reports</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedHistoryReportIds.length ? (
                        <button
                          onClick={deleteSelectedHistoryReports}
                          className={actionButtonDeleteWide}
                        >
                          <Trash2 size={12} />
                          Delete {formatNumber(selectedHistoryReportIds.length)}
                        </button>
                      ) : null}
                      <span className={`rounded-full px-3 py-2 text-xs font-semibold ${theme.pill}`}>
                        {formatNumber(activeReports.length)} entries
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={`border-b ${theme.tableHead}`}>
                          <th className="w-12 px-3 py-3 text-left">Select</th>
                          <th className="px-3 py-3 text-left">Date</th>
                          <th className="px-3 py-3 text-left">Service</th>
                          <th className="px-3 py-3 text-left">Channels</th>
                          <th className="px-3 py-3 text-left">Follows</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeReports.map((report) => (
                          <tr
                            key={report.id}
                            className={`group border-b transition-colors ${theme.tableRow} ${
                              selectedHistoryReportIds.includes(report.id)
                                ? darkMode
                                  ? 'bg-white/5'
                                  : 'bg-sky-50/80'
                                : ''
                            }`}
                          >
                            <td className="px-3 py-4">
                              <label
                                className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-opacity ${
                                  selectedHistoryReportIds.includes(report.id)
                                    ? 'border-cyan-400 opacity-100'
                                    : darkMode
                                      ? 'border-white/20 opacity-40 group-hover:opacity-100'
                                      : 'border-slate-300 opacity-50 group-hover:opacity-100'
                                } ${darkMode ? 'bg-slate-950/35' : 'bg-white'}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedHistoryReportIds.includes(report.id)}
                                  onChange={() => toggleHistoryReportSelection(report.id)}
                                  className="h-4 w-4 cursor-pointer accent-cyan-500"
                                  aria-label={`Select report for ${resolveReportServiceName(report)} on ${report.date}`}
                                />
                              </label>
                            </td>
                            <td className="px-3 py-4">{report.date}</td>
                            <td className="px-3 py-4">{resolveReportServiceName(report)}</td>
                            <td className="px-3 py-4">
                              {Array.isArray(report.channels) ? report.channels.length : 0}
                            </td>
                            <td className="px-3 py-4">
                              {formatNumber(report.totalFollows ?? report.totals?.follows ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className={panelClass}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                        Service Library
                      </p>
                      <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Search services and totals</h3>
                    </div>

                    <div className="relative w-full md:max-w-sm">
                      <Search
                        size={15}
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${theme.subtle}`}
                      />
                      <input
                        className={`pl-11 ${theme.input}`}
                        placeholder="Search service or platform..."
                        value={serviceQuery}
                        onChange={(e) => setServiceQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className={`border-b ${theme.tableHead}`}>
                          <th className="px-3 py-3 text-left">Service</th>
                          <th className="px-3 py-3 text-left">Social Media</th>
                          <th className="px-3 py-3 text-left">Daily Follows</th>
                          <th className="px-3 py-3 text-left">All-Time Follows</th>
                          <th className="px-3 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServices.map((service) => {
                          const channels = Array.isArray(service.channels) ? service.channels : []
                          const serviceStats = serviceReportStats[service.id]
                          const fallbackFollows = channels.reduce(
                            (sum, channel) => sum + (Number(channel.follows) || 0),
                            0,
                          )
                          const dailyFollows = serviceStats?.dailyFollows ?? 0
                          const allTimeFollows = serviceStats?.allTimeFollows ?? fallbackFollows

                          return (
                            <tr key={service.id} className={`border-b transition-colors ${theme.tableRow}`}>
                              <td className="px-3 py-4">
                                <p className={`font-medium ${theme.title}`}>{service.name}</p>
                                {service.notes ? (
                                  <p className={`mt-1 text-xs ${theme.subtle}`}>{service.notes}</p>
                                ) : null}
                              </td>
                              <td className="px-3 py-4">
                                <div className="flex flex-wrap gap-2">
                                  {channels.map((channel) => (
                                    <span
                                      key={channel.id}
                                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${theme.chip}`}
                                    >
                                      {channel.platform}: {formatNumber(channel.follows)}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-3 py-4">{formatNumber(dailyFollows)}</td>
                              <td className="px-3 py-4">{formatNumber(allTimeFollows)}</td>
                              <td className="px-3 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => {
                                      setServiceForm({
                                        ...service,
                                        channels: service.channels.map((channel) => ({
                                          ...channel,
                                          id: channel.id || makeChannel().id,
                                        })),
                                      })
                                      setEditingServiceId(service.id)
                                      setServiceMessage('Editing selected service.')
                                      setTab('create-service')
                                    }}
                                    className={actionButtonEdit}
                                  >
                                    <Pencil size={12} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      requestDeleteConfirmation(
                                        'Delete Service?',
                                        'Do you really want to delete this service? This action cannot be undone.',
                                        () => {
                                          setSavedServices((curr) =>
                                            curr.filter((entry) => entry.id !== service.id),
                                          )
                                          setSavedReports((curr) =>
                                            curr.filter((report) => report.serviceId !== service.id),
                                          )
                                          if (selectedReportServiceId === service.id) {
                                            setSelectedReportServiceId('')
                                            setReportChannels([])
                                            setSelectedReportChannelId(null)
                                          }
                                          showNotification(
                                            'Service Deleted',
                                            'Service deleted successfully.',
                                          )
                                        },
                                      )
                                    }
                                    className={actionButtonDelete}
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {tab === 'create-service' && (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="space-y-6">
                  <div className={panelClass}>
                    <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                      Service Builder
                    </p>
                    <h2 className={`mt-3 text-3xl font-semibold ${theme.title}`}>
                      {editingServiceId ? 'Refine service details' : 'Create a standout service'}
                    </h2>
                    <p className={`mt-4 text-sm leading-7 ${theme.subtle}`}>
                      Each service acts like a product. Define the name, notes, and every social platform you want to track.
                    </p>
                    {serviceMessage ? (
                      <div className={`mt-5 rounded-[18px] p-4 text-sm ${theme.cardSoft}`}>
                        {serviceMessage}
                      </div>
                    ) : null}
                  </div>

                  <div className={panelClass}>
                    <div className="grid gap-4">
                      <div>
                        <label className={`mb-2 block text-sm ${theme.subtle}`}>Service / Product Name</label>
                        <input
                          className={theme.input}
                          placeholder="Service / Product Name"
                          value={serviceForm.name}
                          onChange={(e) =>
                            setServiceForm((curr) => ({ ...curr, name: e.target.value }))
                          }
                        />
                      </div>

                      <div>
                        <label className={`mb-2 block text-sm ${theme.subtle}`}>Notes</label>
                        <textarea
                          className={`${theme.input} min-h-32 resize-none`}
                          rows={4}
                          placeholder="Notes (optional)"
                          value={serviceForm.notes}
                          onChange={(e) =>
                            setServiceForm((curr) => ({ ...curr, notes: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className={panelClass}>
                  <div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                        Platform Stack
                      </p>
                      <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Social media entries</h3>
                    </div>
                    <button
                      onClick={addChannel}
                      className="mt-5 inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)]"
                    >
                      <PlusCircle size={16} />
                      Add Social Media
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {serviceForm.channels.map((channel, index) => (
                      <div key={channel.id} className={`rounded-[24px] p-5 ${theme.cardSoft}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={`text-sm font-medium ${theme.title}`}>Entry {index + 1}</p>
                            <p className={`mt-1 text-xs ${theme.subtle}`}>Choose platform and starting follows.</p>
                          </div>
                          <button
                            onClick={() => removeChannel(channel.id)}
                            className={actionButtonDelete}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div>
                            <label className={`mb-2 block text-sm ${theme.subtle}`}>Platform</label>
                            <select
                              className={theme.input}
                              value={channel.platform}
                              onChange={(e) => updateChannel(channel.id, 'platform', e.target.value)}
                            >
                              {platforms.map((platform) => (
                                <option key={platform} value={platform}>
                                  {platform}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`mb-2 block text-sm ${theme.subtle}`}>Follows</label>
                            <input
                              className={theme.input}
                              placeholder="Follows"
                              value={channel.follows}
                              onChange={(e) => updateChannel(channel.id, 'follows', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={saveService}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)]"
                    >
                      <Save size={16} />
                      {editingServiceId ? 'Update Service' : 'Save Service'}
                    </button>
                    <button
                      onClick={() => {
                        setServiceForm(emptyService())
                        setEditingServiceId(null)
                        setServiceMessage('Create a new service.')
                      }}
                      className={`rounded-full px-5 py-3 text-sm font-medium ${theme.secondaryButton}`}
                    >
                      Create New Service
                    </button>
                    <button
                      onClick={() => {
                        setServiceForm(emptyService())
                        setEditingServiceId(null)
                        setServiceMessage('')
                      }}
                      className={`rounded-full px-5 py-3 text-sm font-medium ${theme.secondaryButton}`}
                    >
                      Clear
                    </button>
                  </div>
                </section>
              </div>
            )}

            {tab === 'theme' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <section className={panelClass}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                    Appearance
                  </p>
                  <h2 className={`mt-3 text-3xl font-semibold ${theme.title}`}>Theme direction</h2>
                  <p className={`mt-4 text-sm leading-7 ${theme.subtle}`}>
                    Midnight is tuned for the strongest premium contrast, while Cloud keeps the same layout language with a brighter, lighter feel.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`rounded-[24px] border p-5 text-left transition-all ${
                        darkMode ? theme.navActive : theme.secondaryButton
                      }`}
                    >
                      <MoonStar size={18} />
                      <p className="mt-4 text-lg font-semibold">Midnight</p>
                      <p className={`mt-2 text-sm ${darkMode ? 'text-white/70' : theme.subtle}`}>
                        Dark glass surfaces, stronger glow, sharper data contrast.
                      </p>
                    </button>

                    <button
                      onClick={() => setDarkMode(false)}
                      className={`rounded-[24px] border p-5 text-left transition-all ${
                        !darkMode ? theme.navActive : theme.secondaryButton
                      }`}
                    >
                      <SunMedium size={18} />
                      <p className="mt-4 text-lg font-semibold">Cloud</p>
                      <p className={`mt-2 text-sm ${!darkMode ? 'text-white/70' : theme.subtle}`}>
                        Light panels with soft gradients and crisp typography.
                      </p>
                    </button>
                  </div>
                </section>

                <section className={panelClass}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                    Theme Preview
                  </p>
                  <h3 className={`mt-3 text-2xl font-semibold ${theme.title}`}>Appearance example</h3>

                  <div className={`mt-6 rounded-[28px] p-5 ${theme.cardSoft}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${theme.subtle}`}>Growth forecast</p>
                        <p className={`mt-2 text-3xl font-semibold ${theme.title}`}>+24.8%</p>
                      </div>
                      <div className={`rounded-2xl p-3 ${theme.pill}`}>
                        <TrendingUp size={18} />
                      </div>
                    </div>
                    <div className={`mt-5 h-2.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                      <div className="h-2.5 w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />
                    </div>
                    <p className={`mt-4 text-sm leading-7 ${theme.subtle}`}>
                      This preview mirrors the visual direction used throughout the refreshed dashboard.
                    </p>
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      </div>

      {modalState.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[28px] p-6 shadow-2xl ${theme.modal}`}>
            <h3 className="text-lg font-semibold">{modalState.title}</h3>
            <p className={`mt-3 text-sm leading-7 ${theme.subtle}`}>{modalState.message}</p>

            {modalState.type === 'confirm_delete' ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={closeModal}
                  className={`rounded-full px-5 py-3 text-sm font-medium ${theme.secondaryButton}`}
                >
                  Cancel
                </button>
                <button
                  onClick={runModalConfirm}
                  disabled={modalState.countdown > 0}
                  className={actionButtonDeleteModal}
                >
                  {modalState.countdown > 0 ? `Delete (${modalState.countdown}s)` : 'Yes, Delete'}
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={closeModal}
                  className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default Dashboard
