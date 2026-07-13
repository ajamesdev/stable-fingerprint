import type { SignalValue } from '../types';

/** Coerce a WebGL parameter into something JSON-serialisable. */
function readParam(gl: WebGLRenderingContext, key: number): SignalValue {
	const value = gl.getParameter(key);
	if (value == null) {
		return null;
	}
	if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
		return value;
	}
	// typed arrays, e.g. MAX_VIEWPORT_DIMS
	if (typeof (value as ArrayLike<number>).length === 'number') {
		return Array.from(value as ArrayLike<number>);
	}
	return String(value);
}

interface DebugRendererInfo {
	UNMASKED_VENDOR_WEBGL: number;
	UNMASKED_RENDERER_WEBGL: number;
}

/** WebGL/GPU fingerprint. Unmasked vendor + renderer name the actual GPU/driver
 * (very high entropy); limits and extensions vary by GPU/driver/browser. */
export function webgl(): SignalValue {
	const element = document.createElement('canvas');
	const gl = (element.getContext('webgl') ||
		element.getContext('experimental-webgl')) as WebGLRenderingContext | null;
	if (!gl) {
		throw new Error('WebGL is unavailable');
	}

	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as DebugRendererInfo | null;
	const vendor = debugInfo
		? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
		: gl.getParameter(gl.VENDOR);
	const renderer = debugInfo
		? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
		: gl.getParameter(gl.RENDERER);

	return {
		vendor: String(vendor),
		renderer: String(renderer),
		version: String(gl.getParameter(gl.VERSION)),
		shadingLanguageVersion: String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
		params: {
			maxTextureSize: readParam(gl, gl.MAX_TEXTURE_SIZE),
			maxCubeMapTextureSize: readParam(gl, gl.MAX_CUBE_MAP_TEXTURE_SIZE),
			maxRenderbufferSize: readParam(gl, gl.MAX_RENDERBUFFER_SIZE),
			maxViewportDims: readParam(gl, gl.MAX_VIEWPORT_DIMS),
			maxVertexAttribs: readParam(gl, gl.MAX_VERTEX_ATTRIBS),
			maxVaryingVectors: readParam(gl, gl.MAX_VARYING_VECTORS),
			maxVertexUniformVectors: readParam(gl, gl.MAX_VERTEX_UNIFORM_VECTORS),
			maxFragmentUniformVectors: readParam(gl, gl.MAX_FRAGMENT_UNIFORM_VECTORS),
			aliasedLineWidthRange: readParam(gl, gl.ALIASED_LINE_WIDTH_RANGE),
			aliasedPointSizeRange: readParam(gl, gl.ALIASED_POINT_SIZE_RANGE)
		},
		extensions: (gl.getSupportedExtensions() ?? []).slice().sort()
	};
}
