import { useState, useRef, useEffect } from 'react'
import {
  IconPlay,
  IconPause,
  IconVolume,
  IconVolumeX,
  IconMaximize,
} from '@/components/ui/icons'

interface VideoPlayerStageProps {
  videoUrl?: string
  onComplete: () => void
}

export default function VideoPlayerStage({ videoUrl, onComplete }: VideoPlayerStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.9)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [videoUrl])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setDuration(videoRef.current.duration || 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isYouTube = Boolean(videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')))
  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1`
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1`
    }
    return url
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {isYouTube ? (
        <iframe
          src={getEmbedUrl(videoUrl!)}
          title="Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: '100%', height: 520, border: 'none', background: '#05070d' }}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: '100%', maxHeight: 520, objectFit: 'contain', background: '#05070d' }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onComplete}
          onClick={togglePlay}
        />
      )}

      {/* Custom Video Overlay Controls for HTML5 Video */}
      {!isYouTube && (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            accentColor: '#2dd4bf',
            cursor: 'pointer',
            height: 4,
            borderRadius: 2,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isPlaying ? <IconPause s={20} /> : <IconPlay s={20} />}
            </button>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              <button
                onClick={toggleMute}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
              >
                {isMuted || volume === 0 ? <IconVolumeX s={18} /> : <IconVolume s={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{ width: 64, accentColor: '#2dd4bf', height: 3 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: playbackRate === rate ? '#2dd4bf' : 'rgba(255,255,255,0.1)',
                    color: playbackRate === rate ? '#000' : '#fff',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen()
                  } else {
                    videoRef.current.requestFullscreen()
                  }
                }
              }}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
            >
              <IconMaximize s={18} />
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
