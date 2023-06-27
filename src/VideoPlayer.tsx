import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateCurrentTimeForVideo, calculateTotalTime, loadVideo, shouldPrebuffer } from './helpers';

interface VideoDetails {
    start: number;
    end: number;
    source: string;
}

interface VideoPlayerProps {
    videos: VideoDetails[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos }) => {
    const parentRef = useRef<HTMLDivElement>(null)
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const [currentVideo, setCurrentVideo] = useState<HTMLVideoElement>(null);
    const [videoIndex, setVideoIndex] = useState<number>(0);
    const [canPlayVideo, setCanPlayVideo] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const nextVideoRef = useRef<HTMLVideoElement | null>(null);

    // Reset the player
    const resetPlayer = useCallback(() => {
        setVideoIndex(0)
        setCurrentTime(0);
        setIsPlaying(false);
    }, []);

    // Create new video element
    const createVideoElement = useCallback((isNext?: boolean): HTMLVideoElement => {
        const videoEl = document.createElement('video');
        videoEl.playsInline = true;
        // videoEl.controls = true;
        videoEl.muted = true;
        videoEl.style.height = '360px'
        videoEl.style.width = '640px'

        if (isNext) {
            videoEl.style.display = 'none';
        }

        videoEl.addEventListener('play', () => {
            setTimeout(() => {
                // The timeout was required because of previous video element remove functionality
                setIsPlaying(true);
            }, 10);
        });
        videoEl.addEventListener('pause', () => {
            setIsPlaying(false);
        });

        return videoEl;
    }, []);

    // Time updater logic
    const timeUpdate = useCallback(() => {
        if (currentVideo.paused) return
        setCurrentTime(calculateCurrentTimeForVideo(currentVideo, videos, videoIndex))

        const currentVideoDetails = videos[videoIndex];
        const nextVideoDetails = videos[videoIndex + 1];

        if (currentVideoDetails) {
            const currentTime = currentVideo.currentTime;
            if (currentTime > currentVideoDetails.end) {
                if (videoIndex + 1 < videos.length) {
                    setVideoIndex(videoIndex + 1)
                } else {
                    resetPlayer()
                }
            } else if (!nextVideoRef.current && nextVideoDetails && shouldPrebuffer(currentTime, currentVideoDetails.end)) {
                nextVideoRef.current = createVideoElement(true)
                videoContainerRef.current?.append(nextVideoRef.current)
                loadVideo(
                    nextVideoDetails,
                    nextVideoRef.current,
                    false
                )

            }
        } else {
            resetPlayer()
        }

    }, [isPlaying, currentVideo, videos, videoIndex]);

    // Start loading videos
    useEffect(() => {
        if (videos && videos.length > 0 && videoIndex < videos.length && videoContainerRef?.current) {
            if (nextVideoRef.current) {
                currentVideo?.remove();
                nextVideoRef.current.style.display = 'block';
                
                nextVideoRef.current.play();
                setCurrentVideo(nextVideoRef.current);
                nextVideoRef.current = null;
            } else {
                const videoElement = createVideoElement();
                setCurrentVideo(videoElement);
                videoContainerRef.current.innerHTML = "";
                videoContainerRef.current.append(videoElement);
                loadVideo(videos[videoIndex], videoElement, true);
            }
        }
        return () => {
            currentVideo?.remove();
        };
    }, [videos, videoIndex, videoContainerRef?.current])

    // Current time updater
    useEffect(() => {
        if (currentVideo) {
            if (currentVideo.canPlayType('application/vnd.apple.mpegurl')) {
                setCanPlayVideo(true);
            } else {
                currentVideo.addEventListener('canplay', () => {
                    setCanPlayVideo(true);
                });
                currentVideo.addEventListener('waiting', () => {
                    setCanPlayVideo(false);
                });
            }

            let animationFrameId = 0;
            let previousTime = 0;
            const frameDelay = 60;
            function updateVideoTime(timestamp: number) {
                if (timestamp - previousTime >= frameDelay) {
                    timeUpdate();
                    previousTime = timestamp;
                }
                animationFrameId = requestAnimationFrame(updateVideoTime);
            }
            updateVideoTime(previousTime);
            return () => cancelAnimationFrame(animationFrameId);
        }
    }, [currentVideo]);

    return (
        <div ref={parentRef}>
            <h2>Stats</h2>
            <p>Can play: {canPlayVideo ? 'True' : 'False'}</p>
            <p>Video Index: {videoIndex}</p>
            <p>Is Playing: {isPlaying ? 'True' : 'False'}</p>
            <p>Current Time: {Math.floor(currentTime)}/{calculateTotalTime(videos, videos.length)}</p>
            {/* Div ref where we will add and remove all videos */}
            <div ref={videoContainerRef} />
        </div>
    )
}

export default VideoPlayer

VideoPlayer.defaultProps = {
    height: 'auto',
    width: 'auto',
};
