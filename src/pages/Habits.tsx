import { useState, useCallback, useRef } from "react"
import { useGreenhouseStore } from "@/store/greenhouse"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Droplets, Flame, Check, X, Plus, Trash2, EyeOff, MoreHorizontal } from "lucide-react"
import PixelPlant from "@/components/PixelPlant"
import AddHabitModal from "@/components/AddHabitModal"
import type { HabitCategory } from "@/types"

const HABIT_ICONS: Record<string, string> = {
  droplets: "💧",
  stretch: "🧘",
  "book-open": "📖",
  wind: "🌬️",
  footprints: "🚶",
  brain: "🧠",
}

function getHabitIcon(icon: string): string {
  return HABIT_ICONS[icon] || icon
}

export default function Habits() {
  const { habits, plants, completeHabit, waterPlant, addCustomHabit, deleteHabit, toggleHabitHidden } = useGreenhouseStore()
  const navigate = useNavigate()
  const [wateringHabit, setWateringHabit] = useState<string | null>(null)
  const [completedAnim, setCompletedAnim] = useState<string | null>(null)
  const [selectingPlantFor, setSelectingPlantFor] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [swipingHabit, setSwipingHabit] = useState<string | null>(null)
  const swipeStartX = useRef<number>(0)
  const swipeCurrentX = useRef<number>(0)

  const visibleHabits = habits.filter((h) => !h.isHidden)
  const completedCount = visibleHabits.filter((h) => h.completedToday).length
  const totalWaterAmount = visibleHabits.reduce((sum, h) => sum + (h.completedToday ? h.waterAmount : 0), 0)

  const handleComplete = useCallback(
    (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId)
      if (!habit || habit.completedToday || !plants.length) return

      if (plants.length === 1) {
        completeHabit(habitId)
        setCompletedAnim(habitId)
        setWateringHabit(habitId)
        waterPlant(plants[0].id, habitId, habit.name)
        setTimeout(() => {
          setCompletedAnim(null)
          setWateringHabit(null)
        }, 1000)
      } else {
        setSelectingPlantFor(habitId)
      }
    },
    [habits, plants, completeHabit, waterPlant]
  )

  const handleSelectPlant = useCallback(
    (plantId: string) => {
      if (!selectingPlantFor) return
      const habit = habits.find((h) => h.id === selectingPlantFor)
      if (!habit) return

      completeHabit(selectingPlantFor)
      setCompletedAnim(selectingPlantFor)
      setWateringHabit(selectingPlantFor)
      waterPlant(plantId, selectingPlantFor, habit.name)
      setSelectingPlantFor(null)

      setTimeout(() => {
        setCompletedAnim(null)
        setWateringHabit(null)
      }, 1000)
    },
    [selectingPlantFor, habits, completeHabit, waterPlant]
  )

  const handleAddHabit = useCallback(
    (name: string, category: HabitCategory, icon: string, waterAmount: number) => {
      addCustomHabit(name, category, icon, waterAmount)
    },
    [addCustomHabit]
  )

  const handleTouchStart = (e: React.TouchEvent, habitId: string) => {
    swipeStartX.current = e.touches[0].clientX
    swipeCurrentX.current = swipeStartX.current
    setSwipingHabit(habitId)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    swipeCurrentX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (habitId: string, isCustom: boolean) => {
    const diff = swipeStartX.current - swipeCurrentX.current
    if (diff > 60) {
      if (isCustom) {
        deleteHabit(habitId)
      } else {
        toggleHabitHidden(habitId)
      }
    }
    setSwipingHabit(null)
  }

  const categoryNames: Record<string, string> = {
    health: "健康",
    mind: "心灵",
    body: "身体",
  }

  const groupedHabits = visibleHabits.reduce(
    (acc, habit) => {
      if (!acc[habit.category]) acc[habit.category] = []
      acc[habit.category].push(habit)
      return acc
    },
    {} as Record<string, typeof visibleHabits>
  )

  const maxStreak = Math.max(...visibleHabits.map((h) => h.streak), 0)

  const toggleMenu = (habitId: string) => {
    setActiveMenu(activeMenu === habitId ? null : habitId)
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#F5F0E8" }}>
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl"
            style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive", color: "#4A7C59" }}
          >
            💧 今日习惯
          </h1>
          <p className="text-sm text-stone-400 mt-1">完成习惯，为你的植物浇水</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl pixel-btn-primary text-white hover:scale-105 active:scale-95 transition-transform"
          style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
        >
          <Plus size={16} />
          新建
        </button>
      </header>

      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-4 pixel-border-soft">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Check size={16} className="text-green-600" />
                <span className="text-2xl font-bold text-green-700">{completedCount}</span>
                <span className="text-sm text-stone-400">/{visibleHabits.length}</span>
              </div>
              <p className="text-xs text-stone-400">已完成</p>
            </div>
            <div className="w-px h-10 bg-stone-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplets size={16} className="text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">{totalWaterAmount}</span>
                <span className="text-sm text-stone-400">%</span>
              </div>
              <p className="text-xs text-stone-400">今日浇水</p>
            </div>
            <div className="w-px h-10 bg-stone-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame size={16} className="text-orange-500" />
                <span className="text-2xl font-bold text-orange-600">{maxStreak}</span>
                <span className="text-sm text-stone-400">天</span>
              </div>
              <p className="text-xs text-stone-400">最长连续</p>
            </div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-stone-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "#4A7C59" }}
              animate={{ width: `${visibleHabits.length > 0 ? (completedCount / visibleHabits.length) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {plants.length === 0 && (
        <div className="px-4 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-sm text-amber-700" style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}>
              你还没有植物哦，去温室种一株吧！
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-4 py-1 rounded-lg bg-green-600 text-white text-sm"
              style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
            >
              去种植
            </button>
          </div>
        </div>
      )}

      {Object.entries(groupedHabits).map(([category, categoryHabits]) => (
        <div key={category} className="px-4 mb-4">
          <h3
            className="text-sm font-bold text-stone-400 mb-2 uppercase tracking-wider"
          >
            {categoryNames[category] || category}
          </h3>
          <div className="space-y-2">
            {categoryHabits.map((habit) => (
              <div key={habit.id} className="relative overflow-hidden rounded-xl">
                <div
                  className={`absolute inset-y-0 right-0 flex items-center px-4 transition-opacity ${
                    swipingHabit === habit.id ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: habit.isCustom ? "#EF4444" : "#6B7280" }}
                >
                  <div className="flex items-center gap-2 text-white">
                    {habit.isCustom ? (
                      <>
                        <Trash2 size={18} />
                        <span className="text-xs" style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}>删除</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={18} />
                        <span className="text-xs" style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}>隐藏</span>
                      </>
                    )}
                  </div>
                </div>

                <motion.div
                  layout
                  className={`relative bg-white rounded-xl p-4 flex items-center gap-3 transition-all ${
                    habit.completedToday ? "pixel-border-green" : "pixel-border-soft"
                  }`}
                  style={{
                    transform: swipingHabit === habit.id
                      ? `translateX(${Math.max(-80, Math.min(0, swipeCurrentX.current - swipeStartX.current))}px)`
                      : undefined,
                    transition: swipingHabit === habit.id ? "none" : "transform 0.3s ease",
                  }}
                  onTouchStart={(e) => handleTouchStart(e, habit.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(habit.id, habit.isCustom)}
                >
                  <span className="text-2xl">{getHabitIcon(habit.icon)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p
                        className={`font-bold truncate ${habit.completedToday ? "text-green-700" : "text-stone-700"}`}
                        style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
                      >
                        {habit.name}
                      </p>
                      {habit.isCustom && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-600 flex-shrink-0">自定义</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-blue-500">💧 +{habit.waterAmount}%</span>
                      <span className="text-xs text-stone-300">|</span>
                      <span className="text-xs text-stone-400">
                        🔥 连续{habit.streak}天
                      </span>
                      <span className="text-xs text-stone-300">|</span>
                      <span className="text-xs text-stone-400">
                        累计{habit.totalCompleted}次
                      </span>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-1">
                    <AnimatePresence>
                      {completedAnim === habit.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: -30 }}
                          className="absolute -top-2 -right-2 text-2xl z-10"
                        >
                          💦
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(habit.id)}
                        className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      <AnimatePresence>
                        {activeMenu === habit.id && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenu(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl pixel-border-soft overflow-hidden shadow-lg w-32"
                            >
                              {habit.isCustom ? (
                                <button
                                  onClick={() => {
                                    deleteHabit(habit.id)
                                    setActiveMenu(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
                                >
                                  <Trash2 size={14} />
                                  删除习惯
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    toggleHabitHidden(habit.id)
                                    setActiveMenu(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                                  style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
                                >
                                  <EyeOff size={14} />
                                  隐藏习惯
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => handleComplete(habit.id)}
                      disabled={habit.completedToday || plants.length === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        habit.completedToday
                          ? "bg-green-100 text-green-700"
                          : plants.length === 0
                          ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                          : "pixel-btn-primary text-white hover:scale-105 active:scale-95"
                      }`}
                      style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
                    >
                      {habit.completedToday ? "✓ 完成" : "打卡"}
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {selectingPlantFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setSelectingPlantFor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-5 pixel-border"
              style={{ backgroundColor: "#F5F0E8" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg"
                  style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive", color: "#4A7C59" }}
                >
                  💧 选择浇水目标
                </h3>
                <button onClick={() => setSelectingPlantFor(null)} className="p-1 rounded-lg hover:bg-stone-200 transition-colors">
                  <X size={18} className="text-stone-500" />
                </button>
              </div>
              <p className="text-xs text-stone-400 mb-3">选择你想浇水的植物</p>
              <div className="space-y-2">
                {plants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handleSelectPlant(plant.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-stone-200 hover:border-green-400 hover:bg-green-50 transition-all"
                  >
                    <PixelPlant type={plant.type} stage={plant.stage} size={36} animated={false} />
                    <div className="flex-1 text-left">
                      <p className="font-bold text-stone-700" style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}>
                        {plant.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">{plant.stage}</span>
                        <span className="text-xs text-stone-300">·</span>
                        <span className="text-xs text-green-600">{plant.growthProgress}%</span>
                      </div>
                    </div>
                    <span className="text-lg">💧</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
      />
    </div>
  )
}
