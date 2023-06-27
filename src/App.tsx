import VideoPlayer from './VideoPlayer';

const videos = [
    {
        source: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8",
        start: 5,
        end: 15
    },
    {
        source: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8",
        start: 10,
        end: 30
    },
]

function App() {
	
	return (
		<div><VideoPlayer videos={videos} /></div>
	)
}

export default App