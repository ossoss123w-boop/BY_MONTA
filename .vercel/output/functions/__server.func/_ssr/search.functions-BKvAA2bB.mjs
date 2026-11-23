import { t as createServerFn } from "./ssr.mjs";
import { n as runSearch, t as createServerRpc } from "./search-upstream-azU4EXai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search.functions-BKvAA2bB.js
var searchTracks_createServerFn_handler = createServerRpc({
	id: "64f9badfa647dd1a3797558def532083991ec157079cf45cb77d350391a58b9b",
	name: "searchTracks",
	filename: "src/lib/search.functions.ts"
}, (opts) => searchTracks.__executeServer(opts));
var searchTracks = createServerFn({ method: "GET" }).validator((data) => {
	const q = typeof data?.q === "string" ? data.q.trim().slice(0, 120) : "";
	if (q.length < 2) throw new Error("Escribe al menos 2 caracteres");
	return { q };
}).handler(searchTracks_createServerFn_handler, async ({ data }) => runSearch(data.q));
//#endregion
export { searchTracks_createServerFn_handler };
