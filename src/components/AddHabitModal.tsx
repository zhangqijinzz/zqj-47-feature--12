import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus } from "lucide-react"
import type { HabitCategory } from "@/types"

const CATEGORY_OPTIONS: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: "health", label: "健康", emoji: "💚" },
  { value: "mind", label: "心灵", emoji: "🧠" },
  { value: "body", label: "身体", emoji: "💪" },
]

const ICON_OPTIONS = [
  "✨", "🌟", "🎯", "🏃", "🧘", "📚", "💧", "🌱",
  "🍎", "😴", "🎨", "🎵", "✍️", "🧹", "🥗", "🚶",
  "🏋️", "🧠", "🌬️", "🎮", "📝", "🖼️", "🐶", "🌞",
]

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, category: HabitCategory, icon: string, waterAmount: number) => void
}

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<HabitCategory>("health")
  const [icon, setIcon] = useState("✨")
  const [waterAmount, setWaterAmount] = useState(10)

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd(name.trim(), category, icon, waterAmount)
    setName("")
    setCategory("health")
    setIcon("✨")
    setWaterAmount(10)
    onClose()
  }

  const handleClose = () => {
    setName("")
    setCategory("health")
    setIcon("✨")
    setWaterAmount(10)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleClose}
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
                <Plus size={18} className="inline mr-1" />
                新建习惯
              </h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <X size={18} className="text-stone-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1">习惯名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：每天吃水果"
                  maxLength={20}
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-green-400 focus:outline-none bg-white text-stone-700"
                  style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={`p-2 rounded-xl border-2 transition-all text-center ${
                        category === opt.value
                          ? "border-green-400 bg-green-50"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div
                        className={`text-xs ${
                          category === opt.value ? "text-green-700" : "text-stone-500"
                        }`}
                        style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
                      >
                        {opt.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">图标</label>
                <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-white border-2 border-stone-200 max-h-32 overflow-y-auto">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${
                        icon === ic
                          ? "bg-green-100 ring-2 ring-green-400"
                          : "hover:bg-stone-100"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">
                  单次浇水量：<span className="text-blue-500">{waterAmount}%</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2 rounded-xl border-2 border-stone-200 text-stone-500 hover:bg-stone-100 transition-colors"
                style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className={`flex-1 py-2 rounded-xl text-white transition-all ${
                  name.trim()
                    ? "pixel-btn-primary hover:scale-105 active:scale-95"
                    : "bg-stone-300 cursor-not-allowed"
                }`}
                style={{ fontFamily: "'ZCOOL QingKe HuangYou', cursive" }}
              >
                创建
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
