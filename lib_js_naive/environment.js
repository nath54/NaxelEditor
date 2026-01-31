/**
 * Environment - Background/skybox configuration
 * Matches Python lib_python/environment.py
 */
class Environment {
    constructor(options = {}) {
        this.type = options.type || 'color';
        this.lightDiffusionStrength = options.lightDiffusionStrength || 1.0;
        this.lightAlgorithm = options.lightAlgorithm || 'none';
    }
}

class EnvironmentColor extends Environment {
    constructor(options = {}) {
        super(options);
        this.type = 'color';
        this.color = options.color || new Color(0, 0, 0, 0);
        this.lightEmission = options.lightEmission || 1.0;
    }
}

class EnvironmentSkyBox extends Environment {
    constructor(options = {}) {
        super(options);
        this.type = 'skybox';
        this.skyColor = options.skyColor || new Color(135, 206, 235);
        this.skyColorLightEmission = options.skyColorLightEmission || 0.1;
        this.groundColor = options.groundColor || new Color(30, 77, 43);
        this.groundColorLightEmission = options.groundColorLightEmission || 0.0;
        this.sunDirection = options.sunDirection || new Vec3(0, -1, 0);
        this.sunLightEmission = options.sunLightEmission || 1.0;
    }
}

/**
 * Parse environment from JSON
 * @param {object} json - JSON object
 * @returns {Environment}
 */
function parseEnvironment(json) {
    const type = json.environment_type || 'color';
    const lightDiffusionStrength = json.light_diffusion_strength || 1.0;
    const lightAlgorithm = json.light_algorithm || 'none';

    if (type === 'skybox') {
        return new EnvironmentSkyBox({
            lightDiffusionStrength,
            lightAlgorithm,
            skyColor: parseColor(json.sky_color || '#87CEEB'),
            skyColorLightEmission: json.sky_color_light_emission || 0.1,
            groundColor: parseColor(json.ground_color || '#1E4D2B'),
            groundColorLightEmission: json.ground_color_light_emission || 0.0,
            sunDirection: parseVec3(json.sun_direction || [0, -1, 0]),
            sunLightEmission: json.sun_light_emission || 1.0,
        });
    }

    return new EnvironmentColor({
        lightDiffusionStrength,
        lightAlgorithm,
        color: parseColor(json.environment_color || [0, 0, 0, 0]),
        lightEmission: json.environment_color_light_emission || 1.0,
    });
}

// Expose to window
window.Environment = Environment;
window.EnvironmentColor = EnvironmentColor;
window.EnvironmentSkyBox = EnvironmentSkyBox;
window.parseEnvironment = parseEnvironment;
