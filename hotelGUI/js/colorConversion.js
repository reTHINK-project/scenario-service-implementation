/*
 * Copyright [2015-2017] Fraunhofer Gesellschaft e.V., Institute for
 * Open Communication Systems (FOKUS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

function rgbToCIE_s(rgb) {
    if (!rgb) {
        return [1 / 3, 1 / 3];
    }
    return rgbToCIE(rgb[0], rgb[1], rgb[2]);
}

function rgbToCIE(r, g, b) {
    if (!r || !g || !b) {
        return [1 / 3, 1 / 3];
    }

    var red = (r > 0.04045) ? Math.pow((r + 0.055) / (1.0 + 0.055), 2.4) : (r / 12.92);
    var green = (g > 0.04045) ? Math.pow((g + 0.055) / (1.0 + 0.055), 2.4) : (g / 12.92);
    var blue = (b > 0.04045) ? Math.pow((b + 0.055) / (1.0 + 0.055), 2.4) : (b / 12.92);

    var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

    var x = X / (X + Y + Z);
    var y = Y / (X + Y + Z);

    return [x, y];
}


function cieToRGB_s(xy) {
    if (!xy) {
        return [255, 255, 255];
    }
    return cieToRGB(xy[0], xy[1]);
}

function cieToRGB(x, y) {
    if (!x || !y) {
        return [255, 255, 255];
    }
    var brightness = 1;
    var z = 1.0 - x - y;

    var Y = brightness; // The given brightness value
    var X = (Y / y) * x;
    var Z = (Y / y) * z;

    var r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    var g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    var b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    var max = Math.max(r, g, b);
    r /= max;
    g /= max;
    b /= max;

    r = (r <= 0.0031308) ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    g = (g <= 0.0031308) ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    b = (b <= 0.0031308) ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

    max = Math.max(r, g, b);
    r /= max;
    g /= max;
    b /= max;

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return [r, g, b];
}


function componentToHex(c) {
    if (!c) {
        return;
    }
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex_s(rgb) {
    if (!rgb) {
        return "#ffffff";
    }
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

function rgbToHex(r, g, b) {
    if (!r || !g || !b) {
        return "#ffffff"
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function hexToRgb(hex) {
    if (!hex) {
        return [255, 255, 255];
    }
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

var colorConversion = {
    rgbToCIE_s: rgbToCIE_s,
    rgbToCIE: rgbToCIE,
    cieToRGB_s: cieToRGB_s,
    cieToRGB: cieToRGB,
    componentToHex: componentToHex,
    rgbToHex_s: rgbToHex_s,
    rgbToHex: rgbToHex,
    hexToRgb: hexToRgb
};