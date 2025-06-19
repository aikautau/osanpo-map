"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, RotateCcw, Trash2, ImageIcon, Plus } from "lucide-react"

declare global {
  interface Window {
    L: any
    removeStamp: (id: string) => void
    html2canvas: any
  }
}

export default function MapPrinter() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selectionRectangle, setSelectionRectangle] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSelecting, setIsSelecting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedBounds, setSelectedBounds] = useState<any>(null)
  const [stamps, setStamps] = useState<any[]>([])
  const [selectedStampType, setSelectedStampType] = useState<string | null>(null)
  const [isStampMode, setIsStampMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("全て")

  // 自由記述スタンプ用の状態
  const [customStampText, setCustomStampText] = useState("")
  const [customStampColor, setCustomStampColor] = useState("#ff4757")
  const [showCustomStampForm, setShowCustomStampForm] = useState(false)

  const stampTypes = {
    // 安全・注意
    traffic_danger: { name: "とびだし注意⚠️", color: "#ff4757", category: "安全" },
    car_danger: { name: "車通り多い🚗", color: "#ff4757", category: "安全" },
    slope_danger: { name: "急な坂道⚠️", color: "#ff6b35", category: "安全" },
    water_danger: { name: "水辺注意💧", color: "#3742fa", category: "安全" },
    hole_danger: { name: "穴・段差注意", color: "#ff9ff3", category: "安全" },
    bee_danger: { name: "ハチ注意🐝", color: "#ffa502", category: "安全" },
    poison_plant: { name: "きのこ注意☠️", color: "#2ed573", category: "安全" },
    construction: { name: "工事中🚧", color: "#ff6348", category: "安全" },

    // 乗り物・交通
    police_car: { name: "パトカー🚓", color: "#0984e3", category: "乗り物" },
    fire_truck: { name: "消防車🚒", color: "#ff4757", category: "乗り物" },
    ambulance: { name: "救急車🚑", color: "#ff7675", category: "乗り物" },
    excavator: { name: "ショベルカー🚜", color: "#fdcb6e", category: "乗り物" },
    train: { name: "電車🚃", color: "#74b9ff", category: "乗り物" },
    railroad: { name: "踏切🚉", color: "#2d3436", category: "乗り物" },
    bus_stop: { name: "バス停🚌", color: "#0984e3", category: "交通" },
    crosswalk: { name: "横断歩道", color: "#2d3436", category: "交通" },
    traffic_light: { name: "信号機🚦", color: "#00b894", category: "交通" },
    parking: { name: "駐車場", color: "#636e72", category: "交通" },
    bicycle: { name: "駐輪場🚲", color: "#00cec9", category: "交通" },

    // 休憩・設備
    bench: { name: "ベンチ", color: "#45b7d1", category: "休憩" },
    toilet: { name: "トイレ", color: "#96ceb4", category: "設備" },
    water_fountain: { name: "水飲み場", color: "#74b9ff", category: "設備" },
    shade: { name: "日陰", color: "#00b894", category: "休憩" },
    shelter: { name: "雨宿り", color: "#a29bfe", category: "休憩" },
    vending: { name: "自販機", color: "#fd79a8", category: "設備" },

    // 遊具
    swing: { name: "ブランコ", color: "#feca57", category: "遊具" },
    slide: { name: "滑り台", color: "#ff6b6b", category: "遊具" },
    jungle_gym: { name: "ジャングルジム", color: "#4834d4", category: "遊具" },
    horizontal_bar: { name: "鉄棒", color: "#686de0", category: "遊具" },
    seesaw: { name: "シーソー", color: "#30336b", category: "遊具" },
    spring_rider: { name: "スプリング遊具", color: "#95afc0", category: "遊具" },
    climbing_frame: { name: "うんてい", color: "#535c68", category: "遊具" },
    sandbox: { name: "砂場", color: "#f9ca24", category: "遊具" },
    merry_go_round: { name: "回転遊具", color: "#f0932b", category: "遊具" },
    balance_beam: { name: "平均台", color: "#eb4d4b", category: "遊具" },
    rope_climbing: { name: "ロープ", color: "#6ab04c", category: "遊具" },
    tire_swing: { name: "タイヤブランコ", color: "#130f40", category: "遊具" },

    // 遊び・体験
    climbing: { name: "木登り🌳", color: "#00b894", category: "遊び" },
    hide_seek: { name: "かくれんぼ", color: "#6c5ce7", category: "遊び" },
    ball_play: { name: "ボール遊び⚽", color: "#e17055", category: "遊び" },
    running: { name: "かけっこ", color: "#fd79a8", category: "遊び" },

    // 春の自然
    sakura: { name: "桜🌸", color: "#fd79a8", category: "春" },
    dandelion: { name: "たんぽぽ", color: "#feca57", category: "春" },
    tulip: { name: "チューリップ", color: "#e84393", category: "春" },
    butterfly: { name: "ちょうちょ🦋", color: "#a29bfe", category: "春" },
    ladybug: { name: "てんとう虫", color: "#ff6b6b", category: "春" },
    ant: { name: "あり🐜", color: "#2d3436", category: "春" },

    // 夏の自然
    cicada: { name: "セミ", color: "#00b894", category: "夏" },
    sunflower: { name: "ひまわり🌻", color: "#fdcb6e", category: "夏" },
    morning_glory: { name: "あさがお", color: "#6c5ce7", category: "夏" },
    beetle: { name: "カブトムシ", color: "#2d3436", category: "夏" },
    dragonfly: { name: "とんぼ", color: "#74b9ff", category: "夏" },
    tadpole: { name: "水遊び", color: "#00cec9", category: "夏" },

    // 秋の自然
    acorn: { name: "どんぐり", color: "#a0522d", category: "秋" },
    pinecone: { name: "まつぼっくり", color: "#8b4513", category: "秋" },
    maple: { name: "もみじ🍁", color: "#e17055", category: "秋" },
    ginkgo: { name: "いちょう", color: "#feca57", category: "秋" },
    persimmon: { name: "柿", color: "#ff7675", category: "秋" },
    chestnut: { name: "栗", color: "#8b4513", category: "秋" },

    // 冬の自然
    camellia: { name: "こおり", color: "#e84393", category: "冬" },
    plum: { name: "梅", color: "#fd79a8", category: "冬" },
    frost: { name: "霜", color: "#74b9ff", category: "冬" },
    bare_tree: { name: "落葉樹", color: "#636e72", category: "冬" },
    evergreen: { name: "常緑樹", color: "#00b894", category: "冬" },

    // 動物・生き物
    cat: { name: "ねこ🐱", color: "#fd79a8", category: "動物" },
    dog: { name: "いぬ🐕", color: "#00b894", category: "動物" },
    bird: { name: "小鳥🐦", color: "#74b9ff", category: "動物" },
    crow: { name: "めだか", color: "#2d3436", category: "動物" },
    pigeon: { name: "ハト", color: "#636e72", category: "動物" },
    sparrow: { name: "おたまじゃくし", color: "#a0522d", category: "動物" },

    // 観察ポイント
    flower_bed: { name: "花壇", color: "#e84393", category: "観察" },
    pond: { name: "池", color: "#0984e3", category: "観察" },
    stream: { name: "小川", color: "#74b9ff", category: "観察" },
    big_tree: { name: "大きな木", color: "#00b894", category: "観察" },
    stone: { name: "大きな石", color: "#636e72", category: "観察" },
    hill: { name: "小さな丘", color: "#00cec9", category: "観察" },
  }

  // スタンプ削除関数をuseCallbackで安定化
  const removeStamp = React.useCallback(
    (stampId: string) => {
      const stamp = stamps.find((s) => s.id === stampId)
      if (stamp && map) {
        map.removeLayer(stamp.marker)
        setStamps((prev) => prev.filter((s) => s.id !== stampId))
      }
    },
    [stamps, map],
  )

  // グローバル関数として設定
  useEffect(() => {
    window.removeStamp = removeStamp
    return () => {
      delete window.removeStamp
    }
  }, [removeStamp])

  // 外部ライブラリの読み込み
  useEffect(() => {
    const loadLibraries = () => {
      // html2canvas
      if (!window.html2canvas) {
        const html2canvasScript = document.createElement("script")
        html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        document.head.appendChild(html2canvasScript)
      }
    }

    loadLibraries()
  }, [])

  useEffect(() => {
    // Leaflet CDNを動的に読み込み
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // JavaScript
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)
      } else if (window.L) {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (mapRef.current && window.L && !map) {
        const leafletMap = window.L.map(mapRef.current, {
          zoomControl: true, // ズームコントロールは表示（保存時のみ非表示）
          attributionControl: true, // アトリビューションコントロールを有効
        }).setView([35.6762, 139.6503], 10)

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(leafletMap)

        // アトリビューションの位置を調整
        leafletMap.attributionControl.setPrefix("")

        setMap(leafletMap)
      }
    }

    loadLeaflet()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  // 地図クリックイベントを別のuseEffectで管理
  useEffect(() => {
    if (map) {
      const handleMapClick = (e: any) => {
        if (isStampMode && selectedStampType) {
          if (selectedStampType === "custom") {
            if (customStampText.trim()) {
              addCustomStamp(e.latlng, customStampText, customStampColor)
            }
          } else {
            addStamp(e.latlng, selectedStampType)
          }
        }
      }

      map.on("click", handleMapClick)

      return () => {
        map.off("click", handleMapClick)
      }
    }
  }, [map, isStampMode, selectedStampType, customStampText, customStampColor])

  const startSelection = () => {
    if (!map) return

    setIsSelecting(true)

    // 既存の選択範囲を削除
    if (selectionRectangle) {
      map.removeLayer(selectionRectangle)
    }

    let startLatLng: any = null
    let tempRectangle: any = null

    const onMouseDown = (e: any) => {
      startLatLng = e.latlng
      map.dragging.disable()
    }

    const onMouseMove = (e: any) => {
      if (!startLatLng) return

      if (tempRectangle) {
        map.removeLayer(tempRectangle)
      }

      const bounds = window.L.latLngBounds(startLatLng, e.latlng)
      tempRectangle = window.L.rectangle(bounds, {
        color: "#ff7800",
        weight: 2,
        fillOpacity: 0.2,
      }).addTo(map)
    }

    const onMouseUp = (e: any) => {
      if (!startLatLng) return

      const bounds = window.L.latLngBounds(startLatLng, e.latlng)

      if (tempRectangle) {
        map.removeLayer(tempRectangle)
      }

      const rectangle = window.L.rectangle(bounds, {
        color: "#ff7800",
        weight: 3,
        fillOpacity: 0.3,
      }).addTo(map)

      setSelectionRectangle(rectangle)
      setSelectedBounds(bounds)
      setIsSelecting(false)

      // イベントリスナーを削除
      map.off("mousedown", onMouseDown)
      map.off("mousemove", onMouseMove)
      map.off("mouseup", onMouseUp)
      map.dragging.enable()
    }

    map.on("mousedown", onMouseDown)
    map.on("mousemove", onMouseMove)
    map.on("mouseup", onMouseUp)
  }

  const clearSelection = () => {
    if (selectionRectangle && map) {
      map.removeLayer(selectionRectangle)
      setSelectionRectangle(null)
      setSelectedBounds(null)
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim() || !map) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      )
      const data = await response.json()

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        map.setView([Number.parseFloat(lat), Number.parseFloat(lon)], 15)

        // マーカーを追加
        window.L.marker([Number.parseFloat(lat), Number.parseFloat(lon)])
          .addTo(map)
          .bindPopup(display_name)
          .openPopup()
      } else {
        alert("場所が見つかりませんでした")
      }
    } catch (error) {
      console.error("検索エラー:", error)
      alert("検索中にエラーが発生しました")
    }
  }

  const addStamp = (latlng: any, type: string) => {
    if (!map || !window.L) return

    const stampInfo = stampTypes[type as keyof typeof stampTypes]
    const stampId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // 文字スタンプのスタイル
    const customIcon = window.L.divIcon({
      html: `<div style="
    position: relative;
    font-size: 14px;
    font-weight: bold;
    color: ${stampInfo.color};
    text-shadow: 
      -1px -1px 0 white,
      1px -1px 0 white,
      -1px 1px 0 white,
      1px 1px 0 white,
      -2px 0 0 white,
      2px 0 0 white,
      0 -2px 0 white,
      0 2px 0 white;
    cursor: pointer;
    white-space: nowrap;
    text-align: center;
    line-height: 1;
    transform: translate(-50%, -50%);
  ">${stampInfo.name}</div>`,
      className: "custom-stamp-icon",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })

    const marker = window.L.marker(latlng, {
      icon: customIcon,
      draggable: true,
    }).addTo(map)

    // ポップアップを追加
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${stampInfo.name}</strong><br>
        <small>カテゴリ: ${stampInfo.category}</small><br>
        <button 
          onclick="if(window.removeStamp) { window.removeStamp('${stampId}'); this.closest('.leaflet-popup').style.display='none'; }" 
          style="
            background: #ff4757;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
          "
        >削除</button>
      </div>
    `)

    // ドラッグ終了時の位置更新
    marker.on("dragend", (e: any) => {
      const newPos = e.target.getLatLng()
      setStamps((prev) => prev.map((s) => (s.id === stampId ? { ...s, latlng: newPos } : s)))
    })

    const stampData = {
      id: stampId,
      type,
      latlng,
      marker,
      name: stampInfo.name,
      color: stampInfo.color,
      category: stampInfo.category,
    }

    setStamps((prev) => [...prev, stampData])
  }

  const addCustomStamp = (latlng: any, text: string, color: string) => {
    if (!map || !window.L) return

    const stampId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // カスタムスタンプのスタイル
    const customIcon = window.L.divIcon({
      html: `<div style="
    position: relative;
    font-size: 14px;
    font-weight: bold;
    color: ${color};
    text-shadow: 
      -1px -1px 0 white,
      1px -1px 0 white,
      -1px 1px 0 white,
      1px 1px 0 white,
      -2px 0 0 white,
      2px 0 0 white,
      0 -2px 0 white,
      0 2px 0 white;
    cursor: pointer;
    white-space: nowrap;
    text-align: center;
    line-height: 1;
    transform: translate(-50%, -50%);
  ">${text}</div>`,
      className: "custom-stamp-icon",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    })

    const marker = window.L.marker(latlng, {
      icon: customIcon,
      draggable: true,
    }).addTo(map)

    // ポップアップを追加
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${text}</strong><br>
        <small>カテゴリ: カスタム</small><br>
        <button 
          onclick="if(window.removeStamp) { window.removeStamp('${stampId}'); this.closest('.leaflet-popup').style.display='none'; }" 
          style="
            background: #ff4757;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
          "
        >削除</button>
      </div>
    `)

    // ドラッグ終了時の位置更新
    marker.on("dragend", (e: any) => {
      const newPos = e.target.getLatLng()
      setStamps((prev) => prev.map((s) => (s.id === stampId ? { ...s, latlng: newPos } : s)))
    })

    const stampData = {
      id: stampId,
      type: "custom",
      latlng,
      marker,
      name: text,
      color: color,
      category: "カスタム",
    }

    setStamps((prev) => [...prev, stampData])
  }

  const clearAllStamps = () => {
    stamps.forEach((stamp) => {
      if (map) {
        map.removeLayer(stamp.marker)
      }
    })
    setStamps([])
  }

  const toggleStampMode = (type: string) => {
    if (selectedStampType === type && isStampMode) {
      setIsStampMode(false)
      setSelectedStampType(null)
      setShowCustomStampForm(false)
    } else {
      setIsStampMode(true)
      setSelectedStampType(type)
      setShowCustomStampForm(type === "custom")
    }
  }

  // モバイル対応の画像保存機能
  const exportAsImage = async () => {
    if (!window.html2canvas || !map) {
      alert("ライブラリが読み込まれていません")
      return
    }

    setIsExporting(true)

    try {
      // モバイルかどうかを判定
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const mapElement = mapRef.current

      if (!mapElement) {
        alert("地図が見つかりません")
        return
      }

      // 地図のコントロールを一時的に非表示にする
      const zoomControl = mapElement.querySelector(".leaflet-control-zoom")
      const attributionControl = mapElement.querySelector(".leaflet-control-attribution")

      // ズームコントロールを非表示
      if (zoomControl) {
        ;(zoomControl as HTMLElement).style.display = "none"
      }

      // 選択範囲の矩形を一時的に非表示
      let wasSelectionVisible = false
      if (selectionRectangle && map) {
        wasSelectionVisible = true
        map.removeLayer(selectionRectangle)
      }

      // アトリビューション（クレジット）の位置とスタイルを調整
      if (attributionControl) {
        const attribution = attributionControl as HTMLElement
        attribution.style.position = "absolute"
        attribution.style.bottom = "5px"
        attribution.style.right = "5px"
        attribution.style.backgroundColor = "rgba(255, 255, 255, 0.9)"
        attribution.style.padding = "3px 8px"
        attribution.style.fontSize = "11px"
        attribution.style.borderRadius = "3px"
        attribution.style.zIndex = "1000"
        attribution.style.display = "block"
        attribution.style.whiteSpace = "nowrap"
        attribution.style.maxWidth = "none"
        attribution.style.width = "auto"
        attribution.innerHTML = "© OpenStreetMap contributors"
      }

      // 少し待ってから画像をキャプチャ
      await new Promise((resolve) => setTimeout(resolve, 200))

      // 地図のスクリーンショットを撮る
      const canvas = await window.html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        width: mapElement.offsetWidth,
        height: mapElement.offsetHeight,
        backgroundColor: null,
      })

      // コントロールを元に戻す
      if (zoomControl) {
        ;(zoomControl as HTMLElement).style.display = "block"
      }

      // 選択範囲を元に戻す
      if (wasSelectionVisible && selectedBounds && map) {
        const rectangle = window.L.rectangle(selectedBounds, {
          color: "#ff7800",
          weight: 3,
          fillOpacity: 0.3,
        }).addTo(map)
        setSelectionRectangle(rectangle)
      }

      // モバイルの場合は画像を新しいタブで表示
      if (isMobile) {
        // Canvas を画像データURLに変換
        const imageDataUrl = canvas.toDataURL("image/png")

        // 新しいウィンドウで画像を表示
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(`
        <html>
          <head>
            <title>おさんぽマップ</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #f0f0f0; 
                text-align: center;
                font-family: Arial, sans-serif;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              .instructions {
                margin-top: 20px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .download-btn {
                display: inline-block;
                margin: 10px;
                padding: 12px 24px;
                background: #007AFF;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h2>おさんぽマップ</h2>
            <img src="${imageDataUrl}" alt="おさんぽマップ" />
            <div class="instructions">
              <p><strong>📱 画像を保存する方法：</strong></p>
              <p>1. 画像を長押ししてください</p>
              <p>2. 「画像を保存」または「写真に保存」を選択</p>
              <p>3. 写真アプリに保存されます</p>
              <br>
              <a href="${imageDataUrl}" download="osanpo_map_${new Date().getTime()}.png" class="download-btn">
                💾 ダウンロード
              </a>
            </div>
          </body>
        </html>
      `)
          newWindow.document.close()
        } else {
          // ポップアップがブロックされた場合の代替手段
          alert("ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。")
        }
      } else {
        // デスクトップの場合は従来通りダウンロード
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = blobUrl
            link.download = `osanpo_map_${new Date().getTime()}.png`
            link.click()

            setTimeout(() => {
              URL.revokeObjectURL(blobUrl)
            }, 100)
          }
        }, "image/png")
      }
    } catch (error) {
      console.error("画像出力エラー:", error)
      alert("画像の出力に失敗しました")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              おさんぽマップ作成ツール
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">場所を検索</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="○○駅、○○公園など..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchLocation()}
                  />
                  <Button onClick={searchLocation} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-end gap-2 md:hidden">{/* モバイル用：範囲選択ボタンを非表示 */}</div>
              <div className="hidden md:flex items-end gap-2">
                {/* デスクトップ用：範囲選択ボタンを表示 */}
                <Button onClick={startSelection} disabled={isSelecting} className="flex-1">
                  {isSelecting ? "範囲を選択中..." : "保存範囲を選択"}
                </Button>
                <Button onClick={clearSelection} size="icon" variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Button onClick={exportAsImage} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700">
                <ImageIcon className="h-4 w-4 mr-2" />
                {isExporting ? "保存中..." : "画像で保存"}
              </Button>
              <div className="flex items-center text-sm text-gray-600">
                <span className="md:hidden">表示範囲で保存</span>
                <span className="hidden md:inline">{selectedBounds ? "選択範囲で保存" : "表示範囲で保存"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 左側：スタンプツール */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">🏫 園外活動スタンプ</CardTitle>
            </CardHeader>
            <CardContent>
              {/* カテゴリ別タブ */}
              <div className="mb-3">
                <Label className="text-sm font-medium mb-2 block">カテゴリ</Label>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {[
                    "全て",
                    "遊具",
                    "遊び",
                    "乗り物",
                    "交通",
                    "安全",
                    "春",
                    "夏",
                    "秋",
                    "冬",
                    "動物",
                    "観察",
                    "設備",
                    "休憩",
                  ].map((category) => (
                    <Button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 自由記述スタンプ */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <Button
                  onClick={() => toggleStampMode("custom")}
                  variant={selectedStampType === "custom" && isStampMode ? "default" : "outline"}
                  className="w-full mb-2"
                  style={{
                    backgroundColor: selectedStampType === "custom" && isStampMode ? customStampColor : undefined,
                    color: selectedStampType === "custom" && isStampMode ? "white" : undefined,
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  自由記述スタンプ
                </Button>

                {showCustomStampForm && (
                  <div className="space-y-2">
                    <Input
                      placeholder="スタンプの文字を入力"
                      value={customStampText}
                      onChange={(e) => setCustomStampText(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">色:</Label>
                      <input
                        type="color"
                        value={customStampColor}
                        onChange={(e) => setCustomStampColor(e.target.value)}
                        className="w-8 h-8 rounded border"
                      />
                    </div>
                    {isStampMode && selectedStampType === "custom" && (
                      <div className="text-xs text-blue-600 font-medium p-2 bg-blue-50 rounded">
                        📍 地図をクリックして配置
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* スタンプリスト */}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {Object.entries(stampTypes)
                  .filter(([key, info]) => selectedCategory === "全て" || info.category === selectedCategory)
                  .sort(([, a], [, b]) => {
                    // カテゴリの順番を定義
                    const categoryOrder = [
                      "遊具",
                      "遊び",
                      "乗り物",
                      "交通",
                      "安全",
                      "春",
                      "夏",
                      "秋",
                      "冬",
                      "動物",
                      "観察",
                      "設備",
                      "休憩",
                    ]

                    const aIndex = categoryOrder.indexOf(a.category)
                    const bIndex = categoryOrder.indexOf(b.category)

                    // カテゴリが同じ場合は名前順
                    if (aIndex === bIndex) {
                      return a.name.localeCompare(b.name)
                    }

                    return aIndex - bIndex
                  })
                  .map(([key, info]) => (
                    <Button
                      key={key}
                      onClick={() => toggleStampMode(key)}
                      variant={selectedStampType === key && isStampMode ? "default" : "outline"}
                      className="w-full justify-start h-10 text-sm"
                      style={{
                        backgroundColor: selectedStampType === key && isStampMode ? info.color : undefined,
                        borderColor: info.color,
                        color: selectedStampType === key && isStampMode ? "white" : undefined,
                      }}
                    >
                      <span>{info.name}</span>
                    </Button>
                  ))}
              </div>

              {/* 操作状態とコントロール */}
              <div className="mt-4 space-y-2">
                {isStampMode && selectedStampType && selectedStampType !== "custom" && (
                  <div className="text-xs text-blue-600 font-medium p-2 bg-blue-50 rounded">
                    📍 地図をクリックして「{stampTypes[selectedStampType as keyof typeof stampTypes]?.name}」を配置
                  </div>
                )}
                {stamps.length > 0 && (
                  <Button onClick={clearAllStamps} size="sm" variant="outline" className="w-full">
                    <Trash2 className="h-4 w-4 mr-1" />
                    全スタンプ削除 ({stamps.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 右側：地図 */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              <div
                ref={mapRef}
                className="w-full h-[600px] rounded-lg"
                style={{ cursor: isSelecting ? "crosshair" : "grab" }}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">園外活動での使い方</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>活動予定地を検索して地図を表示</li>
              <li>左側から安全注意点や観察ポイントのスタンプを選択</li>
              <li>地図上をクリックして重要な場所にスタンプを配置</li>
              <li>「とびだし注意⚠️」など安全管理に必要な情報をマーク</li>
              <li>「ブランコ」「滑り台」など遊具の位置も記録</li>
              <li>自由記述スタンプで独自の情報も追加可能</li>
              <li>地図を見たい範囲に調整して「画像で保存」</li>
            </ol>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📱 スマホでの保存：</strong>
                保存ボタンを押すと新しいタブで画像が表示されます。画像を長押しして「画像を保存」を選択してください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
