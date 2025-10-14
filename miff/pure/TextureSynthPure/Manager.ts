URIs($2); width: number; height: number; direction?: 'horizontal'|'vertical'; }
export interface NoiseOptions { type: 'perlin'|'simplex'|'worley'; width: number; height: number; octaves?: number; seed?: number; }

function hexToRgb(hex: string){ const m = hex.replace('#',''); const n = parseInt(m.length===3? m.split('').map(c=>c+c).join(''): m,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function lerp(a:number,b:number,t:number){ return a+(b-a)*t; }

// Minimal PNG encoder for RGBA using node canvas APIs would add deps; instead emit data URI from raw buffer using PNGjs only if present.
// To avoid deps, we output raw RGBA array as base64 JSON for now (consumer can convert). This keeps engine-agnostic purity.

export class TextureSynthManager {
	gradient(opts: GradientOptions){
		const w = opts.width, h = opts.height;
		const cols = opts.colors.map(hexToRgb);
		const data: number[] = [];
		for (let y=0;y<h;y++){
			for (let x=0;x<w;x++){
				const t = (opts.direction==='vertical'? y/(h-1||1): x/(w-1||1)) * (cols.length-1);
				const i0 = Math.floor(t), i1 = Math.min(cols.length-1, i0+1);
				const k = t - i0;
				const c0 = cols[i0], c1 = cols[i1];
				const r = Math.round(lerp(c0[0], c1[0], k));
				const g = Math.round(lerp(c0[1], c1[1], k));
				const b = Math.round(lerp(c0[2], c1[2], k));
				data.push(r,g,b,255);
			}
		}
		return { width:w, height:h, pixels: data 
    };
	}

	noise(opts: NoiseOptions){
		const w = opts.width, h = opts.height;
		const oct = opts.octaves ?? 4;
		const seed = (opts.seed ?? 1) >>> 0;
		function hash(ix:number,iy:number){ let v=(ix*374761393)^(iy*668265263)^seed; v=(v^(v>>>13))*1274126177; v=(v^(v>>>16))>>>0; return v/4294967296; }
		function smooth(t:number){ return t*t*(3-2*t); }
		function vnoise(x:number,y:number){
			const x0=Math.floor(x),y0=Math.floor(y),x1=x0+1,y1=y0+1; const sx=x-x0,sy=y-y0;
			const n00=hash(x0,y0), n10=hash(x1,y0), n01=hash(x0,y1), n11=hash(x1,y1);
			const ix0=n00+(n10-n00)*smooth(sx); const ix1=n01+(n11-n01)*smooth(sx);
			return ix0+(ix1-ix0)*smooth(sy);
		}
		const data:number[]=[];
		for(let y=0;y<h;y++){
			for(let x=0;x<w;x++){
				let n=0, amp=1, freq=1, maxA=0;
				for(let o=0;o<oct;o++){ n+=vnoise((x/w)*freq,(y/h)*freq)*amp; maxA+=amp; amp*=0.5; freq*=2; }
				n/=maxA; const v=Math.round(n*255); data.push(v,v,v,255);
			}
		}
		return { width:w, height:h, pixels: data 
    };
	}
}

export default TextureSynthManager;

