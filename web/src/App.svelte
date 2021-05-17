<script>
	let fetchJson = fetch('data/allWords.json').then(res => res.json());
	import {onMount} from 'svelte'
	import WordCloud from 'wordcloud'

	let width
	let height

	onMount(async () => {
		const list = await fetchJson
		WordCloud(document.getElementById('my_canvas'), { 
			list,
			color: 'black',
			fontFamily: 'Roboto',
			gridSize: 8,

		})
	})
</script>

<style>
	h1 {
		position: absolute;
		width: 100vw;
		text-align: center;
		padding: 1rem;
	}

	div {
		position: absolute;
		top: 2rem;
		left: 2rem;
	}

	h2 {
		padding-bottom: 1rem;
	}

	li {
		list-style: none;
	}

	canvas {
		padding: 4rem 2rem 2rem 2rem;
	}
</style>

<svelte:window bind:innerWidth={width} bind:innerHeight={height}/>

<h1>All Words</h1>

<!-- <div>
	{#await fetchJson then results}
	<h2>Top 10</h2>
	<ul>
		{#each results.slice(0, 9) as result, i}
		<li>{i + 1}: <strong>{result[0]}</strong> - {result[1]}</li>
		{/each}
	</ul>
	{/await}
</div> -->
	
<canvas width={width - 64} height={height - 96} id="my_canvas" />