import { onMounted, onBeforeUnmount } from 'vue'

export function useEchartResize(getChart, domRef) {
  let observer
  let frame
  const resize = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const chart = getChart()
      if (chart && !chart.isDisposed()) chart.resize()
    })
  }

  onMounted(() => {
    window.addEventListener('resize', resize)
    if (window.ResizeObserver && domRef.value) {
      observer = new ResizeObserver(resize)
      observer.observe(domRef.value)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    observer?.disconnect()
    cancelAnimationFrame(frame)
    getChart()?.dispose()
  })
}
