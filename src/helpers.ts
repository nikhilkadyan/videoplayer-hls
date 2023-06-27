import Hls from 'hls.js'

export const loadVideo = (
    videoInfo: Video,
    videoElement: HTMLVideoElement,
    autoPlay: boolean,
) => {
    const isSupported = Hls.isSupported()
    const isVideoHls = videoInfo.source.includes('.m3u8')
    if (isSupported && isVideoHls) {
        const hls = new Hls({
            startPosition: videoInfo.start,
        })
        hls.loadSource(videoInfo.source)
        hls.attachMedia(videoElement)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) {
                videoElement.muted = true
                videoElement.play()
            }
        }
        )
    } else {
        videoElement.src = videoInfo.source
        if (autoPlay) {
            videoElement.muted = true
            videoElement.play()
        }
    }
}

export const calculateTotalTime = (videoList: Video[], stopIndex: number): number => {
    let totalTime = 0
    for (let i = 0; i < videoList.length; i++) {
        if (i === stopIndex) break
        totalTime += videoList[i].end - videoList[i].start
    }
    return totalTime
}

export const calculateCurrentTimeForVideo = (
    video: HTMLVideoElement,
    videoList: Video[],
    index: number
): number => {
    let currentTime = 0
    if (videoList[index]) {
        currentTime = video.currentTime - (videoList[index].start || 0)
    }
    const previousTime = calculateTotalTime(videoList, index)
    if (currentTime > 0) {
        return previousTime + currentTime
    }
    return 0
}

export const shouldPrebuffer = (currentTime: number, endTime: number): boolean => {
    return currentTime > endTime - 5
}
