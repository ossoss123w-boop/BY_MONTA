import { t as createServerFn } from "./ssr.mjs";
import { r as searchOne, t as createServerRpc } from "./search-upstream-azU4EXai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spotify.functions-BCftwRVx.js
var PLAYLIST = /(?:playlist\/|playlist:)([A-Za-z0-9]{10,})/;
function readTracks(payload) {
	const entity = payload?.props?.pageProps?.state?.data?.entity;
	if (!entity || !Array.isArray(entity.trackList)) throw new Error("No se pudo leer esa playlist. Si es privada, hazla pública en Spotify.");
	const rawName = typeof entity.name === "string" && entity.name.trim() ? entity.name : entity.title;
	const name = (typeof rawName === "string" && rawName.trim() ? rawName : "Playlist").trim().slice(0, 40);
	const tracks = [];
	for (const row of entity.trackList) {
		if (!row || typeof row !== "object") continue;
		const item = row;
		if (typeof item.title !== "string" || !item.title.trim()) continue;
		const artist = typeof item.subtitle === "string" ? item.subtitle.replace(/\u00a0/g, " ").split(",")[0]?.trim() ?? "" : "";
		tracks.push({
			title: item.title.trim(),
			artist
		});
		if (tracks.length >= 12) break;
	}
	if (!tracks.length) throw new Error("Esa playlist no tiene canciones visibles.");
	return {
		name,
		tracks
	};
}
async function mapTracks(items) {
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	let cursor = 0;
	async function worker() {
		while (cursor < items.length) {
			const item = items[cursor];
			cursor += 1;
			if (!item) continue;
			const query = `${item.title} ${item.artist}`.replace(/\s+/g, " ").trim().slice(0, 100);
			const hit = await searchOne(query);
			if (hit && !seen.has(hit.id)) {
				seen.add(hit.id);
				found.push(hit);
			}
		}
	}
	await Promise.all([
		worker(),
		worker(),
		worker(),
		worker()
	]);
	return found;
}
var importSpotifyPlaylist_createServerFn_handler = createServerRpc({
	id: "ff4e046494323f55365542cc4e2c1098f8de6022798d7aadfda92b38a7032a2d",
	name: "importSpotifyPlaylist",
	filename: "src/lib/spotify.functions.ts"
}, (opts) => importSpotifyPlaylist.__executeServer(opts));
var importSpotifyPlaylist = createServerFn({ method: "GET" }).validator((data) => {
	const id = (typeof data?.url === "string" ? data.url.trim().slice(0, 300) : "").match(PLAYLIST)?.[1];
	if (!id) throw new Error("Pega un enlace de playlist de Spotify.");
	return { id };
}).handler(importSpotifyPlaylist_createServerFn_handler, async ({ data }) => {
	const response = await fetch(`https://open.spotify.com/embed/playlist/${data.id}`, { headers: {
		accept: "text/html",
		"user-agent": "Mozilla/5.0 (compatible; BYMONTA/1.0)"
	} });
	if (!response.ok) throw new Error("Spotify no respondió. Prueba de nuevo en un momento.");
	const match = (await response.text()).match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
	if (!match?.[1]) throw new Error("No se pudo leer esa playlist.");
	let payload;
	try {
		payload = JSON.parse(match[1]);
	} catch {
		throw new Error("No se pudo leer esa playlist.");
	}
	const parsed = readTracks(payload);
	const tracks = await mapTracks(parsed.tracks);
	if (!tracks.length) throw new Error("No encontré esas canciones para reproducirlas aquí.");
	return {
		name: parsed.name,
		tracks,
		requested: parsed.tracks.length
	};
});
//#endregion
export { importSpotifyPlaylist_createServerFn_handler };
