// Quick scanner: parses CREATE TABLE columns and finds usages in src JS files (heuristic)
import fs from 'fs';
import path from 'path';

function readFiles(dir, exts = ['.js', '.ts', '.sql']) {
	const out = [];
	(function walk(d) {
		for (const f of fs.readdirSync(d)) {
			const full = path.join(d, f);
			if (fs.statSync(full).isDirectory()) walk(full);
			else if (exts.includes(path.extname(full))) out.push(full);
		}
	})(dir);
	return out;
}

function parseSqlColumns(sql) {
	const re = /create\s+table\s+("?[\w_]+"?)\s*\(([\s\S]*?)\);/gi;
	const cols = {};
	let m;
	while ((m = re.exec(sql))) {
		const tbl = m[1].replace(/"/g, '');
		const body = m[2];
		cols[tbl] = body
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
			.map((l) => l.split(/\s+/)[0].replace(/"|`/g, '').replace(/,$/, ''));
	}
	return cols;
}

const sqlDir = path.resolve('supabase', 'sql');
const srcDir = path.resolve('src');

if (!fs.existsSync(sqlDir) || !fs.existsSync(srcDir)) {
	console.error('Make sure you run this from the project root where supabase/sql and src exist.');
	process.exit(1);
}

const sqlFiles = (function f(d) {
	return fs.readdirSync(d).map((n) => path.join(d, n));
})(sqlDir)
	.filter((p) => p.endsWith('.sql') || fs.statSync(p).isDirectory())
	.flatMap((p) =>
		fs.statSync(p).isDirectory()
			? fs
					.readdirSync(p)
					.map((n) => path.join(p, n))
					.filter((x) => x.endsWith('.sql'))
			: [p]
	);

const srcFiles = (function walk(d, out = []) {
	for (const f of fs.readdirSync(d)) {
		const full = path.join(d, f);
		if (fs.statSync(full).isDirectory()) walk(full, out);
		else if (full.endsWith('.js') || full.endsWith('.ts')) out.push(full);
	}
	return out;
})(srcDir);

const sqlMap = {};
for (const f of sqlFiles) {
	try {
		const txt = fs.readFileSync(f, 'utf8');
		Object.assign(sqlMap, parseSqlColumns(txt));
	} catch (e) {
		/* ignore */
	}
}

console.log('=== Detected tables and columns (from SQL) ===');
console.log(JSON.stringify(sqlMap, null, 2));

console.log('\n=== Heuristic references in src ===');
for (const [table, cols] of Object.entries(sqlMap)) {
	for (const col of cols) {
		const pattern = new RegExp('\\b' + col.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
		for (const s of srcFiles) {
			try {
				const txt = fs.readFileSync(s, 'utf8');
				if (pattern.test(txt))
					console.log(`${path.relative(process.cwd(), s)}  => references "${col}" (table ${table})`);
			} catch (e) {}
		}
	}
}
