<script>
  export let data;
</script>

<h1>Countries</h1>

<ul>
  {#each data.countries as country}
    <li>{country.name}</li>
  {/each}
</ul>

<style>
	main {
		max-width: 400px;
		margin: 2rem auto;
		padding: 1rem;
	}
	
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	input {
		padding: 0.5rem;
		font-size: 1rem;
	}
	
	button {
		padding: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
	}
	
	.link {
		background: none;
		border: none;
		color: blue;
		text-decoration: underline;
		padding: 0;
	}
	
	.error {
		color: red;
	}
	
	.toggle {
		text-align: center;
	}
</style>
