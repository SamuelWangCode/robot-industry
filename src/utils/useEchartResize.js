import { onMounted, onBeforeUnmount } from 'vue'

export function useEchartResize(chartRef, domRef) {
  let ro

  const doResize = () => {
    if (chartRef.value) chartRef.value.resize()
  }

  onMounted(() => {
    // 1) window 尺寸变化
    window.addEventListener('resize', doResize)

    // 2) 观察容器自身尺寸
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(doResize)
      ro.observe(domRef.value)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', doResize)
    ro && ro.disconnect()
  })
}
